import { Link } from 'react-router-dom';

export default function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  breadcrumbs = [],
}) {
  return (
    <header className="space-y-3 md:space-y-4">
      {breadcrumbs.length > 0 && (
        <nav className="flex flex-wrap items-center gap-2 text-xs font-medium" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.label} className="flex items-center gap-2">
              {crumb.to ? (
                <Link
                  to={crumb.to}
                  className="transition-colors hover:text-violet-400"
                  style={{ color: 'var(--c-text-faint)' }}
                >
                  {crumb.label}
                </Link>
              ) : (
                <span style={{ color: 'var(--c-text)' }}>{crumb.label}</span>
              )}
              {index < breadcrumbs.length - 1 && <span style={{ color: 'var(--c-text-faint)' }}>/</span>}
            </div>
          ))}
        </nav>
      )}

      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div className="text-right">
          {eyebrow && <div className="app-kicker">{eyebrow}</div>}
          <h1
            className="mt-1 text-[22px] font-bold leading-tight tracking-tight md:text-[26px] xl:text-[30px]"
            style={{ color: 'var(--c-text)' }}
          >
            {title}
          </h1>
          {description && (
            <p
              className="mt-2.5 max-w-3xl text-[13px] leading-7 md:text-[14px]"
              style={{ color: 'var(--c-text-muted)' }}
            >
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex w-full flex-wrap items-center gap-2.5 md:w-auto md:justify-end">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}
