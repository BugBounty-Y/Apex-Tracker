export default function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}) {
  return (
    <header className="space-y-1">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="text-right">
          {eyebrow && <div className="app-kicker">{eyebrow}</div>}
          <h1
            className="mt-1.5 text-xl font-bold leading-tight tracking-tight md:text-[24px] xl:text-[28px]"
            style={{ color: 'var(--c-text)', letterSpacing: '-0.02em' }}
          >
            {title}
          </h1>
          {description && (
            <p
              className="mt-2 max-w-2xl text-[13px] leading-7"
              style={{ color: 'var(--c-text-muted)' }}
            >
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex w-full flex-wrap items-center gap-2.5 md:w-auto md:justify-end shrink-0">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}
