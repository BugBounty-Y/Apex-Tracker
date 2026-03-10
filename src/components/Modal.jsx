import { useEffect, useRef } from 'react';
import { Icons } from './Icons';

/**
 * Modal — reusable accessible modal component.
 *
 * Features:
 * - Focus trap (Tab/Shift+Tab stays inside modal)
 * - Escape key closes modal
 * - Click outside (backdrop) closes modal
 * - aria-modal, role="dialog" for screen readers
 */
export default function Modal({ isOpen, onClose, title, children, footer }) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      // Focus trap
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Focus the modal on open
    const timer = setTimeout(() => {
      const firstInput = modalRef.current?.querySelector('input');
      if (firstInput) firstInput.focus();
    }, 100);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="presentation"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden animate-fade-in"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors"
            aria-label="إغلاق"
          >
            <Icons.X />
          </button>
        </div>
        <div className="p-6 space-y-5">{children}</div>
        {footer && (
          <div className="p-6 bg-slate-50 border-t border-slate-100">{footer}</div>
        )}
      </div>
    </div>
  );
}
