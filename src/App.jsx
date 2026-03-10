import { useState, useEffect, useCallback, useMemo } from 'react';
import { Icons } from './components/Icons';
import TimerView from './components/TimerView';
import SubjectCard from './components/SubjectCard';
import Modal from './components/Modal';
import { useTimer } from './hooks/useTimer';
import { initialSubjects, getRemainingDays, COLOR_KEYS, colorStringForKey } from './utils/constants';
import { formatHoursMins, getTodayKey } from './utils/helpers';
import { loadData, saveData, calculateStreak } from './utils/storage';

// ==========================================
// MAIN APPLICATION COMPONENT
// ==========================================
export default function App() {
  // --- Data State (loaded from localStorage) ---
  const [subjects, setSubjects] = useState(() => {
    const saved = loadData();
    return saved?.subjects || initialSubjects;
  });

  const [dailyLog, setDailyLog] = useState(() => {
    const saved = loadData();
    return saved?.dailyLog || {};
  });

  const [activeSubject, setActiveSubject] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');

  // --- Today tracking ---
  const [todayKey, setTodayKey] = useState(getTodayKey());
  const todayStudiedSeconds = dailyLog[todayKey] || 0;

  // --- Streak (computed from daily log) ---
  const streak = useMemo(() => calculateStreak(dailyLog), [dailyLog]);

  // --- Remaining days (dynamic) ---
  const remainingDays = useMemo(() => getRemainingDays(), []);

  // --- Modals State ---
  const [editingSubject, setEditingSubject] = useState(null);
  const [editFormData, setEditFormData] = useState({ goalHours: 0, studiedH: 0, studiedM: 0 });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSubjectData, setNewSubjectData] = useState({ name: '', goalHours: 50 });

  // --- Timer callbacks (used by useTimer hook) ---
  const onTickFocus = useCallback(() => {
    if (!activeSubject) return;
    setSubjects(prev => {
      if (!prev[activeSubject]) return prev;
      return {
        ...prev,
        [activeSubject]: {
          ...prev[activeSubject],
          studiedSeconds: prev[activeSubject].studiedSeconds + 1,
        },
      };
    });
    setDailyLog(prev => {
      const key = getTodayKey();
      return { ...prev, [key]: (prev[key] || 0) + 1 };
    });
  }, [activeSubject]);

  const onSessionComplete = useCallback(() => {
    if (!activeSubject) return;
    setSubjects(prev => {
      if (!prev[activeSubject]) return prev;
      return {
        ...prev,
        [activeSubject]: {
          ...prev[activeSubject],
          sessions: prev[activeSubject].sessions + 1,
        },
      };
    });
  }, [activeSubject]);

  // --- Timer Hook ---
  const timer = useTimer({ activeSubject, onTickFocus, onSessionComplete });

  // --- Persist to localStorage on data changes ---
  useEffect(() => {
    saveData({ subjects, dailyLog });
  }, [subjects, dailyLog]);

  // --- Check for day change (reset todayKey) ---
  useEffect(() => {
    const interval = setInterval(() => {
      const currentKey = getTodayKey();
      if (currentKey !== todayKey) {
        setTodayKey(currentKey);
      }
    }, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [todayKey]);

  // --- Request notification permission ---
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // --- Global Keyboard Listener ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && currentView === 'timer') {
        setCurrentView('dashboard');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView]);

  // ==========================================
  // ACTIONS
  // ==========================================
  const handleSubjectClick = (subj) => {
    // Warn if switching subject while timer is running
    if (timer.isRunning && activeSubject && activeSubject !== subj) {
      if (!window.confirm(`المؤقت يعمل حالياً على "${activeSubject}". هل تريد الانتقال إلى "${subj}"؟`)) {
        return;
      }
      timer.resetTimer();
    }
    setActiveSubject(subj);
    if (!timer.isRunning) timer.changeMode('focus');
    setCurrentView('timer');
  };

  // --- CRUD Operations ---
  const openEditModal = (subjName, e) => {
    e.stopPropagation();
    const data = subjects[subjName];
    if (!data) return;
    setEditingSubject(subjName);
    setEditFormData({
      goalHours: data.goalHours,
      studiedH: Math.floor(data.studiedSeconds / 3600),
      studiedM: Math.floor((data.studiedSeconds % 3600) / 60),
    });
  };

  const saveSubjectSettings = () => {
    const totalStudiedSeconds =
      (parseInt(editFormData.studiedH) || 0) * 3600 +
      (parseInt(editFormData.studiedM) || 0) * 60;
    setSubjects(prev => ({
      ...prev,
      [editingSubject]: {
        ...prev[editingSubject],
        goalHours: Math.max(1, parseInt(editFormData.goalHours) || 1),
        studiedSeconds: totalStudiedSeconds,
      },
    }));
    setEditingSubject(null);
  };

  const deleteSubject = () => {
    if (!window.confirm(`تحذير: سيتم حذف "${editingSubject}" وبياناتها الزمنية نهائياً.`)) return;
    const updatedSubjects = { ...subjects };
    delete updatedSubjects[editingSubject];
    setSubjects(updatedSubjects);
    if (activeSubject === editingSubject) {
      timer.resetTimer();
      setActiveSubject(null);
      setCurrentView('dashboard'); // FIX: navigate away from timer if active subject deleted
    }
    setEditingSubject(null);
  };

  const addNewSubject = () => {
    const name = newSubjectData.name.trim();
    if (!name || subjects[name]) {
      if (subjects[name]) alert('هذه المادة موجودة بالفعل!');
      return;
    }
    const randomKey = COLOR_KEYS[Math.floor(Math.random() * COLOR_KEYS.length)];
    setSubjects(prev => ({
      ...prev,
      [name]: {
        goalHours: Math.max(1, parseInt(newSubjectData.goalHours) || 50),
        studiedSeconds: 0,
        sessions: 0,
        color: colorStringForKey(randomKey),
      },
    }));
    setNewSubjectData({ name: '', goalHours: 50 });
    setIsAddModalOpen(false);
  };

  // ==========================================
  // RENDERERS
  // ==========================================

  // --- VIEW 1: TIMER ---
  if (currentView === 'timer' && activeSubject) {
    return (
      <TimerView
        activeSubject={activeSubject}
        studiedSeconds={subjects[activeSubject]?.studiedSeconds || 0}
        timer={timer}
        onClose={() => setCurrentView('dashboard')}
      />
    );
  }

  // --- VIEW 2: DASHBOARD ---
  return (
    <div dir="rtl" className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col p-4 md:p-6 lg:p-8 gap-8 selection:bg-blue-200">
      {/* Header */}
      <header className="w-full max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center shadow-md">
            <span className="text-white font-black text-xl">يـ</span>
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">غرفة عمليات يحيى</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold px-2 py-1 bg-red-50 text-red-700 rounded-lg border border-red-100">هدف: 99%</span>
              <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-700 rounded-lg">متبقي: {remainingDays} يوم</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          {/* Active timer indicator */}
          {timer.isRunning && activeSubject && (
            <button
              onClick={() => setCurrentView('timer')}
              className="flex-1 md:flex-none bg-emerald-50 px-5 py-3 rounded-2xl flex items-center gap-3 border border-emerald-100 shadow-sm transition-all hover:bg-emerald-100 animate-pulse"
              aria-label="العودة للمؤقت"
            >
              <div className="p-2 bg-emerald-500 rounded-xl text-white shadow-md"><Icons.Play /></div>
              <div className="text-right">
                <div className="text-[11px] font-bold text-emerald-700 mb-0.5">المؤقت يعمل</div>
                <div className="font-black text-emerald-900 leading-none text-sm">{activeSubject}</div>
              </div>
            </button>
          )}

          {/* Streak */}
          <div className="flex-1 md:flex-none bg-orange-50 px-5 py-3 rounded-2xl flex items-center gap-3 border border-orange-100 shadow-sm transition-transform hover:scale-105">
            <div className="p-2.5 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl text-white shadow-md"><Icons.Fire /></div>
            <div>
              <div className="text-[11px] font-bold text-orange-700 mb-0.5 opacity-80">سلسلة الاستمرار</div>
              <div className="font-black text-slate-900 leading-none text-xl">
                {streak} <span className="text-sm font-bold text-slate-500">{streak === 1 ? 'يوم' : 'أيام'}</span>
              </div>
            </div>
          </div>

          {/* Today's study time */}
          <div className="flex-1 md:flex-none bg-blue-50 px-5 py-3 rounded-2xl flex items-center gap-3 border border-blue-100 shadow-sm transition-transform hover:scale-105">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white shadow-md"><Icons.Activity /></div>
            <div>
              <div className="text-[11px] font-bold text-blue-700 mb-0.5 opacity-80">إنجاز اليوم</div>
              <div className="font-black text-slate-900 leading-none text-xl">
                {todayStudiedSeconds === 0 ? '0m' : formatHoursMins(todayStudiedSeconds)}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Grid */}
      <main className="w-full max-w-7xl mx-auto flex-1">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 px-2 gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">المقـررات الدراسـية</h2>
            <p className="text-sm text-slate-500 mt-1 font-bold">
              اضغط على المادة للدخول إلى غرفة العزل العميق (إجمالي {Object.keys(subjects).length} مادة)
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 px-5 py-3 rounded-xl transition-colors flex items-center gap-2 shadow-md w-full md:w-auto justify-center"
            aria-label="إضافة مادة جديدة"
          >
            <Icons.Plus /> إضافة مادة جديدة
          </button>
        </div>

        {Object.keys(subjects).length === 0 ? (
          <div className="bg-white rounded-[2rem] p-12 text-center border border-slate-200 border-dashed">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <Icons.Plus />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">لا يوجد مقررات مسجلة</h3>
            <p className="text-slate-500 font-medium mb-6">قم بإضافة موادك الدراسية للبدء في تتبع الإنجاز.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Object.entries(subjects).map(([name, data]) => (
              <SubjectCard
                key={name}
                name={name}
                data={data}
                isActive={name === activeSubject}
                isTimerRunning={timer.isRunning}
                onSubjectClick={handleSubjectClick}
                onEdit={openEditModal}
              />
            ))}
          </div>
        )}
      </main>

      {/* Add Subject Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="إضافة مادة دراسية جديدة"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors"
            >
              إلغاء
            </button>
            <button
              onClick={addNewSubject}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors"
            >
              إضافة المادة
            </button>
          </div>
        }
      >
        <div>
          <label htmlFor="add-subject-name" className="block text-sm font-bold text-slate-700 mb-2">اسم المادة</label>
          <input
            id="add-subject-name"
            type="text"
            value={newSubjectData.name}
            onChange={(e) => setNewSubjectData({ ...newSubjectData, name: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            placeholder="مثال: الفيزياء"
          />
        </div>
        <div>
          <label htmlFor="add-subject-hours" className="block text-sm font-bold text-slate-700 mb-2">الهدف الإجمالي (ساعات)</label>
          <input
            id="add-subject-hours"
            type="number"
            min="1"
            value={newSubjectData.goalHours}
            onChange={(e) => setNewSubjectData({ ...newSubjectData, goalHours: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
        </div>
      </Modal>

      {/* Edit Subject Modal */}
      <Modal
        isOpen={!!editingSubject}
        onClose={() => setEditingSubject(null)}
        title={`إعدادات: ${editingSubject || ''}`}
        footer={
          <div className="flex justify-between gap-3">
            <button
              onClick={deleteSubject}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center gap-2"
            >
              <Icons.Trash /> حذف المادة
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => setEditingSubject(null)}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={saveSubjectSettings}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors"
              >
                حفظ
              </button>
            </div>
          </div>
        }
      >
        <div>
          <label htmlFor="edit-goal-hours" className="block text-sm font-bold text-slate-700 mb-2">الهدف الإجمالي (ساعات)</label>
          <input
            id="edit-goal-hours"
            type="number"
            min="1"
            value={editFormData.goalHours}
            onChange={(e) => setEditFormData({ ...editFormData, goalHours: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">ما تم إنجازه مسبقاً (إدخال يدوي)</label>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <input
                id="edit-studied-h"
                type="number"
                min="0"
                value={editFormData.studiedH}
                onChange={(e) => setEditFormData({ ...editFormData, studiedH: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-4 pl-12 py-3 text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                aria-label="ساعات الدراسة المنجزة"
              />
              <span className="absolute left-4 top-3 text-slate-400 text-sm font-medium">ساعة</span>
            </div>
            <div className="flex-1 relative">
              <input
                id="edit-studied-m"
                type="number"
                min="0"
                max="59"
                value={editFormData.studiedM}
                onChange={(e) => setEditFormData({ ...editFormData, studiedM: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-4 pl-12 py-3 text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                aria-label="دقائق الدراسة المنجزة"
              />
              <span className="absolute left-4 top-3 text-slate-400 text-sm font-medium">دقيقة</span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
