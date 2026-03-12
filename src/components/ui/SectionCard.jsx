export default function SectionCard({
  title,
  subtitle,
  action,
  children,
  className = '',
  contentClassName = '',
}) {
  return (
    <section className={`app-panel p-4 md:p-5 xl:p-6 ${className}`}>
      {(title || subtitle || action) && (
        <div className="mb-4 flex flex-col gap-2 md:mb-5 md:flex-row md:items-start md:justify-between">
          <div className="text-right min-w-0">
            {title && (
              <h2 className="text-[15px] font-bold md:text-base" style={{ color: 'var(--c-text)' }}>
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-1 max-w-2xl text-[12px] leading-6" style={{ color: 'var(--c-text-muted)' }}>
                {subtitle}
              </p>
            )}
          </div>
          {action && (
            <div className="flex w-full flex-wrap items-center gap-2 md:w-auto md:justify-end shrink-0">
              {action}
            </div>
          )}
        </div>
      )}

      <div className={contentClassName}>{children}</div>
    </section>
  );
}
