'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { authApi, setAuthToken } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { userService, UserType } from '@/services/user.service';
import { toast } from 'sonner';

interface AuthState {
  user: UserType | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSeller: boolean;
  isAdmin: boolean;
  storeId: null | string;
  storeSlug: string | null;
  permissions: string[];
}

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  register: (data: Record<string, string>) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (user: UserType) => void;
  sendEmailOTP: (email: string) => Promise<void>;
  sendPhoneOTP: (phone: string) => Promise<void>;
  verifyEmailOTP: (data: { email: string; code: string; isRegister?: boolean; username?: string; firstName?: string; lastName?: string; password?: string }) => Promise<{ isNewUser: boolean }>;
  verifyPhoneOTP: (data: { phone: string; code: string; isRegister?: boolean; username?: string; firstName?: string; lastName?: string; password?: string }) => Promise<{ isNewUser: boolean }>;
  registerSellerOTP: (data: { email?: string; phone?: string; code: string; username: string; password: string; firstName: string; lastName: string; storeName: string; businessType: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ✅ Helper: ساخت state از user — تنها منبع حقیقت
function buildAuthState(user: UserType | null, token: string | null, isLoading = false): AuthState {
  if (!user) {
    return {
      user: null,
      token,
      isLoading,
      isAuthenticated: false,
      isSeller: false,
      isAdmin: false,
      storeId: null,
      storeSlug: null,
      permissions: [],
    };
  }

  const role = user.role;
  return {
    user,
    token,
    isLoading,
    isAuthenticated: true,
    isSeller: role === 'seller',
    isAdmin: role === 'admin' || role === 'superAdmin',
    storeId: user?.store?.id ?? null,
    storeSlug: user?.store?.slug ?? null,
    permissions: Array.isArray(user.permissions) ? user.permissions : [],
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
    isSeller: false,
    isAdmin: false,
    storeId: null,
    storeSlug: null,
    permissions: [],
  });

  // 🔄 Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      const nameCookie = process.env.NEXT_PUBLIC_TOKEN_COOKIE || 'token-marketino';
      try {
        const storedToken = typeof window !== 'undefined' ? localStorage.getItem('bazarche_auth_token') : null;
        const token = Cookies.get(nameCookie);
        if (!token && !storedToken) {
          setState(s => ({ ...s, isLoading: false }));
          return;
        }
        const res = await userService.profile();
        if (res.id) {
          setState(buildAuthState(res, storedToken));
          return;
        }
      } catch (err: any) {
        const status = err?.response?.status;
        const isUnauthorized = status === 401 || err?.message?.includes('Unauthorized');
        if (isUnauthorized) {
          await authApi.logout();
          setAuthToken(null);
        }
      }
      setState(s => ({ ...s, isLoading: false }));
    };
    restoreSession();
  }, []);

  /**
   * ✅ setAuth:
   * - اگر user.store وجود نداشت (مثل پاسخ login)، profile() را صدا می‌زند
   * - فقط برای فروشنده‌ها این کار را می‌کند تا درخواست اضافه برای خریدار/ادمین نزند
   */
  const setAuth = useCallback(async (user: UserType, token?: string): Promise<UserType> => {
    let fullUser = user;

    if (user.role === 'seller' && !user.store) {
      try {
        const profile = await userService.profile();
        if (profile?.id) fullUser = profile;
      } catch {
        // اگر profile خطا داد، با همان user اولیه ادامه بده
      }
    }

    setState(buildAuthState(fullUser, token || null));
    return fullUser;
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    try {
      const res = await authApi.login(username, password);
      if (!res || !res.user) {
        throw new Error('نام کاربری یا رمز عبور اشتباه است');
      }
      if ((res as any).token) {
        setAuthToken((res as any).token);
      }
      // ✅ await تا store کامل شود
      await setAuth(res.user, (res as any).token);
      toast.success(`خوش آمدید ${res.user.firstName || res.user.username}! 👋`);
    } catch (err: any) {
      const msg = err?.message || 'نام کاربری یا رمز عبور اشتباه است';
      toast.error(msg);
      throw err;
    }
  }, [setAuth]);

  const register = useCallback(async (data: Record<string, string>) => {
    try {
      const res = await authApi.register(data);
      if (!res || !res.user) {
        throw new Error('خطا در ثبت‌نام');
      }
      await setAuth(res.user, (res as any).token);
      toast.success('ثبت‌نام با موفقیت انجام شد! 🎉');
    } catch (err: any) {
      const msg = err?.message || 'خطا در ثبت‌نام';
      toast.error(msg);
      throw err;
    }
  }, [setAuth]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch { /* ignore */ }
    setAuthToken(null);
    setState(buildAuthState(null, null, false));
    toast.success('خارج شدید');
    router.push('/');
  }, [router]);

  const updateUser = useCallback((user: UserType) => {
    setState(s => buildAuthState(user, s.token, s.isLoading));
  }, []);

  const sendEmailOTP = useCallback(async (email: string) => {
    try {
      await authApi.sendEmailOTP(email);
      toast.success('کد تأیید به ایمیل شما ارسال شد ✉️');
    } catch (err: any) {
      toast.error(err?.message || 'خطا در ارسال کد');
      throw err;
    }
  }, []);

  const sendPhoneOTP = useCallback(async (phone: string) => {
    try {
      await authApi.sendPhoneOTP(phone);
      toast.success('کد تأیید به شماره شما ارسال شد 📱');
    } catch (err: any) {
      toast.error(err?.message || 'خطا در ارسال کد');
      throw err;
    }
  }, []);

  const verifyEmailOTP = useCallback(async (data: {
    email: string; code: string; isRegister?: boolean;
    username?: string; firstName?: string; lastName?: string; password?: string;
  }) => {
    try {
      const res = await authApi.verifyEmailOTP(data);
      if (!res || !res.user) {
        throw new Error('کد تأیید نامعتبر است');
      }
      await setAuth(res.user, (res as any).token);
      toast.success(res.isNewUser ? 'ثبت‌نام با موفقیت انجام شد! 🎉' : `خوش آمدید ${res.user.firstName || res.user.username}! 👋`);
      return { isNewUser: res.isNewUser };
    } catch (err: any) {
      toast.error(err?.message || 'کد تأیید نامعتبر است');
      throw err;
    }
  }, [setAuth]);

  const verifyPhoneOTP = useCallback(async (data: {
    phone: string; code: string; isRegister?: boolean;
    username?: string; firstName?: string; lastName?: string; password?: string;
  }) => {
    try {
      const res = await authApi.verifyPhoneOTP(data);
      if (!res || !res.user) {
        throw new Error('کد تأیید نامعتبر است');
      }
      await setAuth(res.user, (res as any).token);
      toast.success(res.isNewUser ? 'ثبت‌نام با موفقیت انجام شد! 🎉' : `خوش آمدید ${res.user.firstName || res.user.username}! 👋`);
      return { isNewUser: res.isNewUser };
    } catch (err: any) {
      toast.error(err?.message || 'کد تأیید نامعتبر است');
      throw err;
    }
  }, [setAuth]);

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
      await setAuth(res.user, (res as any).token);
      toast.success('فروشگاه شما با موفقیت ایجاد شد! 🎉');
    } catch (err: any) {
      toast.error(err?.message || 'خطا در ثبت فروشگاه');
      throw err;
    }
  }, [setAuth]);

  const refreshUser = useCallback(async () => {
    try {
      const res = await authApi.me();
      if (res && res.user) {
        await setAuth(res.user);
      }
    } catch { /* session expired */ }
  }, [setAuth]);

  const value = useMemo<AuthContextType>(() => ({
    ...state,
    login, register, logout, refreshUser, updateUser,
    sendEmailOTP, sendPhoneOTP, verifyEmailOTP, verifyPhoneOTP, registerSellerOTP,
  }), [state, login, register, logout, refreshUser, updateUser, sendEmailOTP, sendPhoneOTP, verifyEmailOTP, verifyPhoneOTP, registerSellerOTP]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}