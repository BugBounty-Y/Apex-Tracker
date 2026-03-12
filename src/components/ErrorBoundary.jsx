import { Component } from 'react';
import { Icons } from './Icons';
import { clearAllLocalData } from '../utils/storage';
import { reportError } from '../utils/telemetry';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      showResetConfirm: false,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    reportError(error, { componentStack: errorInfo?.componentStack || '' });
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center bg-zinc-950 p-6 font-sans text-zinc-200">
        <div className="w-full max-w-md rounded-[24px] border border-zinc-800 bg-zinc-900 p-8 text-center shadow-2xl">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-400">
            <Icons.X />
          </div>
          <h2 className="text-xl font-bold text-white">حدث خطأ غير متوقع</h2>
          <p className="mt-3 text-sm leading-7 text-zinc-400">
            سجّلنا الخطأ تقنيًا إن كانت خدمة المراقبة مفعلة. يمكنك إعادة تحميل الصفحة، أو إعادة تعيين البيانات إذا ظلت المشكلة مستمرة.
          </p>

          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="w-full rounded-[14px] bg-violet-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-violet-500"
            >
              إعادة تحميل الصفحة
            </button>
            <button
              type="button"
              onClick={() => this.setState({ showResetConfirm: true })}
              className="w-full rounded-[14px] bg-red-500/10 px-4 py-3 font-semibold text-red-400 transition-colors hover:bg-red-500/20"
            >
              إعادة تعيين البيانات
            </button>
          </div>
        </div>

        {this.state.showResetConfirm && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                this.setState({ showResetConfirm: false });
              }
            }}
            role="presentation"
          >
            <div
              className="w-full max-w-md rounded-[20px] border border-zinc-800 bg-zinc-900 p-6 shadow-2xl"
              role="dialog"
              aria-modal="true"
            >
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-red-500/10 p-3 text-red-400">
                  <Icons.AlertTriangle />
                </div>
                <div className="flex-1 text-right">
                  <h3 className="text-lg font-semibold text-white">تأكيد مسح البيانات المحلية</h3>
                  <p className="mt-2 text-sm leading-7 text-zinc-400">
                    سيؤدي هذا إلى حذف البيانات المحلية المخزنة على هذا الجهاز ثم إعادة تحميل التطبيق. استخدمه فقط إذا استمرت المشكلة.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => this.setState({ showResetConfirm: false })}
                  className="rounded-xl bg-zinc-800 px-4 py-2.5 text-sm font-semibold text-zinc-300 transition-colors hover:bg-zinc-700"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={() => {
                    clearAllLocalData();
                    window.location.reload();
                  }}
                  className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-500"
                >
                  نعم، امسح وأعد التحميل
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}
