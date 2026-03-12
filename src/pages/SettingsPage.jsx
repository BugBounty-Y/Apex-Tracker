import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icons } from '../components/Icons';
import PageHeader from '../components/ui/PageHeader';
import SectionCard from '../components/ui/SectionCard';
import StatusBadge from '../components/ui/StatusBadge';
import { useAppData } from '../contexts/AppDataContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/ToastProvider';
import { useConfirm } from '../components/ui/ConfirmDialogProvider';
import {
  TIMEZONE_OPTIONS,
  getTimeZoneOffsetLabel,
  getTodayKey,
  normalizeTimeZoneSelection,
} from '../utils/helpers';
import {
  clearLocalData,
  clearUserData,
  saveData,
  saveUserData,
} from '../utils/storage';

function ToggleRow({ icon, title, description, checked, onChange }) {
  return (
    <label
      className="app-panel-muted flex cursor-pointer items-start justify-between gap-4 p-4 transition-colors hover:bg-[var(--c-surface-hover)]"
    >
      <div className="flex items-start gap-3 text-right">
        <div className="rounded-[var(--radius-md)] p-2.5 shrink-0" style={{ backgroundColor: 'var(--c-accent-soft)', color: 'var(--c-nav-active)' }}>
          {icon}
        </div>
        <div>
          <div className="text-[13px] font-semibold">{title}</div>
          <div className="mt-0.5 text-[11px] leading-5" style={{ color: 'var(--c-text-muted)' }}>
            {description}
          </div>
        </div>
      </div>
      <div className="pt-1 shrink-0">
        <span
          className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
          style={{ backgroundColor: checked ? 'var(--c-accent)' : 'var(--c-elevated)' }}
        >
          <span
            className="absolute h-4.5 w-4.5 rounded-full bg-white shadow-sm transition-transform"
            style={{ transform: checked ? 'translateX(-22px)' : 'translateX(-3px)', width: '18px', height: '18px' }}
          />
        </span>
        <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
      </div>
    </label>
  );
}

