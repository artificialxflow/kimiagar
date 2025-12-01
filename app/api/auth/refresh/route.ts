import { NextRequest, NextResponse } from 'next/server';
import { verifyRefreshToken, generateAccessToken } from '@/app/lib/jwt';

// تمدید نشست کاربر با استفاده از refresh token
export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token یافت نشد' },
        { status: 401 }
      );
    }

    // بررسی refresh token
    const payload = verifyRefreshToken(refreshToken);

    if (!payload) {
      // اگر refresh token نامعتبر است، cookies را پاک کن
      const response = NextResponse.json(
        { error: 'Refresh token نامعتبر است' },
        { status: 401 }
      );

      response.cookies.delete('accessToken');
      response.cookies.delete('refreshToken');

      return response;
    }

    // ایجاد access token جدید
    const newAccessToken = generateAccessToken({
      userId: payload.userId,
      username: payload.username,
      isAdmin: payload.isAdmin
    });

    // ایجاد response
    const response = NextResponse.json({
      success: true,
      accessToken: newAccessToken
    });

    // تنظیم access token جدید (۴ ساعت)
    response.cookies.set('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 4 * 60 * 60 // ۴ ساعت
    });

    return response;

  } catch (error) {
    console.error('خطا در refresh token:', error);
    return NextResponse.json(
      { error: 'خطا در refresh token' },
      { status: 500 }
    );
  }
}