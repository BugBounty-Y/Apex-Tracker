import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Icons } from '../Icons';

const ConfirmDialogContext = createContext(null);

const toneStyles = {
  default: {
    icon: <Icons.HelpCircle />,
    accent: 'var(--c-nav-active)',
    buttonClass: 'bg-violet-600 hover:bg-violet-500',
  },
  danger: {
    icon: <Icons.AlertTriangle />,
    accent: '#f87171',
    buttonClass: 'bg-red-600 hover:bg-red-500',
  },
};

export function ConfirmDialogProvider({ children }) {
  const [dialogState, setDialogState] = useState(null);

  const confirm = useCallback((options) => new Promise((resolve) => {
    setDialogState({
      title: 'تأكيد الإجراء',
      description: '',
      confirmLabel: 'تأكيد',
      cancelLabel: 'إلغاء',
      tone: 'default',
      ...options,
      resolve,
    });
  }), []);

  const handleClose = useCallback((result) => {
    setDialogState((currentDialogState) => {
      currentDialogState?.resolve(result);
      return null;
    });
  }, []);

  const value = useMemo(() => ({ confirm }), [confirm]);

  const tone = toneStyles[dialogState?.tone] || toneStyles.default;

  return (
    <ConfirmDialogContext.Provider value={value}>
      {children}
      {dialogState && (
        <div
          className="fixed inset-0 z-[95] flex items-center justify-center px-4 animate-fade-in"
          style={{ backgroundColor: 'var(--c-overlay)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              handleClose(false);
            }
          }}
          role="presentation"
        >
          <div
            className="w-full max-w-md rounded-[var(--radius-card)] border p-6 animate-slide-up"
            style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)', color: 'var(--c-text)', boxShadow: 'var(--shadow-elevated)' }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
          >
            <div className="flex items-start gap-4">
              <div className="rounded-[var(--radius-md)] p-3 shrink-0" style={{ backgroundColor: `${tone.accent}12`, color: tone.accent }}>
                {tone.icon}
              </div>
              <div className="flex-1 text-right min-w-0">
                <h3 id="confirm-dialog-title" className="text-base font-bold">{dialogState.title}</h3>
                <p className="mt-1.5 text-[13px] leading-6" style={{ color: 'var(--c-text-muted)' }}>
                  {dialogState.description}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => handleClose(false)}
                className="app-btn-secondary"
              >
                {dialogState.cancelLabel}
              </button>
              <button
                type="button"
                onClick={() => handleClose(true)}
                className={`rounded-[var(--radius-btn)] px-4 py-2.5 text-[13px] font-semibold text-white transition-colors ${tone.buttonClass}`}
              >
                {dialogState.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmDialogContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useConfirm() {
  const context = useContext(ConfirmDialogContext);
  if (!context) throw new Error('useConfirm must be used inside ConfirmDialogProvider');
  return context;
}
