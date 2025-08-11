import { jwtDecode } from 'jwt-decode';

export interface User {
  userId: string;
  username: string;
  email?: string;
  phone?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// بررسی وجود توکن در localStorage
export function getStoredTokens(): AuthTokens | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (accessToken && refreshToken) {
      return { accessToken, refreshToken };
    }
    return null;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
}

// ذخیره توکن‌ها در localStorage
export function storeTokens(tokens: AuthTokens): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
  } catch (error) {
    console.error('Error writing to localStorage:', error);
  }
}

// حذف توکن‌ها از localStorage
export function clearStoredTokens(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}

// بررسی اعتبار توکن
export function isTokenValid(token: string): boolean {
  try {
    const decoded = jwtDecode(token);
    if (!decoded || typeof decoded === 'string') return false;
    
    const currentTime = Date.now() / 1000;
    return decoded.exp ? decoded.exp > currentTime : false;
  } catch (error) {
    return false;
  }
}

// دریافت اطلاعات کاربر از توکن
export function getUserFromToken(token: string): User | null {
  try {
    const decoded = jwtDecode(token) as any;
    if (!decoded || typeof decoded === 'string') return null;
    
    return {
      userId: decoded.userId,
      username: decoded.username,
      email: decoded.email,
      phone: decoded.phone
    };
  } catch (error) {
    return null;
  }
}

// بررسی وضعیت احراز هویت
export function isAuthenticated(): boolean {
  const tokens = getStoredTokens();
  if (!tokens) return false;
  
  return isTokenValid(tokens.accessToken);
}

// دریافت توکن معتبر
export function getValidToken(): string | null {
  const tokens = getStoredTokens();
  if (!tokens) return null;
  
  if (isTokenValid(tokens.accessToken)) {
    return tokens.accessToken;
  }
  
  // اگر access token منقضی شده، refresh token را بررسی کن
  if (isTokenValid(tokens.refreshToken)) {
    return tokens.refreshToken;
  }
  
  // هر دو توکن منقضی شده‌اند
  clearStoredTokens();
  return null;
}

// تنظیم header های احراز هویت برای API calls
export function getAuthHeaders(): Record<string, string> {
  const token = getValidToken();
  if (!token) return {};
  
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

// بررسی نیاز به refresh توکن
export function needsTokenRefresh(): boolean {
  const tokens = getStoredTokens();
  if (!tokens) return false;
  
  try {
    const decoded = jwtDecode(tokens.accessToken) as any;
    if (!decoded || typeof decoded === 'string') return true;
    
    const currentTime = Date.now() / 1000;
    // اگر کمتر از 5 دقیقه تا انقضا باقی مانده، refresh کن
    return decoded.exp ? (decoded.exp - currentTime) < 300 : true;
  } catch (error) {
    return true;
  }
}
