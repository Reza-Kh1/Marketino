'use client';

/**
 * ============================================================
 * 🔐 Auth Context — Real Backend API
 * ============================================================
 */

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User } from '@/lib/api';
import { authApi, setAuthToken } from '@/lib/api';
import toast from 'react-hot-toast';
import { useRouter } from '@/i18n/navigation';
import Cookies from 'js-cookie';
interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSeller: boolean;
  isAdmin: boolean;
}

interface AuthContextType extends AuthState {
  isSuperAdmin: boolean;
  permissions: string[];
  login: (username: string, password: string) => Promise<void>;
  register: (data: Record<string, string>) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (user: User) => void;
  sendEmailOTP: (email: string) => Promise<void>;
  sendPhoneOTP: (phone: string) => Promise<void>;
  verifyEmailOTP: (data: { email: string; code: string; isRegister?: boolean; username?: string; firstName?: string; lastName?: string; password?: string }) => Promise<{ isNewUser: boolean }>;
  verifyPhoneOTP: (data: { phone: string; code: string; isRegister?: boolean; username?: string; firstName?: string; lastName?: string; password?: string }) => Promise<{ isNewUser: boolean }>;
  registerSellerOTP: (data: { email?: string; phone?: string; code: string; username: string; password: string; firstName: string; lastName: string; storeName: string; businessType: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
    isSeller: false,
    isAdmin: false,
  });

  // 🔄 Try to restore session from token on mount
  useEffect(() => {
    const restoreSession = async () => {
      const nameCookie = process.env.NEXT_PUBLIC_TOKEN_COOKIE || 'token-marketino'
      try {
        // Only try if we have a stored token
        const storedToken = typeof window !== 'undefined' ? localStorage.getItem('bazarche_auth_token') : null;
        const token = Cookies.get(nameCookie)
        if (!token && !storedToken) {
          setState(s => ({ ...s, isLoading: false }));
          return;
        }
        const res = await authApi.me();        
        if (res && res.user) {
          setState({
            user: res.user,
            token: storedToken,
            isLoading: false,
            isAuthenticated: true,
            isSeller: res.user.role === 'seller',
            isAdmin: res.user.role === 'admin',
          });
          return;
        }
      } catch (err: any) {
        const status = err?.response?.status;
        const isUnauthorized = status === 401 || err?.message?.includes('Unauthorized');
        if (isUnauthorized) {
          await authApi.logout()
          setAuthToken(null);
        }
      }
      setState(s => ({ ...s, isLoading: false }));
    };
    restoreSession();
  }, []);

  const setAuth = useCallback((user: User, token?: string) => {
    setState({
      user,
      token: token || null,
      isLoading: false,
      isAuthenticated: true,
      isSeller: user.role === 'seller',
      isAdmin: user.role === 'admin',
    });
  }, []);

  // 🔑 Login with username/email/phone + password via REAL API
  const login = useCallback(async (username: string, password: string) => {
    try {
      const res = await authApi.login(username, password);
      if (!res || !res.user) {
        throw new Error('نام کاربری یا رمز عبور اشتباه است');
      }
      // Store token for subsequent requests
      if ((res as any).token) {
        setAuthToken((res as any).token);
      }
      setAuth(res.user, (res as any).token);
      toast.success(`خوش آمدید ${res.user.firstName || res.user.username}! 👋`);
    } catch (err: any) {
      const msg = err?.message || 'نام کاربری یا رمز عبور اشتباه است';
      toast.error(msg);
      throw err;
    }
  }, [setAuth]);

  // 📝 Register via REAL API
  const register = useCallback(async (data: Record<string, string>) => {
    try {
      const res = await authApi.register(data);
      if (!res || !res.user) {
        throw new Error('خطا در ثبت‌نام');
      }
      setAuth(res.user, (res as any).token);
      toast.success('ثبت‌نام با موفقیت انجام شد! 🎉');
    } catch (err: any) {
      const msg = err?.message || 'خطا در ثبت‌نام';
      toast.error(msg);
      throw err;
    }
  }, [setAuth]);

