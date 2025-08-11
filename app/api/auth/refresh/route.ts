import { NextRequest, NextResponse } from 'next/server';
import { verifyRefreshToken, generateAccessToken } from '@/app/lib/jwt';

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
      message: 'Token جدید ایجاد شد'
    });

    // تنظیم access token جدید
    response.cookies.set('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 // 15 دقیقه
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