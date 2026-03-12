import { useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { getTodayKey, getWeekdayFromDateKey, shiftDateKey } from '../utils/helpers';

export default function StreakCard({ dailyLog, streak, userProfile }) {
  const { isDark } = useTheme();

  const weekDays = useMemo(() => {
    const todayKey = getTodayKey(userProfile?.timezone);
    const currentDay = getWeekdayFromDateKey(todayKey);
    const adjustedDay = currentDay === 0 ? 6 : currentDay - 1;
    const weekStartKey = shiftDateKey(todayKey, -adjustedDay);

    const days = [];
    const labels = ['ن', 'ث', 'ع', 'خ', 'ج', 'س', 'ح'];

    for (let i = 0; i < 7; i += 1) {
      const dateKey = shiftDateKey(weekStartKey, i);
      const seconds = dailyLog[dateKey] || 0;

      days.push({
        label: labels[i],
        isToday: dateKey === todayKey,
        hasStudied: seconds >= 1500,
        isFuture: i > adjustedDay,
      });
    }

    return days;
  }, [dailyLog, userProfile?.timezone]);

  const getStatusText = () => {
    if (streak === 0) return 'سخّن محركاتك للبدء...';
    if (streak < 3) return 'بداية موفقة، استمر!';
    if (streak < 7) return 'أداء رائع، أنت تشتعل! 🔥';
    return 'لا يمكن إيقافك! 🚀';
  };

  const fireSize = streak >= 7 ? 'text-[5rem]' : streak >= 3 ? 'text-[4.5rem]' : 'text-[3.5rem]';
  const fireGlow = streak >= 3
    ? 'drop-shadow-[0_0_25px_rgba(249,115,22,0.5)]'
    : 'drop-shadow-[0_0_8px_rgba(249,115,22,0.15)] grayscale-[0.3]';
  const fireOpacity = streak >= 3 ? '' : 'opacity-50';

  return (
    <div className="rounded-2xl p-6 flex flex-col h-full relative overflow-hidden border transition-all duration-300 font-sans group"
      style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 rounded-full blur-[70px] pointer-events-none transition-all duration-1000"
        style={{
          backgroundColor: isDark
            ? `rgba(249,115,22,${Math.min(0.12, 0.03 + streak * 0.01)})`
            : `rgba(249,115,22,${Math.min(0.15, 0.04 + streak * 0.015)})`,
        }}
      />

      <div className="relative z-10 flex justify-between items-center mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2c.5 2.5 2 4 4 6-1 2-3 3.5-4 5-1-1.5-3-3-4-5 2-2 3.5-3.5 4-6z"></path>
              <path d="M12 15c.5 1.5 1 2.5 1 4a3 3 0 1 1-6 0c0-3 3-4 5-4z" opacity="0.5"></path>
            </svg>
          </div>
          <h3 className="font-bold text-base leading-none tracking-tight" style={{ color: 'var(--c-text)' }}>
            سجل <span className="font-normal" style={{ color: 'var(--c-text-muted)' }}>الاستمرارية</span>
          </h3>
        </div>
        <div className="flex items-baseline gap-1" dir="ltr">
          <span className="text-2xl font-black tabular-nums" style={{ color: streak > 0 ? '#f97316' : 'var(--c-text)' }}>{streak}</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--c-text-faint)' }}>
            {streak === 1 ? 'يوم' : streak === 2 ? 'يومان' : streak >= 3 && streak <= 10 ? 'أيام' : 'يوماً'}
          </span>
        </div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center mb-4">
        <div className={`${fireSize} ${fireGlow} ${fireOpacity} filter will-change-transform transform-gpu transition-all duration-500`}
          style={streak >= 3 ? { animation: 'pulse 2s ease-in-out infinite' } : {}}
        >
          🔥
        </div>
        {streak >= 7 && (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-xl animate-bounce" style={{ animationDelay: '0.3s' }}>⭐</div>
        )}
      </div>

      <div className="relative z-10 flex items-center justify-between gap-1.5 mt-auto" dir="ltr">
        {weekDays.map((day, i) => (
          <div
            key={i}
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-300 ${
              day.isToday && day.hasStudied
                ? 'bg-gradient-to-br from-orange-500/20 to-amber-500/15 text-orange-500 ring-1 ring-orange-400/50 shadow-sm shadow-orange-500/10'
                : day.isToday
                  ? 'ring-1.5'
                  : day.hasStudied
                    ? 'bg-orange-500/10 text-orange-500/80'
                    : ''
            }`}
            style={{
              backgroundColor: day.isToday && !day.hasStudied ? 'var(--c-surface-alt)' : day.hasStudied ? undefined : 'var(--c-elevated)',
              color: day.isToday && !day.hasStudied ? 'var(--c-text)' : day.hasStudied ? undefined : 'var(--c-text-faint)',
              ...(day.isToday && !day.hasStudied ? { '--tw-ring-color': 'var(--c-border-hover)' } : {}),
            }}
          >
            {day.hasStudied && !day.isToday ? '✓' : day.label}
          </div>
        ))}
      </div>

      <div className="relative z-10 text-center mt-4 pt-4 border-t"
        style={{ borderColor: 'var(--c-border)' }}
      >
        <div className="font-semibold text-sm" style={{ color: streak > 0 ? '#f97316' : 'var(--c-text-muted)' }}>
          {getStatusText()}
        </div>
        <div className="text-[10px] font-medium mt-1" style={{ color: 'var(--c-text-faint)' }}>
          الحد الأدنى: 25 دقيقة دراسة لاحتساب اليوم
        </div>
      </div>
    </div>
  );
}
