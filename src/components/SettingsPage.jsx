import { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Icons } from './Icons';
import {
  getTodayKey,
  getTimeZoneOffsetLabel,
  normalizeTimeZone,
  normalizeTimeZoneSelection,
  TIMEZONE_OPTIONS,
} from '../utils/helpers';
import { clearLocalData, clearUserData, loadData, saveData, saveUserData } from '../utils/storage';

function buildFormData(userProfile, dailyGoal) {
  return {
    name: userProfile?.name || '',
    examDate: userProfile?.examDate || '',
    timezone: normalizeTimeZoneSelection(userProfile?.timezone),
    dailyGoal: dailyGoal || 3,
  };
}

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
  const [formData, setFormData] = useState(() => buildFormData(userProfile, dailyGoal));
  const [isSaved, setIsSaved] = useState(false);
  const [isDangerActionRunning, setIsDangerActionRunning] = useState(false);

  useEffect(() => {
    setFormData(buildFormData(userProfile, dailyGoal));
  }, [userProfile, dailyGoal]);

  const handleSubmit = (e) => {
    e.preventDefault();

    setUserProfile({
      name: formData.name.trim() || 'طالب',
      examDate: formData.examDate,
      timezone: normalizeTimeZoneSelection(formData.timezone),
    });
    setDailyGoal(Math.max(1, Number.parseInt(formData.dailyGoal, 10) || 1));

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleClearData = async () => {
    if (isDangerActionRunning) return;

    const firstConfirm = window.confirm('هل أنت متأكد من حذف جميع بياناتك (المواد، السجل، وساعات الدراسة)؟ لا يمكن التراجع عن هذا الإجراء.');
    if (!firstConfirm) return;

    const secondConfirm = window.confirm('تأكيد أخير: سيتم مسح كل شيء من هذا الحساب.');
    if (!secondConfirm) return;

    setIsDangerActionRunning(true);
    window.isClearingData = true;

    try {
      const cloudCleared = user?.uid ? await clearUserData(user.uid) : true;
      if (!cloudCleared) {
        throw new Error('تعذر مسح البيانات السحابية الآن. تم إلغاء العملية لحماية بياناتك.');
      }

      clearLocalData(user?.uid);
      window.location.reload();
    } catch (error) {
      window.isClearingData = false;
      setIsDangerActionRunning(false);
      alert(error.message || 'تعذر مسح البيانات الآن. حاول مرة أخرى.');
    }
  };

  const handleDeleteAccount = async () => {
    if (isDangerActionRunning) return;

    const firstConfirm = window.confirm('الإجراء خطير جداً: هل أنت متأكد من أنك تريد حذف حسابك نهائياً بجميع بياناته؟ لا يمكن استعادة الحساب بعد الحذف.');
    if (!firstConfirm) return;

    const secondConfirm = window.confirm('تأكيد أخير: سيتم حذف حسابك وبياناتك نهائياً. هل تريد الاستمرار بالفعل؟');
    if (!secondConfirm) return;

    const lastSignInDate = new Date(user?.metadata?.lastSignInTime || 0);
    const diffMinutes = (Date.now() - lastSignInDate.getTime()) / (1000 * 60);

    if (diffMinutes > 5) {
      alert('لأسباب أمنية، يتطلب حذف الحساب أن تكون قد سجلت دخولك للتو (خلال آخر 5 دقائق).\n\nسيتم تسجيل خروجك الآن. أعد تسجيل الدخول ثم حاول مرة أخرى مباشرة.');
      onLogout();
      return;
    }

    const localBackup = loadData(user?.uid);

    setIsDangerActionRunning(true);
    window.isClearingData = true;

    try {
      const cloudCleared = user?.uid ? await clearUserData(user.uid) : true;
      if (!cloudCleared) {
        throw new Error('تعذر حذف بيانات Firestore الآن، لذلك تم إيقاف حذف الحساب لحماية البيانات.');
      }

      clearLocalData(user?.uid);

      const result = await onDeleteAccount();
      if (result.success) {
        return;
      }

      if (localBackup) {
        saveData(localBackup, user?.uid);

        if (user?.uid) {
          const restoredInCloud = await saveUserData(user.uid, localBackup);
          if (!restoredInCloud) {
            throw new Error('فشل حذف الحساب وتمت استعادة الكاش المحلي فقط. تحقق من الاتصال ثم حاول مرة أخرى.');
          }
        }
      }

      throw new Error(result.error || 'تعذر حذف الحساب.');
    } catch (error) {
      window.isClearingData = false;
      setIsDangerActionRunning(false);
      alert(error.message || 'تعذر حذف الحساب الآن. حاول مرة أخرى.');
    }
  };

  const labelCls = 'block text-sm font-semibold mb-2';
  const labelStyle = { color: 'var(--c-text-sub)' };
  const inputCls = 'w-full rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 outline-none transition-all border';
  const inputStyle = { backgroundColor: 'var(--c-input)', borderColor: 'var(--c-border)', color: 'var(--c-text)' };
  const selectedTimeZone = normalizeTimeZoneSelection(formData.timezone);
  const activeTimeZone = normalizeTimeZone(selectedTimeZone);
  const activeOffsetLabel = getTimeZoneOffsetLabel(selectedTimeZone);
  const selectedTimeZoneLabel = TIMEZONE_OPTIONS.find((option) => option.value === selectedTimeZone)?.label || activeTimeZone;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in relative">
      <div className="absolute top-10 left-10 w-64 h-64 rounded-full blur-[100px] pointer-events-none" style={{ backgroundColor: 'var(--c-glow-violet)' }} />

      <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-6 flex items-center gap-3" style={{ color: 'var(--c-text)' }}>
        <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-500">
          <Icons.Settings />
        </div>
        الإعدادات الشخصية
      </h2>

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
            disabled={isDangerActionRunning}
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

            <div>
              <label htmlFor="exam-date" className={labelCls} style={labelStyle}>تاريخ بداية الامتحانات</label>
              <input
                id="exam-date"
                type="date"
                min={getTodayKey(selectedTimeZone)}
                value={formData.examDate}
                onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                className={inputCls}
                style={inputStyle}
                required
              />
              <p className="text-xs mt-2" style={{ color: 'var(--c-text-faint)' }}>
                يُستخدم للعدّ التنازلي وحساب المطلوب يومياً بدقة حسب المنطقة الزمنية المختارة.
              </p>
            </div>

            <div>
              <label htmlFor="timezone" className={labelCls} style={labelStyle}>المنطقة الزمنية</label>
              <select
                id="timezone"
                value={selectedTimeZone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className={inputCls}
                style={inputStyle}
              >
                {TIMEZONE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <p className="text-xs mt-2" style={{ color: 'var(--c-text-faint)' }}>
                نستخدم مناطق IANA الحقيقية حتى يحسب التطبيق بداية اليوم و DST بشكل صحيح.
              </p>
              <div className="mt-2.5 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium"
                style={{ backgroundColor: 'var(--c-elevated)', color: 'var(--c-text-sub)' }}
              >
                <Icons.Timer />
                <span>
                  المنطقة المستخدمة حالياً: <strong className="font-bold" style={{ color: 'var(--c-text)' }}>{selectedTimeZoneLabel}</strong>
                  {' · '}
                  <strong className="font-bold" style={{ color: 'var(--c-text)' }}>{activeOffsetLabel}</strong>
                  {' · '}
                  <span dir="ltr">{activeTimeZone}</span>
                </span>
              </div>
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

      <div className="mt-8 rounded-2xl border border-red-500/20 p-6 md:p-8 relative z-10"
        style={{ backgroundColor: isDark ? 'rgba(239, 68, 68, 0.02)' : 'rgba(239, 68, 68, 0.04)' }}
      >
        <h3 className="text-lg font-bold text-red-500 mb-2 flex items-center gap-2">
          <Icons.Wrench /> منطقة الخطر (Danger Zone)
        </h3>
        <p className="text-sm font-medium mb-5" style={{ color: 'var(--c-text-muted)' }}>
          هذه الإجراءات لا يمكن التراجع عنها. سنوقف العملية تلقائياً إذا فشل حذف البيانات السحابية أو حذف الحساب.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mt-5">
          <button
            onClick={handleClearData}
            className="px-6 py-3 rounded-xl text-sm font-semibold text-red-500 bg-red-500/10 hover:bg-red-500/20 ring-1 ring-red-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={isDangerActionRunning}
          >
            <Icons.RotateCcw /> مسح جميع البيانات فقط
          </button>

          <button
            onClick={handleDeleteAccount}
            className="px-6 py-3 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-500 shadow-sm shadow-red-600/15 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={isDangerActionRunning}
          >
            <Icons.Trash /> حذف الحساب نهائياً
          </button>
        </div>
      </div>
    </div>
  );
}
