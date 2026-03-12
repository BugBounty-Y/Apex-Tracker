import { useEffect } from 'react';
import { Icons } from '../Icons';

export default function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  widthClass = 'max-w-2xl',
}) {
  useEffect(() => {
    if (!open) return undefined;

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[92] bg-black/55 backdrop-blur-sm animate-fade-in"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      role="presentation"
    >
      <aside
        className={`absolute inset-y-0 right-0 w-full ${widthClass} overflow-y-auto border-l px-5 py-5 shadow-2xl animate-slide-in-right md:px-6 md:py-6`}
        style={{
          backgroundColor: 'var(--c-bg)',
          borderColor: 'var(--c-border)',
          color: 'var(--c-text)',
          paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))',
        }}
        role="dialog"
        aria-modal="true"
      >
        <div className="mb-6 flex items-start justify-between gap-4 border-b pb-5" style={{ borderColor: 'var(--c-border)' }}>
          <div className="min-w-0 flex-1 text-right">
            <h2 className="text-[20px] font-bold tracking-tight md:text-[22px]">{title}</h2>
            {subtitle && (
              <p className="mt-2 max-w-2xl text-[14px] leading-7" style={{ color: 'var(--c-text-muted)' }}>
                {subtitle}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border p-2 transition-colors hover:bg-white/[0.05]"
            style={{ borderColor: 'var(--c-border)', color: 'var(--c-text-muted)' }}
            aria-label="إغلاق اللوحة"
          >
            <Icons.X />
          </button>
        </div>

        <div className="space-y-6">{children}</div>
      </aside>
    </div>
  );
}
