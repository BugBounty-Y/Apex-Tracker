import { useMemo } from 'react';

export default function StreakCard({ dailyLog, streak }) {
  const weekDays = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentDay = today.getDay();
    const adjustedDay = currentDay === 0 ? 6 : currentDay - 1;
    
    const days = [];
    const labels = ['ن', 'ث', 'ع', 'خ', 'ج', 'س', 'ح'];
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - adjustedDay + i);
      const dateKey = d.toISOString().slice(0, 10);
      const seconds = dailyLog[dateKey] || 0;
      
      days.push({
        label: labels[i],
        isToday: i === adjustedDay,
        hasStudied: seconds >= 60,
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
    <div className="bg-zinc-900/50 rounded-2xl p-6 text-white flex flex-col h-full relative overflow-hidden border border-zinc-800/60 hover:border-zinc-700/80 transition-colors font-sans group">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-orange-500/[0.06] blur-[60px] pointer-events-none rounded-full transition-all duration-1000 group-hover:bg-orange-500/10" />
      
      {/* Header */}
      <div className="relative z-10 flex justify-between items-center mb-6">
        <h3 className="font-bold text-base leading-none tracking-tight">
          سجل <span className="font-normal text-zinc-500">الاستمرارية</span>
        </h3>
        <div className="font-bold flex items-baseline gap-1" dir="ltr">
          <span className="text-2xl font-bold text-white">{streak}</span>
          <span className="text-xs font-medium text-zinc-500">أيـام</span>
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
                ? 'bg-orange-500/15 text-orange-400 ring-1 ring-orange-500/40'
                : day.isToday
                ? 'bg-zinc-800 text-white ring-1 ring-zinc-600'
                : day.hasStudied
                ? 'bg-orange-500/8 text-orange-500/70'
                : 'bg-zinc-800/50 text-zinc-600'
            }`}
          >
            {day.label}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center mt-5 font-semibold text-orange-400/80 text-sm">
        {getStatusText()}
      </div>
    </div>
  );
}
