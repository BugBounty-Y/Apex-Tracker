// ==========================================
// AUTH CONTEXT — Firebase Authentication
// ==========================================
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  deleteUser,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

const AuthContext = createContext(null);

/**
 * Maps Firebase error codes to user-friendly Arabic messages.
 */
function getArabicAuthError(code) {
  const map = {
    'auth/email-already-in-use': 'هذا البريد الإلكتروني مسجل بالفعل.',
    'auth/invalid-email': 'صيغة البريد الإلكتروني غير صحيحة.',
    'auth/user-not-found': 'لا يوجد حساب مرتبط بهذا البريد.',
    'auth/wrong-password': 'كلمة المرور غير صحيحة.',
    'auth/invalid-credential': 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
    'auth/weak-password': 'كلمة المرور ضعيفة — يجب أن تكون 6 أحرف على الأقل.',
    'auth/too-many-requests': 'تم تجاوز عدد المحاولات. يرجى الانتظار ثم المحاولة مجدداً.',
    'auth/network-request-failed': 'خطأ في الاتصال بالشبكة. تحقق من الإنترنت.',
    'auth/popup-closed-by-user': 'تم إغلاق نافذة تسجيل الدخول.',
    'auth/popup-blocked': 'تم حظر النافذة المنبثقة. يرجى السماح بالنوافذ المنبثقة.',
    'auth/cancelled-popup-request': '', // silent — user just closed the popup
    'auth/account-exists-with-different-credential': 'هذا البريد مسجل بطريقة أخرى. جرّب تسجيل الدخول بالبريد وكلمة المرور.',
    'auth/requires-recent-login': 'لأسباب أمنية، يرجى تسجيل الخروج ثم الدخول مجدداً لاتخاذ هذا الإجراء.',
  };
  return map[code] || 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.';
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while checking initial auth state

  // Listen for auth state changes (fires once on mount + on every login/logout)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // --- Auth methods ---

  const login = useCallback(async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (err) {
      return { success: false, error: getArabicAuthError(err.code) };
    }
  }, []);

  const register = useCallback(async (email, password) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (err) {
      return { success: false, error: getArabicAuthError(err.code) };
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      return { success: true };
    } catch (err) {
      const msg = getArabicAuthError(err.code);
      // Silent close — not a real error
      if (err.code === 'auth/cancelled-popup-request' || err.code === 'auth/popup-closed-by-user') {
        return { success: false, error: '' };
      }
      return { success: false, error: msg };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch {
      // Fail silently — user will see they're still logged in
    }
  }, []);

  const deleteAccount = useCallback(async () => {
    try {
      if (auth.currentUser) {
        await deleteUser(auth.currentUser);
        return { success: true };
      }
      return { success: false, error: 'المستخدم غير مسجل الدخول' };
    } catch (err) {
      return { success: false, error: getArabicAuthError(err.code) };
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginWithGoogle, logout, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