  // 🚪 Logout via REAL API + redirect
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore errors
    }
    setAuthToken(null);
    setState(s => ({
      ...s,
      user: null,
      token: null,
      isAuthenticated: false,
      isSeller: false,
      isAdmin: false,
    }));
    toast.success('خارج شدید');
    router.push('/');
  }, [router]);

  const isSuperAdmin = state.user?.isSuperAdmin || false;
  const permissions: string[] = (() => {
    const perm = state.user?.permissions;
    if (!perm) return [];
    if (Array.isArray(perm)) return perm;
    if (typeof perm === 'string') { try { return JSON.parse(perm); } catch { return []; } }
    return [];
  })();

  const updateUser = useCallback((user: User) => {
    setState(s => ({
      ...s,
      user,
      isSeller: user.role === 'seller',
      isAdmin: user.role === 'admin',
    }));
  }, []);

  // 📧 Send email OTP via REAL API
  const sendEmailOTP = useCallback(async (email: string) => {
    try {
      await authApi.sendEmailOTP(email);
      toast.success('کد تأیید به ایمیل شما ارسال شد ✉️');
    } catch (err: any) {
      toast.error(err?.message || 'خطا در ارسال کد');
      throw err;
    }
  }, []);

  // 📱 Send phone OTP via REAL API
  const sendPhoneOTP = useCallback(async (phone: string) => {
    try {
      await authApi.sendPhoneOTP(phone);
      toast.success('کد تأیید به شماره شما ارسال شد 📱');
    } catch (err: any) {
      toast.error(err?.message || 'خطا در ارسال کد');
      throw err;
    }
  }, []);

  // ✅ Verify email OTP via REAL API
  const verifyEmailOTP = useCallback(async (data: {
    email: string; code: string; isRegister?: boolean;
    username?: string; firstName?: string; lastName?: string; password?: string;
  }) => {
    try {
      const res = await authApi.verifyEmailOTP(data);
      if (!res || !res.user) {
        throw new Error('کد تأیید نامعتبر است');
      }
      setAuth(res.user, (res as any).token);
      toast.success(res.isNewUser ? 'ثبت‌نام با موفقیت انجام شد! 🎉' : `خوش آمدید ${res.user.firstName || res.user.username}! 👋`);
      return { isNewUser: res.isNewUser };
    } catch (err: any) {
      toast.error(err?.message || 'کد تأیید نامعتبر است');
      throw err;
    }
  }, [setAuth]);

  // ✅ Verify phone OTP via REAL API
  const verifyPhoneOTP = useCallback(async (data: {
    phone: string; code: string; isRegister?: boolean;
    username?: string; firstName?: string; lastName?: string; password?: string;
  }) => {
    try {
      const res = await authApi.verifyPhoneOTP(data);
      if (!res || !res.user) {
        throw new Error('کد تأیید نامعتبر است');
      }
      setAuth(res.user, (res as any).token);
      toast.success(res.isNewUser ? 'ثبت‌نام با موفقیت انجام شد! 🎉' : `خوش آمدید ${res.user.firstName || res.user.username}! 👋`);
      return { isNewUser: res.isNewUser };
    } catch (err: any) {
      toast.error(err?.message || 'کد تأیید نامعتبر است');
      throw err;
    }
  }, [setAuth]);

  // 🏪 Register seller via REAL API
  const registerSellerOTP = useCallback(async (data: {
    email?: string; phone?: string; code: string;
    username: string; password: string; firstName: string; lastName: string;
    storeName: string; businessType: string;
  }) => {
    try {
      const res = await authApi.registerSellerOTP(data);
      if (!res || !res.user) {
        throw new Error('خطا در ثبت فروشگاه');
      }
      setAuth(res.user, (res as any).token);
      toast.success('فروشگاه شما با موفقیت ایجاد شد! 🎉');
    } catch (err: any) {
      toast.error(err?.message || 'خطا در ثبت فروشگاه');
      throw err;
    }
  }, [setAuth]);

  // 🔄 Refresh user via REAL API
  const refreshUser = useCallback(async () => {
    try {
      const res = await authApi.me();
      if (res && res.user) {
        setAuth(res.user);
      }
    } catch {
      // session expired
    }
  }, [setAuth]);

  return (
    <AuthContext.Provider value={{
      ...state, isSuperAdmin, permissions,
      login, register, logout, refreshUser, updateUser,
      sendEmailOTP, sendPhoneOTP, verifyEmailOTP, verifyPhoneOTP, registerSellerOTP,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
