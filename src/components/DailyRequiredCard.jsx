import { useTheme } from '../contexts/ThemeContext';
import { Icons } from './Icons';
import { getRemainingDays } from '../utils/constants';

export default function DailyRequiredCard({ subjects, userProfile }) {
  const { isDark } = useTheme();
  const remainingDays = getRemainingDays(userProfile?.examDate);

  // Calculate total remaining seconds across all subjects
  let totalRemainSec = 0;
  let completedCount = 0;
  const totalCount = Object.keys(subjects).length;

  Object.values(subjects).forEach(data => {
    const goalSec = Math.max(1, data.goalHours * 3600);
    const remain = Math.max(0, goalSec - data.studiedSeconds);
    totalRemainSec += remain;
    if (data.studiedSeconds >= goalSec) completedCount++;
  });

  const safeDays = Math.max(1, remainingDays);
  const dailyTotalSec = totalRemainSec / safeDays;
  const dailyH = Math.floor(dailyTotalSec / 3600);
  const dailyM = Math.floor((dailyTotalSec % 3600) / 60);

  const allDone = totalRemainSec <= 0;

  return (
    <div className="rounded-2xl p-6 flex flex-col h-full border transition-colors relative overflow-hidden group font-sans"
      style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
    >
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 blur-[60px] pointer-events-none rounded-full transition-all duration-1000"
        style={{ backgroundColor: isDark ? 'rgba(139,92,246,0.06)' : 'rgba(139,92,246,0.08)' }}
      />

      {/* Header */}
      <div className="relative z-10 flex justify-between items-center mb-5">
        <div className="flex items-center gap-2.5">
          <div className="text-violet-500 p-2 bg-violet-500/10 rounded-xl">
            <Icons.Zap />
          </div>
          <h3 className="font-bold text-base leading-none tracking-tight" style={{ color: 'var(--c-text)' }}>
            المطلوب <span className="font-normal" style={{ color: 'var(--c-text-muted)' }}>يومياً</span>
          </h3>
        </div>
        <div className="font-bold flex items-baseline gap-1" dir="ltr">
          <span className="text-xs font-medium" style={{ color: 'var(--c-text-faint)' }}>{completedCount}/{totalCount}</span>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center mb-4">
        {allDone ? (
          <div className="text-center">
            <div className="text-4xl mb-2">🎉</div>
            <div className="text-sm font-bold text-emerald-500">تم إنهاء جميع الأهداف!</div>
          </div>
        ) : (
          <div className="text-center" dir="ltr">
            <div className="text-4xl font-bold tracking-tighter tabular-nums leading-none" style={{ color: 'var(--c-text)' }}>
              {dailyH > 0 && <>{dailyH}<span className="text-lg font-normal" style={{ color: 'var(--c-text-faint)' }}>h </span></>}
              {dailyM}<span className="text-lg font-normal" style={{ color: 'var(--c-text-faint)' }}>m</span>
            </div>
            <div className="text-xs font-medium mt-2" style={{ color: 'var(--c-text-muted)' }}>
              لإنهاء جميع المواد
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="relative z-10 flex items-center gap-2 mt-auto pt-4 border-t text-sm font-medium"
        style={{ borderColor: 'var(--c-border)', color: 'var(--c-text-muted)' }}
      >
        <Icons.Target />
        {remainingDays > 0 ? (
          <span>
            متبقي <strong className="font-bold" style={{ color: 'var(--c-text)' }}>{remainingDays}</strong> يوم للامتحان
          </span>
        ) : (
          <span className="font-bold" style={{ color: '#f97316' }}>حان وقت الامتحان!</span>
        )}
      </div>
    </div>
  );
}
