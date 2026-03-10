import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Icons } from './Icons';

export default function SettingsPage({
  userProfile,
  setUserProfile,
  dailyGoal,
  setDailyGoal,
}) {
  const { isDark } = useTheme();

  // Local state for the form so we don't update parent on every keystroke
  const [formData, setFormData] = useState({
    name: userProfile?.name || 'يحيى',
    examDate: userProfile?.examDate || '2026-06-06',
    dailyGoal: dailyGoal || 3,
  });

  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setUserProfile({
      name: formData.name.trim() || 'طالب',
      examDate: formData.examDate || '2026-06-06',
    });
    setDailyGoal(Math.max(1, parseInt(formData.dailyGoal) || 1));
    
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleClearData = () => {
    if (window.confirm('هل أنت متأكد من حذف جميع بياناتك (المواد، السجل، وساعات الدراسة)؟ لا يمكن التراجع عن هذا الإجراء.')) {
      if (window.confirm('تأكيد أخير: سيتم مسح كل شيء!')) {
        localStorage.removeItem('apex-tracker-data'); // Keeps theme settings
        window.location.reload();
      }
    }
  };

  const labelCls = "block text-sm font-semibold mb-2";
  const labelStyle = { color: 'var(--c-text-sub)' };
  const inputCls = "w-full rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 outline-none transition-all border";
  const inputStyle = { backgroundColor: 'var(--c-input)', borderColor: 'var(--c-border)', color: 'var(--c-text)' };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in relative">
      {/* Decorative glow */}
      <div className="absolute top-10 left-10 w-64 h-64 rounded-full blur-[100px] pointer-events-none" style={{ backgroundColor: 'var(--c-glow-violet)' }} />

      <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-6 flex items-center gap-3" style={{ color: 'var(--c-text)' }}>
        <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-500">
          <Icons.Settings />
        </div>
        الإعدادات الشخصية
      </h2>

      <div className="rounded-2xl border p-6 md:p-8 relative z-10 shadow-sm"
        style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name Input */}
            <div>
              <label htmlFor="student-name" className={labelCls} style={labelStyle}>الاسم الشخصي</label>
              <input
                id="student-name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={inputCls}
                style={inputStyle}
                placeholder="أدخل اسمك هنا"
                required
              />
            </div>

            {/* Daily Goal Input */}
            <div>
              <label htmlFor="daily-goal" className={labelCls} style={labelStyle}>الهدف اليومي (ساعات)</label>
              <input
                id="daily-goal"
                type="number"
                min="1"
                max="24"
                value={formData.dailyGoal}
                onChange={(e) => setFormData({ ...formData, dailyGoal: e.target.value })}
                className={inputCls}
                style={inputStyle}
                required
              />
            </div>

            {/* Exam Date Input */}
            <div className="md:col-span-2">
              <label htmlFor="exam-date" className={labelCls} style={labelStyle}>تاريخ بداية الامتحانات</label>
              <input
                id="exam-date"
                type="date"
                value={formData.examDate}
                onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                className={inputCls}
                style={inputStyle}
                required
              />
              <p className="text-xs mt-2" style={{ color: 'var(--c-text-faint)' }}>
                يستخدم لنظام العد التنازلي في الشريط الجانبي ولوحة التحكم.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderColor: 'var(--c-border)' }}>
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3 rounded-xl text-sm font-semibold text-white bg-violet-600 hover:bg-violet-500 shadow-sm shadow-violet-600/15 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Icons.Check />
              {isSaved ? 'تم الحفظ بنجاح!' : 'حفظ التغييرات'}
            </button>
            {isSaved && (
              <span className="text-sm font-medium text-emerald-500 animate-fade-in">
                تم تحديث الإعدادات!
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="mt-8 rounded-2xl border border-red-500/20 p-6 md:p-8 relative z-10"
        style={{ backgroundColor: isDark ? 'rgba(239, 68, 68, 0.02)' : 'rgba(239, 68, 68, 0.04)' }}
      >
        <h3 className="text-lg font-bold text-red-500 mb-2 flex items-center gap-2">
          <Icons.Wrench /> منطقة الخطر (Danger Zone)
        </h3>
        <p className="text-sm font-medium mb-5" style={{ color: 'var(--c-text-muted)' }}>
          هذه الإجراءات لا يمكن التراجع عنها. يرجى توخي الحذر عند استخدامها.
        </p>

        <button
          onClick={handleClearData}
          className="px-6 py-3 rounded-xl text-sm font-semibold text-red-500 bg-red-500/10 hover:bg-red-500/20 ring-1 ring-red-500/20 transition-all flex items-center gap-2"
        >
          <Icons.Trash /> مسح جميع بيانات التطبيق
        </button>
      </div>
    </div>
  );
}
