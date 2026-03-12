import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Icons } from './Icons';
import { parseTimezoneOffset, getTodayKey } from '../utils/helpers';
import { clearUserData } from '../utils/storage';

export default function SettingsPage({
  userProfile,
  setUserProfile,
  dailyGoal,
  setDailyGoal,
  user,
  onLogout,
  onDeleteAccount,
}) {
  const { isDark } = useTheme();

  // Local state for the form so we don't update parent on every keystroke
  const [formData, setFormData] = useState({
    name: userProfile?.name || '',
    examDate: userProfile?.examDate || '',
    timezone: userProfile?.timezone || 'auto',
    dailyGoal: dailyGoal || 3,
  });

  // Sync local form state when props change externally
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData({
      name: userProfile?.name || '',
      examDate: userProfile?.examDate || '',
      timezone: userProfile?.timezone || 'auto',
      dailyGoal: dailyGoal || 3,
    });
  }, [userProfile, dailyGoal]);

  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setUserProfile({
      name: formData.name.trim() || 'طالب',
      examDate: formData.examDate,
      timezone: formData.timezone || 'auto',
    });
    setDailyGoal(Math.max(1, parseInt(formData.dailyGoal) || 1));
    
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleClearData = async () => {
    if (window.confirm('هل أنت متأكد من حذف جميع بياناتك (المواد، السجل، وساعات الدراسة)؟ لا يمكن التراجع عن هذا الإجراء.')) {
      if (window.confirm('تأكيد أخير: سيتم مسح كل شيء!')) {
        window.isClearingData = true; // Prevent App.jsx from saving state on reload
        localStorage.removeItem('apex-tracker-data');
        if (user?.uid) await clearUserData(user.uid);
        window.location.reload();
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('الإجراء خطير جداً: هل أنت متأكد من أنك تريد حذف حسابك نهائياً بجميع بياناته؟ لا يمكن استعادة الحساب بعد الحذف.')) {
      if (window.confirm('تأكيد أخير: سيتم مسح حسابك، وبياناتك، ولا يمكنك التراجع. هل تريد الاستمرار بالفعل؟')) {
        // Firebase requires recent login to delete an account (within ~5 minutes).
        const lastSignInDate = new Date(user?.metadata?.lastSignInTime || 0);
        const diffMinutes = (new Date() - lastSignInDate) / (1000 * 60);

        if (diffMinutes > 5) {
          alert('لأسباب أمنية، يتطلب حذف الحساب أن تكون قد سجلت دخولك للتو (قبل 5 دقائق كحد أقصى).\n\nسنقوم بتسجيل خروجك الآن، يرجى إعادة تسجيل الدخول والمحاولة فوراً.');
          onLogout();
          return;
        }

        window.isClearingData = true; // Prevent App.jsx from saving state on reload

        // Clear data from Firestore first so we don't leave orphaned document
        if (user?.uid) await clearUserData(user.uid);
        
        // Remove locally cached data
        localStorage.removeItem('apex-tracker-data');
        
        // Delete the Firebase Auth User
        const result = await onDeleteAccount();
        if (!result.success) {
          alert('تعذر حذف الحساب: ' + result.error);
        }
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

      {/* Account info */}
      {user && (
        <div className="rounded-2xl border p-4 relative z-10 flex items-center justify-between gap-3"
          style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-zinc-500/10 rounded-xl" style={{ color: 'var(--c-text-muted)' }}>
              <Icons.User />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--c-text-faint)' }}>الحساب المسجّل</div>
              <div className="text-sm font-medium truncate" dir="ltr" style={{ color: 'var(--c-text)' }}>
                {user.email || 'Google Account'}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all hover:bg-red-500/10 hover:text-red-400"
            style={{ color: 'var(--c-text-faint)' }}
          >
            <Icons.LogOut /> 
            <span className="hidden sm:inline">تسجيل الخروج</span>
          </button>
        </div>
      )}

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
            <div>
              <label htmlFor="exam-date" className={labelCls} style={labelStyle}>تاريخ بداية الامتحانات</label>
              <input
                id="exam-date"
                type="date"
                min={getTodayKey(formData.timezone || 'auto')}
                value={formData.examDate}
                onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                className={inputCls}
                style={inputStyle}
                required
              />
              <p className="text-xs mt-2" style={{ color: 'var(--c-text-faint)' }}>
                يستخدم لنظام العد التنازلي وحساب الاستمرارية وأيام المذاكرة المتبقية.
              </p>
            </div>

            {/* Timezone Input */}
            <div>
              <label htmlFor="timezone" className={labelCls} style={labelStyle}>المنطقة الزمنية</label>
              <select
                id="timezone"
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className={inputCls}
                style={inputStyle}
              >
                <option value="auto">تلقائي (حسب نظام جهازك)</option>
                <option value="UTC-12">توقيت هاواي (UTC-12)</option>
                <option value="UTC-8">توقيت المحيط الهادئ (UTC-8)</option>
                <option value="UTC-5">توقيت الساحل الشرقي لأمريكا (UTC-5)</option>
                <option value="UTC+0">توقيت جرينتش / لندن (UTC+0)</option>
                <option value="UTC+1">توقيت وسط أوروبا / المغرب (UTC+1)</option>
                <option value="UTC+2">توقيت شرق أوروبا / مصر (UTC+2)</option>
                <option value="UTC+3">توقيت السعودية / مكة المكرمة (UTC+3)</option>
                <option value="UTC+4">توقيت الإمارات العربية المتحدة (UTC+4)</option>
                <option value="UTC+5:30">توقيت الهند (UTC+5:30)</option>
                <option value="UTC+8">توقيت الصين / ماليزيا (UTC+8)</option>
                <option value="UTC+9">توقيت اليابان (UTC+9)</option>
                <option value="UTC+11">توقيت أستراليا (UTC+11)</option>
              </select>
              <p className="text-xs mt-2" style={{ color: 'var(--c-text-faint)' }}>
                لتحديد موعد بدء واستئناف يومك الدراسي، يؤثر على الاستمرارية.
              </p>
              {(() => {
                const offsetMins = parseTimezoneOffset(userProfile?.timezone);
                const sign = offsetMins >= 0 ? '+' : '-';
                const absH = Math.floor(Math.abs(offsetMins) / 60);
                const absM = Math.abs(offsetMins) % 60;
                const label = `UTC${sign}${absH}${absM ? ':' + String(absM).padStart(2, '0') : ''}`;
                return (
                  <div className="mt-2.5 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium"
                    style={{ backgroundColor: 'var(--c-elevated)', color: 'var(--c-text-sub)' }}
                  >
                    <Icons.Timer />
                    <span>المنطقة الزمنية المستخدمة حالياً: <strong className="font-bold" style={{ color: 'var(--c-text)' }}>{label}</strong></span>
                  </div>
                );
              })()}
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

        <div className="flex flex-col sm:flex-row gap-3 mt-5">
          <button
            onClick={handleClearData}
            className="px-6 py-3 rounded-xl text-sm font-semibold text-red-500 bg-red-500/10 hover:bg-red-500/20 ring-1 ring-red-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Icons.RotateCcw /> مسح جميع البيانات فقط
          </button>
          
          <button
            onClick={handleDeleteAccount}
            className="px-6 py-3 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-500 shadow-sm shadow-red-600/15 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Icons.Trash /> حذف الحساب نهائياً
          </button>
        </div>
      </div>
    </div>
  );
}