function NumberField({ label, value, onChange, min = 0, max, suffix = '' }) {
  return (
    <label className="text-right">
      <span className="app-label">{label}</span>
      <div className="relative">
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={onChange}
          className="app-control"
          style={{ backgroundColor: 'var(--c-input)', borderColor: 'var(--c-border)', color: 'var(--c-text)' }}
        />
        {suffix && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold" style={{ color: 'var(--c-text-faint)' }}>
            {suffix}
          </span>
        )}
      </div>
    </label>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout, deleteAccount } = useAuth();
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const {
    appData,
    syncStatus,
    updateProfile,
    updateGoals,
    updateNotificationSettings,
    updatePomodoroSettings,
    exportBackup,
    importBackup,
    resetAllData,
    waitForPendingSync,
  } = useAppData();

  const fileInputRef = useRef(null);
  const [busyAction, setBusyAction] = useState('');
  const [importMode, setImportMode] = useState('merge');
  const [profileForm, setProfileForm] = useState({
    name: '',
    examDate: '',
    timezone: 'auto',
  });
  const [goalsForm, setGoalsForm] = useState({
    dailyHours: 3,
    weeklyHours: 20,
    monthlyHours: 80,
  });
  const [pomodoroForm, setPomodoroForm] = useState({
    focusMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    sessionsBeforeLongBreak: 4,
    customFocusMinutes: 45,
    autoStartBreaks: false,
  });
  const [notificationForm, setNotificationForm] = useState({
    soundEnabled: true,
    sessionEndNotification: true,
    breakEndNotification: true,
    reminderEnabled: false,
    reminderHour: 18,
  });

  useEffect(() => {
    setProfileForm({
      name: appData.userProfile.name || '',
      examDate: appData.userProfile.examDate || '',
      timezone: normalizeTimeZoneSelection(appData.userProfile.timezone),
    });
    setGoalsForm({
      dailyHours: appData.userProfile.goals.dailyHours,
      weeklyHours: appData.userProfile.goals.weeklyHours,
      monthlyHours: appData.userProfile.goals.monthlyHours,
    });
    setPomodoroForm({
      focusMinutes: appData.pomodoroSettings.focusMinutes,
      shortBreakMinutes: appData.pomodoroSettings.shortBreakMinutes,
      longBreakMinutes: appData.pomodoroSettings.longBreakMinutes,
      sessionsBeforeLongBreak: appData.pomodoroSettings.sessionsBeforeLongBreak,
      customFocusMinutes: appData.pomodoroSettings.customFocusMinutes,
      autoStartBreaks: appData.pomodoroSettings.autoStartBreaks,
    });
    setNotificationForm({
      soundEnabled: appData.userProfile.notificationSettings.soundEnabled,
      sessionEndNotification: appData.userProfile.notificationSettings.sessionEndNotification,
      breakEndNotification: appData.userProfile.notificationSettings.breakEndNotification,
      reminderEnabled: appData.userProfile.notificationSettings.reminderEnabled,
      reminderHour: appData.userProfile.notificationSettings.reminderHour,
    });
  }, [appData]);

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        await Notification.requestPermission();
      } catch {
        // Ignore permission request failures in unsupported browsers.
      }
    }
  };

  const handleSaveProfile = () => {
    updateProfile({
      name: profileForm.name.trim() || 'طالب',
      examDate: profileForm.examDate,
      timezone: normalizeTimeZoneSelection(profileForm.timezone),
      hasCompletedOnboarding: true,
    });
    showToast({
      tone: 'success',
      title: 'تم حفظ الملف الشخصي',
      description: 'تم تحديث الاسم وتاريخ الامتحان والمنطقة الزمنية.',
    });
  };

  const handleSaveGoals = () => {
    updateGoals({
      dailyHours: Number.parseInt(goalsForm.dailyHours, 10) || 1,
      weeklyHours: Number.parseInt(goalsForm.weeklyHours, 10) || 1,
      monthlyHours: Number.parseInt(goalsForm.monthlyHours, 10) || 1,
    });
    showToast({
      tone: 'success',
      title: 'تم تحديث الأهداف',
      description: 'اللوحة والتحليلات ستستخدم القيم الجديدة مباشرة.',
    });
  };

  const handleSavePomodoro = () => {
    updatePomodoroSettings({
      focusMinutes: Number.parseInt(pomodoroForm.focusMinutes, 10) || 25,
      shortBreakMinutes: Number.parseInt(pomodoroForm.shortBreakMinutes, 10) || 5,
      longBreakMinutes: Number.parseInt(pomodoroForm.longBreakMinutes, 10) || 15,
      sessionsBeforeLongBreak: Number.parseInt(pomodoroForm.sessionsBeforeLongBreak, 10) || 4,
      customFocusMinutes: Number.parseInt(pomodoroForm.customFocusMinutes, 10) || 45,
      autoStartBreaks: pomodoroForm.autoStartBreaks,
    });
    showToast({
      tone: 'success',
      title: 'تم حفظ إعدادات المؤقت',
      description: 'ستُطبق القيم الجديدة على الجلسات القادمة فورًا.',
    });
  };

  const handleSaveNotifications = async () => {
    if (
      notificationForm.sessionEndNotification
      || notificationForm.breakEndNotification
      || notificationForm.reminderEnabled
    ) {
      await requestNotificationPermission();
    }

    updateNotificationSettings({
      soundEnabled: notificationForm.soundEnabled,
      sessionEndNotification: notificationForm.sessionEndNotification,
      breakEndNotification: notificationForm.breakEndNotification,
      reminderEnabled: notificationForm.reminderEnabled,
      reminderHour: Number.parseInt(notificationForm.reminderHour, 10) || 18,
    });
    showToast({
      tone: 'success',
      title: 'تم حفظ الإشعارات',
      description: 'يمكنك الآن التحكم الكامل في الأصوات والتنبيهات والتذكير.',
    });
  };

  const handleLogout = async () => {
    setBusyAction('logout');
    await waitForPendingSync();
    await logout();
    setBusyAction('');
  };

  const handleImportClick = async () => {
    if (importMode === 'replace') {
      const approved = await confirm({
        title: 'استبدال البيانات الحالية',
        description: 'سيتم استبدال كل بياناتك الحالية بمحتوى الملف المختار. استخدم هذا فقط إذا كنت متأكدًا من النسخة الاحتياطية.',
        confirmLabel: 'نعم، استبدل',
        cancelLabel: 'إلغاء',
        tone: 'danger',
      });

      if (!approved) return;
    }

    fileInputRef.current?.click();
  };

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setBusyAction('import');
    await importBackup(file, importMode);
    setBusyAction('');
    event.target.value = '';
  };

  const handleClearData = async () => {
    const approved = await confirm({
      title: 'مسح جميع البيانات',
      description: 'سيتم حذف المواد والمهام والسجل والإعدادات من هذا الحساب. ستعود بعد ذلك إلى شاشة البداية الأولى.',
      confirmLabel: 'نعم، امسح',
      cancelLabel: 'إلغاء',
      tone: 'danger',
    });

    if (!approved) return;

    setBusyAction('clear');
    const result = await resetAllData();
    setBusyAction('');

    if (!result.success) {
      showToast({
        tone: 'danger',
        title: 'تعذر مسح البيانات',
        description: result.error,
      });
      return;
    }

    showToast({
      tone: 'success',
      title: 'تم مسح البيانات',
      description: 'يمكنك الآن بدء إعداد جديد نظيف وآمن.',
    });
    navigate('/onboarding', { replace: true });
  };

  const handleDeleteAccount = async () => {
    const approved = await confirm({
      title: 'حذف الحساب نهائيًا',
      description: 'سيتم حذف الحساب وبياناته نهائيًا. إذا فشل حذف المستخدم نفسه فسنستعيد البيانات تلقائيًا.',
      confirmLabel: 'نعم، احذف الحساب',
      cancelLabel: 'إلغاء',
      tone: 'danger',
    });

    if (!approved || !user?.uid) return;

    const lastSignInDate = new Date(user.metadata?.lastSignInTime || 0);
    const diffMinutes = (Date.now() - lastSignInDate.getTime()) / (1000 * 60);
    if (diffMinutes > 5) {
      showToast({
        tone: 'warning',
        title: 'تسجيل دخول جديد مطلوب',
        description: 'لأسباب أمنية يجب أن تكون قد سجلت الدخول خلال آخر 5 دقائق. سنسجل خروجك الآن ثم أعد المحاولة.',
      });
      await logout();
      return;
    }

    setBusyAction('delete-account');
    await waitForPendingSync();
    const localBackup = saveData(appData, user.uid);
    window.isClearingData = true;

    try {
      const cloudCleared = await clearUserData(user.uid);
      if (!cloudCleared) {
        throw new Error('تعذر حذف بيانات Firestore الآن، لذلك أوقفنا حذف الحساب لحماية بياناتك.');
      }

      const result = await deleteAccount();
      if (result.success) {
        clearLocalData(user.uid);
        return;
      }

      if (localBackup) {
        saveData(localBackup, user.uid);
        const restored = await saveUserData(user.uid, localBackup);
        if (!restored) {
          throw new Error('فشل حذف الحساب وتمت استعادة النسخة المحلية فقط. تحقق من الاتصال ثم حاول مرة أخرى.');
        }
      }

      throw new Error(result.error || 'تعذر حذف الحساب الآن.');
    } catch (error) {
      showToast({
        tone: 'danger',
        title: 'تعذر حذف الحساب',
        description: error.message || 'حاول مرة أخرى بعد قليل.',
      });
    } finally {
      window.isClearingData = false;
      setBusyAction('');
    }
  };

  const isBusy = Boolean(busyAction);
  const selectedOffset = getTimeZoneOffsetLabel(profileForm.timezone);
  const inputStyle = { backgroundColor: 'var(--c-input)', borderColor: 'var(--c-border)', color: 'var(--c-text)' };

  return (
    <div className="app-page animate-fade-in">
      <PageHeader
        eyebrow="Settings"
        title="الإعدادات"
        description="قسّمنا الإعدادات إلى أقسام واضحة حتى يكون كل شيء مفهومًا وقابلًا للتحكم بدون ازدحام."
        actions={(
          <button
            type="button"
            onClick={handleLogout}
            disabled={isBusy}
            className="app-btn-secondary"
          >
            <Icons.LogOut />
            تسجيل الخروج
          </button>
        )}
      />

      <SectionCard title="Profile" subtitle="الهوية الأساسية التي تظهر في التطبيق وتحدد العدّ التنازلي بدقة.">
        <div className="grid gap-4 lg:grid-cols-3">
          <label className="text-right">
            <span className="app-label">الاسم</span>
            <input
              type="text"
              value={profileForm.name}
              onChange={(event) => setProfileForm((currentValue) => ({ ...currentValue, name: event.target.value }))}
              className="app-control"
              style={inputStyle}
            />
          </label>
          <label className="text-right">
            <span className="app-label">تاريخ الامتحان</span>
            <input
              type="date"
              min={getTodayKey(profileForm.timezone)}
              value={profileForm.examDate}
              onChange={(event) => setProfileForm((currentValue) => ({ ...currentValue, examDate: event.target.value }))}
              className="app-control"
              style={inputStyle}
            />
          </label>
          <label className="text-right">
            <span className="app-label">المنطقة الزمنية</span>
            <select
              value={profileForm.timezone}
              onChange={(event) => setProfileForm((currentValue) => ({ ...currentValue, timezone: event.target.value }))}
              className="app-control"
              style={inputStyle}
            >
              {TIMEZONE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-[12px]" style={{ color: 'var(--c-text-muted)' }}>
          <div dir="ltr">{user?.email || 'Google Account'}</div>
          <span>•</span>
          <div>{selectedOffset}</div>
          <span>•</span>
          <StatusBadge status={syncStatus} />
        </div>

        <div className="mt-5">
          <button type="button" onClick={handleSaveProfile} className="app-btn-primary">
            حفظ الملف الشخصي
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Study Preferences" subtitle="الأهداف اليومية والأسبوعية والشهرية التي تتحكم في Dashboard وInsights.">
        <div className="grid gap-4 md:grid-cols-3">
          <NumberField label="Daily" value={goalsForm.dailyHours} min={1} max={24} suffix="h" onChange={(event) => setGoalsForm((currentValue) => ({ ...currentValue, dailyHours: event.target.value }))} />
          <NumberField label="Weekly" value={goalsForm.weeklyHours} min={1} max={200} suffix="h" onChange={(event) => setGoalsForm((currentValue) => ({ ...currentValue, weeklyHours: event.target.value }))} />
          <NumberField label="Monthly" value={goalsForm.monthlyHours} min={1} max={800} suffix="h" onChange={(event) => setGoalsForm((currentValue) => ({ ...currentValue, monthlyHours: event.target.value }))} />
        </div>
        <div className="mt-5">
          <button type="button" onClick={handleSaveGoals} className="app-btn-primary">حفظ الأهداف</button>
        </div>
      </SectionCard>

      <SectionCard title="Pomodoro Defaults" subtitle="الإعدادات الافتراضية لأنماط Pomodoro وCustom Focus.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <NumberField label="Focus" value={pomodoroForm.focusMinutes} min={1} max={180} suffix="min" onChange={(event) => setPomodoroForm((currentValue) => ({ ...currentValue, focusMinutes: event.target.value }))} />
          <NumberField label="Short Break" value={pomodoroForm.shortBreakMinutes} min={1} max={60} suffix="min" onChange={(event) => setPomodoroForm((currentValue) => ({ ...currentValue, shortBreakMinutes: event.target.value }))} />
          <NumberField label="Long Break" value={pomodoroForm.longBreakMinutes} min={1} max={120} suffix="min" onChange={(event) => setPomodoroForm((currentValue) => ({ ...currentValue, longBreakMinutes: event.target.value }))} />
          <NumberField label="Sessions" value={pomodoroForm.sessionsBeforeLongBreak} min={1} max={12} onChange={(event) => setPomodoroForm((currentValue) => ({ ...currentValue, sessionsBeforeLongBreak: event.target.value }))} />
          <NumberField label="Custom Focus" value={pomodoroForm.customFocusMinutes} min={5} max={240} suffix="min" onChange={(event) => setPomodoroForm((currentValue) => ({ ...currentValue, customFocusMinutes: event.target.value }))} />
        </div>
        <div className="mt-5">
          <button type="button" onClick={handleSavePomodoro} className="app-btn-primary">حفظ إعدادات المؤقت</button>
        </div>
      </SectionCard>

      <SectionCard title="Notifications" subtitle="تحكم واضح في الأصوات والتنبيهات ونظام التذكير اليومي.">
        <div className="space-y-3">
          <ToggleRow
            icon={<Icons.Volume2 />}
            title="صوت نهاية الجلسة"
            description="تشغيل نغمة قصيرة عند نهاية الجلسة أو الاستراحة."
            checked={notificationForm.soundEnabled}
            onChange={(event) => setNotificationForm((currentValue) => ({ ...currentValue, soundEnabled: event.target.checked }))}
          />
          <ToggleRow
            icon={<Icons.Bell />}
            title="إشعار نهاية جلسة التركيز"
            description="إشعار متصفح عند اكتمال جلسة التركيز."
            checked={notificationForm.sessionEndNotification}
            onChange={(event) => setNotificationForm((currentValue) => ({ ...currentValue, sessionEndNotification: event.target.checked }))}
          />
          <ToggleRow
            icon={<Icons.Coffee />}
            title="إشعار نهاية الاستراحة"
            description="إشعار عند انتهاء الاستراحة للعودة إلى التركيز."
            checked={notificationForm.breakEndNotification}
            onChange={(event) => setNotificationForm((currentValue) => ({ ...currentValue, breakEndNotification: event.target.checked }))}
          />
          <ToggleRow
            icon={<Icons.BellOff />}
            title="تذكير إذا لم تبدأ اليوم"
            description="يرسل لك تذكيرًا لطيفًا إذا مر الوقت المحدد ولم تبدأ جلسة بعد."
            checked={notificationForm.reminderEnabled}
            onChange={(event) => setNotificationForm((currentValue) => ({ ...currentValue, reminderEnabled: event.target.checked }))}
          />
          <div className="max-w-[200px]">
            <NumberField label="Reminder Hour" value={notificationForm.reminderHour} min={0} max={23} onChange={(event) => setNotificationForm((currentValue) => ({ ...currentValue, reminderHour: event.target.value }))} />
          </div>
        </div>
        <div className="mt-5">
          <button type="button" onClick={handleSaveNotifications} className="app-btn-primary">حفظ الإشعارات</button>
        </div>
      </SectionCard>

      <SectionCard title="Backup & Export" subtitle="نسخة احتياطية واضحة، واستيراد آمن مع اختيار الدمج أو الاستبدال الكامل.">
        <div className="grid gap-4 lg:grid-cols-[1fr_200px]">
          <div className="space-y-4">
            <div className="app-panel-muted p-4">
              <div className="text-[13px] font-semibold">الحالة الحالية</div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <StatusBadge status={syncStatus} />
                <div className="text-[12px]" style={{ color: 'var(--c-text-muted)' }}>
                  {user?.email ? 'مرتبطة بحسابك الحالي' : 'تعمل محليًا حتى يتم تسجيل الدخول'}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={exportBackup}
                disabled={isBusy}
                className="app-btn-primary disabled:opacity-60"
              >
                <Icons.Download />
                تصدير JSON
              </button>
              <button
                type="button"
                onClick={handleImportClick}
                disabled={isBusy}
                className="app-btn-secondary disabled:opacity-60"
              >
                <Icons.Upload />
                استيراد ملف
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-right">
              <span className="app-label">Import Mode</span>
              <select
                value={importMode}
                onChange={(event) => setImportMode(event.target.value)}
                className="app-control"
                style={inputStyle}
              >
                <option value="merge">دمج مع البيانات الحالية</option>
                <option value="replace">استبدال كامل</option>
              </select>
            </label>
            <div className="text-[12px] leading-6" style={{ color: 'var(--c-text-muted)' }}>
              وضع الدمج هو الخيار الآمن افتراضيًا.
            </div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          onChange={handleImportFile}
        />
      </SectionCard>

      <SectionCard title="Privacy" subtitle="روابط واضحة للخصوصية والشروط.">
        <div className="grid gap-3 md:grid-cols-2">
          <Link
            to="/privacy"
            className="app-panel-muted p-4 transition-colors hover:bg-[var(--c-surface-hover)]"
            style={{ color: 'var(--c-text)' }}
          >
            <div className="flex items-center gap-3">
              <Icons.ShieldCheck />
              <div className="text-right">
                <div className="text-[13px] font-semibold">سياسة الخصوصية</div>
                <div className="mt-0.5 text-[11px] leading-5" style={{ color: 'var(--c-text-muted)' }}>
                  ماذا نخزن، لماذا نخزنه، وما الذي يمكنك التحكم فيه.
                </div>
              </div>
            </div>
          </Link>
          <Link
            to="/terms"
            className="app-panel-muted p-4 transition-colors hover:bg-[var(--c-surface-hover)]"
            style={{ color: 'var(--c-text)' }}
          >
            <div className="flex items-center gap-3">
              <Icons.FileText />
              <div className="text-right">
                <div className="text-[13px] font-semibold">الشروط والأحكام</div>
                <div className="mt-0.5 text-[11px] leading-5" style={{ color: 'var(--c-text-muted)' }}>
                  بنود الاستخدام الأساسية وحدود الخدمة ومسؤولية المستخدم.
                </div>
              </div>
            </div>
          </Link>
        </div>
      </SectionCard>

      <SectionCard title="Danger Zone" subtitle="إجراءات غير قابلة للتراجع تمر كلها عبر تأكيد واضح وحماية من فقدان البيانات.">
        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={handleClearData}
            disabled={isBusy}
            className="app-btn-danger-soft disabled:opacity-60"
          >
            <Icons.RotateCcw />
            مسح جميع البيانات
          </button>
          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={isBusy}
            className="app-btn-danger disabled:opacity-60"
          >
            <Icons.Trash />
            حذف الحساب نهائيًا
          </button>
        </div>
      </SectionCard>
    </div>
  );
}
