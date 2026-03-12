import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Icons } from './Icons';

export default function AuthPage() {
  const { isDark } = useTheme();
  const { login, register, loginWithGoogle } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail) { setError('يرجى إدخال البريد الإلكتروني.'); return; }
    if (!password) { setError('يرجى إدخال كلمة المرور.'); return; }
    if (password.length < 6) { setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل.'); return; }
    if (isRegister && password !== confirmPassword) {
      setError('كلمة المرور وتأكيدها غير متطابقتين.');
      return;
    }

    setIsLoading(true);
    const result = isRegister
      ? await register(trimmedEmail, password)
      : await login(trimmedEmail, password);
    setIsLoading(false);

    if (!result.success && result.error) {
      setError(result.error);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);
    const result = await loginWithGoogle();
    setIsLoading(false);
    if (!result.success && result.error) {
      setError(result.error);
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setError('');
    setConfirmPassword('');
  };

  const inputStyle = { backgroundColor: 'var(--c-input)', borderColor: 'var(--c-border)', color: 'var(--c-text)' };

  return (
    <div
      dir="rtl"
      className={`min-h-screen flex items-center justify-center p-4 font-sans ${isDark ? '' : 'light'}`}
      style={{ backgroundColor: 'var(--c-bg)', color: 'var(--c-text)' }}
    >
      {/* Background glows — subtle */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full blur-[120px]"
          style={{ backgroundColor: 'rgba(139,92,246,0.06)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full blur-[100px]"
          style={{ backgroundColor: 'rgba(34,211,238,0.04)' }} />
      </div>

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-7">
          <div className="w-14 h-14 bg-gradient-to-br from-violet-600 to-violet-500 rounded-[18px] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-600/20">
            <span className="text-white font-black text-xl">A</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--c-text)', letterSpacing: '-0.02em' }}>
            Apex Tracker
          </h1>
          <p className="text-[13px] font-medium mt-1" style={{ color: 'var(--c-text-muted)' }}>
            {isRegister ? 'إنشاء حساب جديد' : 'تسجيل الدخول إلى حسابك'}
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-[var(--radius-card)] border p-6 md:p-7"
          style={{
            backgroundColor: 'var(--c-surface)',
            borderColor: 'var(--c-border)',
            boxShadow: 'var(--shadow-elevated)',
          }}
        >
          {/* Error message */}
          {error && (
            <div className="mb-5 p-3 rounded-[var(--radius-md)] text-[13px] font-semibold flex items-center gap-2 animate-fade-in"
              style={{ backgroundColor: 'var(--c-danger-soft)', color: 'var(--c-danger)', border: '1px solid rgba(248, 113, 113, 0.15)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Google Sign-in */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-[var(--radius-btn)] border text-[13px] font-semibold transition-all hover:bg-[var(--c-surface-hover)] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              borderColor: 'var(--c-border)',
              color: 'var(--c-text)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {isLoading ? 'جارٍ التحميل...' : 'تسجيل الدخول بـ Google'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ backgroundColor: 'var(--c-border)' }} />
            <span className="app-label mb-0" style={{ fontSize: '0.625rem' }}>أو</span>
            <div className="flex-1 h-px" style={{ backgroundColor: 'var(--c-border)' }} />
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label htmlFor="auth-email" className="app-label">البريد الإلكتروني</label>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="app-control"
                style={inputStyle}
                placeholder="example@email.com"
                dir="ltr"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label htmlFor="auth-password" className="app-label">كلمة المرور</label>
              <input
                id="auth-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="app-control"
                style={inputStyle}
                placeholder="••••••••"
                dir="ltr"
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                required
                minLength={6}
              />
            </div>

            {isRegister && (
              <div className="animate-fade-in">
                <label htmlFor="auth-confirm-password" className="app-label">تأكيد كلمة المرور</label>
                <input
                  id="auth-confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="app-control"
                  style={inputStyle}
                  placeholder="••••••••"
                  dir="ltr"
                  autoComplete="new-password"
                  required
                  minLength={6}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="app-btn-primary w-full justify-center"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isRegister ? <Icons.Plus /> : <Icons.Check />}
                  {isRegister ? 'إنشاء الحساب' : 'تسجيل الدخول'}
                </>
              )}
            </button>
          </form>

          {/* Toggle login/register */}
          <div className="text-center mt-5 pt-4 border-t" style={{ borderColor: 'var(--c-border)' }}>
            <span className="text-[13px] font-medium" style={{ color: 'var(--c-text-muted)' }}>
              {isRegister ? 'لديك حساب بالفعل؟' : 'ليس لديك حساب؟'}{' '}
            </span>
            <button
              type="button"
              onClick={toggleMode}
              className="text-[13px] font-bold transition-colors hover:opacity-80"
              style={{ color: 'var(--c-accent)' }}
            >
              {isRegister ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] font-medium mt-5" style={{ color: 'var(--c-text-faint)' }}>
          بياناتك محمية ومشفرة ومخزنة بشكل آمن.
        </p>
      </div>
    </div>
  );
}
