export default function EmptyState({
  icon,
  title,
  description,
  action,
}) {
  return (
    <div className="app-panel flex flex-col items-center px-6 py-12 text-center md:px-8 md:py-14">
      {icon && (
        <div
          className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{ backgroundColor: 'var(--c-elevated)', color: 'var(--c-text-muted)' }}
        >
          {icon}
        </div>
      )}

      <h3 className="text-[18px] font-bold" style={{ color: 'var(--c-text)' }}>{title}</h3>
      <p className="mx-auto mt-3 max-w-xl text-[14px] leading-8" style={{ color: 'var(--c-text-muted)' }}>
        {description}
      </p>
      {action && <div className="mt-6 flex w-full justify-center">{action}</div>}
    </div>
  );
}
