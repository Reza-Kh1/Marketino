/**
 * ============================================================
 * 🔧 Mock Auth — حالت آفلاین وقتی بک‌اند در دسترس نیست
 * ============================================================
 */
'use client';

import type { User } from './api';

const MOCK_USERS: Record<string, { user: User; password: string }> = {};

// Create default users (always run - MOCK_USERS resets on page refresh)
function initMockUsers() {
  if (typeof window === 'undefined') return;

  // Always add default users (skip if already in memory)
  const users: Array<{
    username: string; email: string; phone: string; password: string;
    firstName?: string; lastName?: string;
    role?: string; storeName?: string; businessType?: string;
    isSuperAdmin?: boolean; permissions?: string[];
  }> = [
    { username: 'admin', email: 'admin@bazarche.ir', phone: '09101111111', password: 'admin123', firstName: 'مدیر', lastName: 'اصلی', role: 'admin', isSuperAdmin: true, permissions: ['all'] },
    { username: 'staff1', email: 'staff1@bazarche.ir', phone: '09102222222', password: 'staff123', firstName: 'کارمند', lastName: 'یک', role: 'admin', isSuperAdmin: false, permissions: ['users', 'products', 'orders', 'dashboard', 'discounts', 'sellers', 'reviews'] },
    { username: 'staff2', email: 'staff2@bazarche.ir', phone: '09103333333', password: 'staff123', firstName: 'کارمند', lastName: 'دو', role: 'admin', isSuperAdmin: false, permissions: ['dashboard', 'products', 'orders'] },
    { username: 'seller1', email: 'seller1@bazarche.ir', phone: '09104444444', password: 'seller123', firstName: 'فروشنده', lastName: 'یک', role: 'seller', storeName: 'فروشگاه تست', businessType: 'electronics', isSuperAdmin: false },
    { username: 'seller2', email: 'seller2@bazarche.ir', phone: '09105555555', password: 'seller123', firstName: 'فروشنده', lastName: 'دو', role: 'seller', storeName: 'فروشگاه پوشاک', businessType: 'clothing', isSuperAdmin: false },
    { username: 'buyer1', email: 'buyer1@bazarche.ir', phone: '09106666666', password: 'buyer123', firstName: 'خریدار', lastName: 'یک', role: 'buyer', isSuperAdmin: false },
    { username: 'buyer2', email: 'buyer2@bazarche.ir', phone: '09107777777', password: 'buyer123', firstName: 'خریدار', lastName: 'دو', role: 'buyer', isSuperAdmin: false },
  ];

  for (const u of users) {
    if (MOCK_USERS[u.email]) continue; // already in memory
    addMockUser(u);
  }
}

function addMockUser(data: {
  username: string; email: string; phone?: string; password: string;
  firstName?: string; lastName?: string;
  role?: string; storeName?: string; businessType?: string;
  isSuperAdmin?: boolean; permissions?: string[];
}) {
  const id = 'mock_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
  const user: User = {
    id,
    username: data.username,
    email: data.email,
    phone: data.phone,
    firstName: data.firstName,
    lastName: data.lastName,
    role: (data.role as User['role']) || 'buyer',
    storeName: data.storeName,
    businessType: data.businessType,
    isVerified: true,
    isActive: true,
    isSuperAdmin: data.isSuperAdmin || false,
    permissions: data.permissions || [],
    sellerStatus: data.role === 'seller' ? 'approved' : undefined,
    createdAt: new Date().toISOString(),
  };
  MOCK_USERS[data.email] = { user, password: data.password };
  MOCK_USERS[data.username] = { user, password: data.password };
  if (data.phone) MOCK_USERS[data.phone] = { user, password: data.password };
}

/** Get a mock token (just a random string) */
function mockToken(): string {
  return 'mock_token_' + Math.random().toString(36).slice(2);
}

/** Save mock session */
function saveSession(user: User, token: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('__mock_user', JSON.stringify(user));
  localStorage.setItem('__mock_token', token);
}

/** Get mock session */
export function getMockSession(): { user: User; token: string } | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('__mock_user');
  const token = localStorage.getItem('__mock_token');
  if (!userStr || !token) return null;
  try {
    return { user: JSON.parse(userStr), token };
  } catch {
    return null;
  }
}

/** Clear mock session */
export function clearMockSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('__mock_user');
  localStorage.removeItem('__mock_token');
}

/** Mock login */
export async function mockLogin(login: string, password: string): Promise<{ user: User; token: string }> {
  initMockUsers();
  const entry = MOCK_USERS[login];
  if (!entry || entry.password !== password) {
    throw new Error('نام کاربری یا رمز عبور اشتباه است');
  }
  const token = mockToken();
  saveSession(entry.user, token);
  return { user: { ...entry.user }, token };
}

/** Mock register */
export async function mockRegister(data: {
  username: string; email: string; password: string;
  firstName?: string; lastName?: string; role?: string;
  storeName?: string; businessType?: string; phone?: string;
}): Promise<{ user: User; token: string }> {
  initMockUsers();
  if (MOCK_USERS[data.email] || MOCK_USERS[data.username] || (data.phone && MOCK_USERS[data.phone])) {
    throw new Error('این نام کاربری، ایمیل یا شماره تلفن قبلاً ثبت شده است');
  }
  addMockUser({
    username: data.username,
    email: data.email,
    phone: data.phone,
    password: data.password,
    firstName: data.firstName,
    lastName: data.lastName,
    role: data.role,
    storeName: data.storeName,
    businessType: data.businessType,
    isSuperAdmin: false,
  });
  return mockLogin(data.email, data.password);
}

/** Mock OTP operations - just pretend to work */
export async function mockSendOTP(): Promise<void> {
  // Simulate sending OTP
}

export async function mockVerifyOTP(data: {
  email?: string; phone?: string; code: string;
  isRegister?: boolean; username?: string; firstName?: string;
  lastName?: string; password?: string;
}): Promise<{ user: User; token: string; isNewUser: boolean }> {
  initMockUsers();
  const login = data.email || data.phone || '';
  const username = data.username || login.split('@')[0];

  if (data.isRegister) {
    const result = await mockRegister({
      username,
      email: data.email || login + '@mock.ir',
      password: data.password || '123456',
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
    });
    return { ...result, isNewUser: true };
  }

  // Login via OTP — find user by email or phone
  const entry = MOCK_USERS[login];
  if (!entry) {
    // User not found — auto-create in mock mode
    const result = await mockRegister({
      username,
      email: data.email || login + '@mock.ir',
      password: data.password || '123456',
      firstName: data.firstName || 'کاربر',
      lastName: data.lastName || 'جدید',
      phone: data.phone,
      role: 'buyer',
    });
    return { ...result, isNewUser: true };
  }

  const token = mockToken();
  saveSession(entry.user, token);
  return { user: { ...entry.user }, token, isNewUser: false };
}

/** Mock seller OTP */
export async function mockRegisterSellerOTP(data: {
  email?: string; phone?: string; code: string;
  username: string; password: string;
  firstName: string; lastName: string;
  storeName: string; businessType: string;
}): Promise<{ user: User; token: string }> {
  return mockRegister({
    username: data.username,
    email: data.email || (data.phone ? data.phone + '@mock.ir' : 'seller@test.com'),
    password: data.password,
    firstName: data.firstName,
    lastName: data.lastName,
    role: 'seller',
    storeName: data.storeName,
    businessType: data.businessType,
    phone: data.phone,
  });
}

/** Mock logout */
export async function mockLogout(): Promise<void> {
  clearMockSession();
}
