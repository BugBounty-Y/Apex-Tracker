import { Icons } from './Icons';
import SubjectCard from './SubjectCard';
import { getRemainingDays } from '../utils/constants';
import StudyTimeCard from './StudyTimeCard';
import StreakCard from './StreakCard';

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
}) {
  const remainingDays = getRemainingDays();
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
      <div className="relative overflow-hidden bg-gradient-to-l from-[#09090b] via-[#0f0f14] to-[#13111c] rounded-2xl p-6 md:p-8 text-white border border-zinc-800/60">
        {/* Decorative glow */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-violet-600/[0.06] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-52 h-52 bg-cyan-400/[0.03] rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{motivation.emoji}</span>
              <div className="px-3 py-1 bg-violet-500/10 rounded-full text-[11px] font-semibold text-violet-300 border border-violet-500/15">
                هدفك: 99%
              </div>
            </div>
            <h2 className="text-xl md:text-2xl font-bold mb-2 leading-tight text-white">
              مرحباً يحيى، أهلاً بك في غرفة العمليات
            </h2>
            <p className="text-sm text-zinc-500 font-medium leading-relaxed max-w-xl">
              {motivation.text}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl p-4 border border-zinc-800/60 min-w-[120px]">
              <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">التقدم الكلي</div>
              <div className="text-2xl font-bold tabular-nums text-white">{overallProgress.toFixed(1)}%</div>
              <div className="w-full h-1 bg-zinc-800 rounded-full mt-2.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-l from-violet-500 to-violet-400 rounded-full transition-all duration-1000"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </div>
            <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl p-4 border border-zinc-800/60 min-w-[100px]">
              <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">متبقي</div>
              <div className="text-2xl font-bold tabular-nums text-amber-400">{remainingDays}</div>
              <div className="text-[11px] font-medium text-zinc-500 mt-0.5">يوم للامتحان</div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-5">
        <div className="md:col-span-7 xl:col-span-8">
          <StudyTimeCard 
            todayStudiedSeconds={todayStudiedSeconds} 
            dailyGoalHours={dailyGoal} 
            onEditGoal={onEditGoal} 
          />
        </div>
        <div className="md:col-span-5 xl:col-span-4">
          <StreakCard 
            dailyLog={dailyLog} 
            streak={streak} 
          />
        </div>
      </div>

      {/* Section Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-1">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Icons.Book /> المقـررات الدراسـية
          </h2>
          <p className="text-sm text-zinc-500 mt-1 font-medium">
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
        <div className="bg-zinc-900/50 rounded-2xl p-12 text-center border-2 border-dashed border-zinc-800">
          <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-600">
            <Icons.Plus />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">لا يوجد مقررات مسجلة</h3>
          <p className="text-zinc-500 font-medium mb-6">قم بإضافة موادك الدراسية للبدء في تتبع الإنجاز.</p>
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
            />
          ))}
        </div>
      )}
    </div>
  );
}
