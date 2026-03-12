export default function StatCard({
  icon,
  label,
  value,
  hint,
  accent = 'var(--c-nav-active)',
}) {
  return (
    <div
      className="app-panel p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)] md:p-5"
    >
      <div className="flex items-start gap-3.5">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)]"
          style={{ backgroundColor: `${accent}12`, color: accent }}
        >
          {icon}
        </div>

        <div className="min-w-0 flex-1 text-right">
          <div className="app-kicker">{label}</div>
          <div
            className="app-stat-value mt-2"
          >
            {value}
          </div>
          {hint && (
            <div className="mt-2 text-[11px] leading-5" style={{ color: 'var(--c-text-muted)' }}>
              {hint}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
