import { useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function StreakCard({ dailyLog, streak, userProfile }) {
  const { isDark } = useTheme();

  const weekDays = useMemo(() => {
    const userTimezone = userProfile?.timezone || 'auto';
    
    let offsetMinutes = 0;
    if (userTimezone === 'auto') {
      offsetMinutes = -new Date().getTimezoneOffset();
    } else {
      try {
        const offsetStr = userTimezone.replace('UTC', '');
        if (offsetStr === '+5:30') offsetMinutes = 5.5 * 60;
        else offsetMinutes = Number(offsetStr) * 60;
        if (isNaN(offsetMinutes)) offsetMinutes = -new Date().getTimezoneOffset();
      } catch {
        offsetMinutes = -new Date().getTimezoneOffset();
      }
    }

    const getLocKey = (d) => {
      const utcTime = d.getTime() + (d.getTimezoneOffset() * 60000);
      return new Date(utcTime + (offsetMinutes * 60000)).toISOString().slice(0, 10);
    };

    // Construct "today" representation based on custom offset
    const todayTarget = new Date(new Date().getTime() + (new Date().getTimezoneOffset() * 60000) + (offsetMinutes * 60000));
    todayTarget.setHours(0, 0, 0, 0); // Not strictly clean due to date shifts, but we only need Day of Week
    
    // Fallback simple: use actual target day value
    const currentDay = todayTarget.getDay(); // 0 is Sunday
    const adjustedDay = currentDay === 0 ? 6 : currentDay - 1; // Start Monday (0) to Sunday (6)

    const days = [];
    const labels = ['ن', 'ث', 'ع', 'خ', 'ج', 'س', 'ح'];

    // We iterate backwards/forwards relative to new Date()
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - adjustedDay + i);
      
      const dateKey = getLocKey(d);
      const seconds = dailyLog[dateKey] || 0;

      days.push({
        label: labels[i],
        isToday: i === adjustedDay,
        hasStudied: seconds >= 1500, // 25 minutes minimum
        isFuture: i > adjustedDay
      });
    }
    return days;
  }, [dailyLog]);

  const getStatusText = () => {
    if (streak === 0) return 'سخّن محركاتك للبدء...';
    if (streak < 3) return 'بداية موفقة، استمر!';
    if (streak < 7) return 'أداء رائع، أنت تشتعل!';
    return 'لا يمكن إيقافك! 🔥';
  };

  return (
    <div className="rounded-2xl p-6 flex flex-col h-full relative overflow-hidden border transition-colors font-sans group"
      style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
    >
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 blur-[60px] pointer-events-none rounded-full transition-all duration-1000"
        style={{ backgroundColor: isDark ? 'rgba(249,115,22,0.06)' : 'rgba(249,115,22,0.08)' }}
      />

      {/* Header */}
      <div className="relative z-10 flex justify-between items-center mb-6">
        <h3 className="font-bold text-base leading-none tracking-tight" style={{ color: 'var(--c-text)' }}>
          سجل <span className="font-normal" style={{ color: 'var(--c-text-muted)' }}>الاستمرارية</span>
        </h3>
        <div className="font-bold flex items-baseline gap-1" dir="ltr">
          <span className="text-2xl font-bold" style={{ color: 'var(--c-text)' }}>{streak}</span>
          <span className="text-xs font-medium" style={{ color: 'var(--c-text-faint)' }}>أيـام</span>
        </div>
      </div>

      {/* Fire Icon */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center mb-5">
        {streak >= 3 ? (
          <div className="text-[4.5rem] filter drop-shadow-[0_0_20px_rgba(249,115,22,0.4)] animate-pulse will-change-transform transform-gpu">🔥</div>
        ) : (
          <div className="text-[3.5rem] opacity-60 filter drop-shadow-[0_0_8px_rgba(249,115,22,0.15)] grayscale-[0.3]">🔥</div>
        )}
      </div>

      {/* Days row */}
      <div className="relative z-10 flex items-center justify-between gap-1 mt-auto" dir="ltr">
        {weekDays.map((day, i) => (
          <div
            key={i}
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold transition-all ${
              day.isToday && day.hasStudied
                ? 'bg-orange-500/15 text-orange-500 ring-1 ring-orange-500/40'
                : day.isToday
                ? 'ring-1'
                : day.hasStudied
                ? 'bg-orange-500/8 text-orange-500/70'
                : ''
            }`}
            style={{
              backgroundColor: day.isToday && !day.hasStudied ? 'var(--c-surface-alt)' : day.hasStudied ? undefined : 'var(--c-elevated)',
              color: day.isToday && !day.hasStudied ? 'var(--c-text)' : day.hasStudied ? undefined : 'var(--c-text-faint)',
              ...(day.isToday && !day.hasStudied ? { '--tw-ring-color': 'var(--c-border-hover)' } : {}),
            }}
          >
            {day.label}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center mt-5 font-semibold text-orange-500 text-sm">
        {getStatusText()}
      </div>
    </div>
  );
}
