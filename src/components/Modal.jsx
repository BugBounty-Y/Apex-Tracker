import { useEffect, useRef } from 'react';
import { Icons } from './Icons';

export default function Modal({ isOpen, onClose, title, children, footer }) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

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
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="presentation"
    >
      <div
        ref={modalRef}
        className="bg-[#111113] border border-zinc-800/60 rounded-2xl shadow-2xl shadow-black/30 w-full max-w-md overflow-hidden animate-fade-in"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex justify-between items-center p-6 border-b border-zinc-800/60">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white hover:bg-zinc-800 p-1.5 rounded-xl transition-colors"
            aria-label="إغلاق"
          >
            <Icons.X />
          </button>
        </div>
        <div className="p-6 space-y-5">{children}</div>
        {footer && (
          <div className="p-6 bg-zinc-900/50 border-t border-zinc-800/60">{footer}</div>
        )}
      </div>
    </div>
  );
}
