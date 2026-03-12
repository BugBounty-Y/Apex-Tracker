export default function StatCard({
  icon,
  label,
  value,
  hint,
  accent = 'var(--c-nav-active)',
  emphasis = 'neutral',
}) {
  return (
    <div
      className="app-panel p-4 transition-all duration-200 hover:-translate-y-0.5 md:p-5"
      style={{
        borderColor: emphasis === 'strong' ? `${accent}33` : 'var(--c-border)',
      }}
    >
      <div className="flex items-start gap-3.5">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[16px]"
          style={{ backgroundColor: `${accent}14`, color: accent }}
        >
          {icon}
        </div>

        <div className="min-w-0 flex-1 text-right">
          <div className="app-kicker">{label}</div>
          <div className="mt-2.5 text-[24px] font-bold leading-none tracking-tight tabular-nums md:text-[28px]" style={{ color: 'var(--c-text)' }}>
            {value}
          </div>
          {hint && (
            <div className="mt-2.5 text-[11px] leading-5 md:text-[12px]" style={{ color: 'var(--c-text-muted)' }}>
              {hint}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
