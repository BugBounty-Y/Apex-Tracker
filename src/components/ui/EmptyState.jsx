export default function EmptyState({
  icon,
  title,
  description,
  action,
}) {
  return (
    <div className="app-panel flex flex-col items-center px-6 py-14 text-center md:px-8 md:py-16">
      {icon && (
        <div
          className="mb-5 flex h-14 w-14 items-center justify-center rounded-[var(--radius-lg)]"
          style={{ backgroundColor: 'var(--c-elevated)', color: 'var(--c-text-muted)' }}
        >
          {icon}
        </div>
      )}

      <h3 className="text-base font-bold" style={{ color: 'var(--c-text)' }}>{title}</h3>
      <p className="mx-auto mt-2.5 max-w-md text-[13px] leading-7" style={{ color: 'var(--c-text-muted)' }}>
        {description}
      </p>
      {action && <div className="mt-5 flex w-full justify-center">{action}</div>}
    </div>
  );
}
