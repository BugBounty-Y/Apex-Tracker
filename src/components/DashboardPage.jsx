import { Icons } from './Icons';
import SubjectCard from './SubjectCard';
import { getRemainingDays } from '../utils/constants';
import StudyTimeCard from './StudyTimeCard';
import StreakCard from './StreakCard';
import { useTheme } from '../contexts/ThemeContext';

export default function DashboardPage({
  subjects,
  activeSubject,
  isTimerRunning,
  onSubjectClick,
  onEdit,
  onAddSubject,
  todayStudiedSeconds = 0,
  dailyGoal = 3,
  dailyLog = {},
  streak = 0,
  onEditGoal,
  userProfile,
}) {
  const { isDark } = useTheme();
  const remainingDays = getRemainingDays(userProfile?.examDate);
  const totalSubjects = Object.keys(subjects).length;
  const totalGoalHours = Object.values(subjects).reduce((s, d) => s + d.goalHours, 0);
  const totalStudiedHours = Object.values(subjects).reduce((s, d) => s + d.studiedSeconds, 0) / 3600;
  const overallProgress = totalGoalHours > 0 ? Math.min(100, (totalStudiedHours / totalGoalHours) * 100) : 0;

  const getMotivation = () => {
    if (overallProgress >= 80) return { text: 'أنت على وشك الوصول! واصل بنفس القوة 💪', emoji: '🏆' };
    if (overallProgress >= 50) return { text: 'أكثر من النصف! استمر في الزخم 🚀', emoji: '⭐' };
    if (overallProgress >= 20) return { text: 'بداية قوية! كل جلسة تقربك من هدفك', emoji: '🎯' };
    return { text: 'كل رحلة تبدأ بخطوة. ابدأ جلستك الأولى اليوم!', emoji: '✨' };
  };
  const motivation = getMotivation();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl p-6 md:p-8 border"
        style={{
          background: isDark
            ? 'linear-gradient(to left, #09090b, #0f0f14, #13111c)'
            : 'linear-gradient(to left, #f5f5f7, #f0f0f5, #ebe8f3)',
          borderColor: 'var(--c-border)',
        }}
      >
        {/* Decorative glow */}
        <div className="absolute top-0 left-0 w-72 h-72 rounded-full blur-[120px] pointer-events-none" style={{ backgroundColor: 'var(--c-glow-violet)' }} />
        <div className="absolute bottom-0 right-10 w-52 h-52 rounded-full blur-[100px] pointer-events-none" style={{ backgroundColor: 'var(--c-glow-cyan)' }} />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{motivation.emoji}</span>
              <div className="px-3 py-1 bg-violet-500/10 rounded-full text-[11px] font-semibold text-violet-500 border border-violet-500/15">
                هدفك: 99%
              </div>
            </div>
            <h2 className="text-xl md:text-2xl font-bold mb-2 leading-tight" style={{ color: 'var(--c-text)' }}>
              مرحباً {userProfile?.name || 'يحيى'}، أهلاً بك في غرفة العمليات
            </h2>
            <p className="text-sm font-medium leading-relaxed max-w-xl" style={{ color: 'var(--c-text-muted)' }}>
              {motivation.text}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="backdrop-blur-sm rounded-xl p-4 border min-w-[120px]"
              style={{ backgroundColor: 'var(--c-elevated)', borderColor: 'var(--c-border)' }}
            >
              <div className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--c-text-faint)' }}>التقدم الكلي</div>
              <div className="text-2xl font-bold tabular-nums" style={{ color: 'var(--c-text)' }}>{overallProgress.toFixed(1)}%</div>
              <div className="w-full h-1 rounded-full mt-2.5 overflow-hidden" style={{ backgroundColor: isDark ? '#27272a' : '#e4e4e7' }}>
                <div className="h-full bg-gradient-to-l from-violet-500 to-violet-400 rounded-full transition-all duration-1000" style={{ width: `${overallProgress}%` }} />
              </div>
            </div>
            <div className="backdrop-blur-md rounded-2xl p-4 lg:p-5 border relative overflow-hidden flex flex-col items-center justify-center min-w-[140px] shadow-lg group"
              style={{
                backgroundColor: isDark ? 'rgba(245, 158, 11, 0.08)' : 'rgba(245, 158, 11, 0.1)',
                borderColor: isDark ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.3)',
                boxShadow: isDark ? '0 10px 30px -10px rgba(245,158,11,0.15)' : '0 10px 30px -10px rgba(245,158,11,0.2)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent pointer-events-none" />
              <div className="relative z-10 flex items-center justify-center gap-1.5 mb-1.5 text-amber-500">
                <span className="scale-[0.85]"><Icons.Target /></span>
                <div className="text-[10px] font-bold uppercase tracking-widest text-amber-600" style={{ color: isDark ? '#fbbf24' : '#d97706' }}>موعد الامتحان</div>
              </div>
              <div className="relative z-10 text-3xl lg:text-4xl font-black tabular-nums tracking-tighter text-amber-500 drop-shadow-sm">{remainingDays}</div>
              <div className="relative z-10 text-[11px] font-bold mt-1" style={{ color: isDark ? 'rgba(251,191,36,0.7)' : '#d97706' }}>يوم متبقي</div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-5">
        <div className="md:col-span-7 xl:col-span-8">
          <StudyTimeCard todayStudiedSeconds={todayStudiedSeconds} dailyGoalHours={dailyGoal} onEditGoal={onEditGoal} />
        </div>
        <div className="md:col-span-5 xl:col-span-4">
          <StreakCard dailyLog={dailyLog} streak={streak} />
        </div>
      </div>

      {/* Section Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-1">
        <div>
          <h2 className="text-lg md:text-xl font-bold tracking-tight flex items-center gap-2" style={{ color: 'var(--c-text)' }}>
            <Icons.Book /> المقـررات الدراسـية
          </h2>
          <p className="text-sm mt-1 font-medium" style={{ color: 'var(--c-text-muted)' }}>
            اضغط على المادة للدخول إلى جلسة تركيز • إجمالي {totalSubjects} مادة
          </p>
        </div>
        <button
          onClick={onAddSubject}
          className="text-sm font-semibold text-white bg-violet-600 hover:bg-violet-500 px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-sm hover:shadow-lg hover:shadow-violet-600/15 active:scale-95 w-full md:w-auto justify-center"
          aria-label="إضافة مادة جديدة"
        >
          <Icons.Plus /> إضافة مادة جديدة
        </button>
      </div>

      {/* Subject Grid */}
      {totalSubjects === 0 ? (
        <div className="rounded-2xl p-12 text-center border-2 border-dashed"
          style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
        >
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: 'var(--c-surface-alt)', color: 'var(--c-text-faint)' }}
          >
            <Icons.Plus />
          </div>
          <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--c-text)' }}>لا يوجد مقررات مسجلة</h3>
          <p className="font-medium mb-6" style={{ color: 'var(--c-text-muted)' }}>قم بإضافة موادك الدراسية للبدء في تتبع الإنجاز.</p>
          <button
            onClick={onAddSubject}
            className="px-6 py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-500 transition-colors shadow-lg shadow-violet-600/15"
          >
            إضافة مادتك الأولى
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(subjects).map(([name, data]) => (
            <SubjectCard
              key={name}
              name={name}
              data={data}
              isActive={name === activeSubject}
              isTimerRunning={isTimerRunning}
              onSubjectClick={onSubjectClick}
              onEdit={onEdit}
              userProfile={userProfile}
            />
          ))}
        </div>
      )}
    </div>
  );
}
