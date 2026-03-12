import { Component } from 'react';
import { Icons } from './Icons';
import { clearAllLocalData } from '../utils/storage';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div dir="rtl" className="min-h-screen flex items-center justify-center p-6 bg-zinc-950 text-zinc-200 font-sans">
          <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icons.X />
            </div>
            <h2 className="text-xl font-bold mb-3 text-white">عذراً، حدث خطأ غير متوقع</h2>
            <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
              حدث خطأ في النظام. يمكنك محاولة إعادة تحميل الصفحة أو إعادة تعيين البيانات إذا استمرت المشكلة.
            </p>
            <div className="space-y-3">
              <button 
                onClick={() => window.location.reload()}
                className="w-full py-3 px-4 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition-colors"
              >
                إعادة تحميل الصفحة
              </button>
              <button 
                onClick={() => {
                  if (window.confirm('ستفقد جميع بياناتك، هل أنت متأكد؟')) {
                    clearAllLocalData();
                    window.location.reload();
                  }
                }}
                className="w-full py-3 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold rounded-xl transition-colors"
              >
                إعادة تعيين البيانات (مسح كامل)
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
