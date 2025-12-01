import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'kimiagar-jwt-secret-2024-production-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'kimiagar-refresh-secret-2024-production-key';

export interface JWTPayload {
  userId: string;
  username: string;
  isAdmin: boolean;
  iat?: number;
  exp?: number;
}

// ایجاد Access Token (۴ ساعت)
export function generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '4h' });
}

// ایجاد Refresh Token (7 روز)
export function generateRefreshToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

// بررسی Access Token
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

// بررسی Token (alias برای backward compatibility)
export function verifyToken(token: string): JWTPayload | null {
  return verifyAccessToken(token);
}

// بررسی Refresh Token
export function verifyRefreshToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

// ایجاد هر دو token
export function generateTokens(payload: Omit<JWTPayload, 'iat' | 'exp'>) {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload)
  };
} 