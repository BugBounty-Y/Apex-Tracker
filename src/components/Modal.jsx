import { useEffect, useRef } from 'react';
import { Icons } from './Icons';
import { useTheme } from '../contexts/ThemeContext';

export default function Modal({ isOpen, onClose, title, children, footer }) {
  const { isDark } = useTheme();
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') { onClose(); return; }

      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const timer = setTimeout(() => {
      const firstInput = modalRef.current?.querySelector('input');
      if (firstInput) firstInput.focus();
    }, 100);

    return () => { document.removeEventListener('keydown', handleKeyDown); clearTimeout(timer); };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ backgroundColor: 'var(--c-overlay)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="presentation"
    >
      <div
        ref={modalRef}
        className="border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in"
        style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex justify-between items-center p-6 border-b" style={{ borderColor: 'var(--c-border)' }}>
          <h3 className="text-lg font-bold" style={{ color: 'var(--c-text)' }}>{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl transition-colors"
            style={{ color: 'var(--c-text-muted)' }}
            aria-label="إغلاق"
          >
            <Icons.X />
          </button>
        </div>
        <div className="p-6 space-y-5">{children}</div>
        {footer && (
          <div className="p-6 border-t" style={{ backgroundColor: 'var(--c-surface-alt)', borderColor: 'var(--c-border)' }}>{footer}</div>
        )}
      </div>
    </div>
  );
}
