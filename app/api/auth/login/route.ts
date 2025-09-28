import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import bcrypt from 'bcryptjs';
import { generateTokens } from '@/app/lib/jwt';
import { isDevelopment, mockUser } from '@/app/lib/mockData';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // اعتبارسنجی ورودی‌ها
    if (!username || !password) {
      return NextResponse.json(
        { error: 'نام کاربری و رمز عبور الزامی هستند' },
        { status: 400 }
      );
    }

    // در development mode از mock user استفاده کن
    if (isDevelopment) {
      // بررسی نام کاربری mock
      if (username === mockUser.username && password === 'Ronak#123Ronak') {
        const tokens = generateTokens({
          userId: mockUser.id,
          username: mockUser.username,
          isAdmin: false
        });

        const response = NextResponse.json({
          success: true,
          user: mockUser,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken
        });

        // تنظیم cookies
        response.cookies.set('accessToken', tokens.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 15 * 60 // 15 دقیقه
        });

        response.cookies.set('refreshToken', tokens.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 // 7 روز
        });

        return response;
      } else {
        return NextResponse.json(
          { error: 'نام کاربری یا رمز عبور اشتباه است' },
          { status: 401 }
        );
      }
    }

    // بررسی اتصال به دیتابیس
    try {
      await prisma.$connect();
    } catch (dbError) {
      console.error('خطا در اتصال به دیتابیس:', dbError);
      return NextResponse.json(
        { error: 'خطا در اتصال به سرور' },
        { status: 500 }
      );
    }

    // بررسی وجود کاربر
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'نام کاربری یا رمز عبور اشتباه است' },
        { status: 401 }
      );
    }

    // بررسی رمز عبور
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'نام کاربری یا رمز عبور اشتباه است' },
        { status: 400 }
      );
    }

    // ایجاد JWT tokens
    const tokens = generateTokens({
      userId: user.id,
      username: user.username,
      isAdmin: user.isAdmin
    });

    // ایجاد response
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        nationalId: user.nationalId,
        bankAccount: user.bankAccount,
        postalCode: user.postalCode,
        isVerified: user.isVerified
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    });

    // تنظیم cookies
    response.cookies.set('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 // 15 دقیقه
    });

    response.cookies.set('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 روز
    });

    return response;

  } catch (error) {
    console.error('خطا در ورود:', error);
    
    // بررسی نوع خطا
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
        return NextResponse.json(
          { error: 'خطا در اتصال به سرور دیتابیس' },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'خطا در ورود کاربر' },
      { status: 500 }
    );
  }
} 