import { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, Home, ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, _errorInfo: ErrorInfo) {
    // Production-safe error logging: Log only the safe message without tokens or user data
    if (typeof console !== 'undefined' && console.error) {
      console.error('Sakinah caught an unhandled rendering error:', error.message || 'Unknown error');
    }
  }

  private handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  private handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          dir="rtl"
          className="min-h-screen bg-sand-50 dark:bg-night-900 text-stone-800 dark:text-night-text flex items-center justify-center p-4 selection:bg-islamic-800 selection:text-sand-50"
        >
          <div className="max-w-md w-full bg-white/80 dark:bg-night-800/80 backdrop-blur-xl border border-stone-200/60 dark:border-white/10 rounded-3xl p-6 sm:p-8 text-center shadow-2xl space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/20">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-bold font-amiri text-stone-900 dark:text-white">
                حدث خطأ غير متوقع
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-slate-300 leading-relaxed font-sans">
                نعتذر عن هذا الخطأ المؤقت في العرض. يمكنك محاولة إعادة تحميل الصفحة للمتابعة في سكينة.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 py-3 px-4 rounded-xl bg-islamic-800 hover:bg-islamic-900 text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
              >
                <RefreshCw className="w-4 h-4" />
                <span>إعادة المحاولة</span>
              </button>

              <button
                onClick={this.handleGoHome}
                className="py-3 px-4 rounded-xl bg-stone-100 dark:bg-white/5 hover:bg-stone-200 dark:hover:bg-white/10 text-stone-700 dark:text-slate-200 font-medium text-xs sm:text-sm flex items-center justify-center gap-2 border border-stone-200 dark:border-white/10 transition-all active:scale-[0.98]"
              >
                <Home className="w-4 h-4" />
                <span>الرئيسية</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
