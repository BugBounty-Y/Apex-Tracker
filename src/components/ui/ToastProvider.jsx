import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Icons } from '../Icons';

const ToastContext = createContext(null);

const toneMap = {
  info: {
    icon: <Icons.Info />,
    accent: '#22d3ee',
    background: 'rgba(8, 47, 73, 0.95)',
    border: 'rgba(34, 211, 238, 0.18)',
  },
  success: {
    icon: <Icons.CheckCircle />,
    accent: '#34d399',
    background: 'rgba(6, 78, 59, 0.95)',
    border: 'rgba(52, 211, 153, 0.18)',
  },
  warning: {
    icon: <Icons.AlertTriangle />,
    accent: '#fbbf24',
    background: 'rgba(120, 53, 15, 0.95)',
    border: 'rgba(251, 191, 36, 0.18)',
  },
  danger: {
    icon: <Icons.XCircle />,
    accent: '#f87171',
    background: 'rgba(127, 29, 29, 0.95)',
    border: 'rgba(248, 113, 113, 0.18)',
  },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((toastConfig) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
    const nextToast = {
      id,
      tone: 'info',
      title: '',
      description: '',
      duration: 4200,
      ...toastConfig,
    };

    setToasts((currentToasts) => [...currentToasts, nextToast]);
    window.setTimeout(() => dismissToast(id), nextToast.duration);
  }, [dismissToast]);

  const value = useMemo(() => ({
    showToast,
    dismissToast,
  }), [showToast, dismissToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 left-1/2 z-[100] w-full max-w-[400px] -translate-x-1/2 px-4 space-y-2 pointer-events-none">
        {toasts.map((toast) => {
          const tone = toneMap[toast.tone] || toneMap.info;

          return (
            <div
              key={toast.id}
              className="pointer-events-auto rounded-[var(--radius-lg)] border p-3.5 animate-slide-up"
              style={{
                backgroundColor: tone.background,
                borderColor: tone.border,
                color: '#ffffff',
                boxShadow: 'var(--shadow-elevated)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
              }}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0" style={{ color: tone.accent }}>
                  {tone.icon}
                </div>
                <div className="flex-1 text-right min-w-0">
                  <div className="text-[13px] font-bold">{toast.title}</div>
                  {toast.description && (
                    <p className="mt-0.5 text-[12px] leading-5 text-white/65">{toast.description}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => dismissToast(toast.id)}
                  className="rounded-[var(--radius-sm)] p-1 text-white/40 transition-colors hover:text-white hover:bg-white/10 shrink-0"
                  aria-label="إغلاق التنبيه"
                >
                  <Icons.X />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside ToastProvider');
  return context;
}
