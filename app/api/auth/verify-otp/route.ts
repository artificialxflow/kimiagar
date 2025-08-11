import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateTokens } from '@/app/lib/jwt';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, otpCode } = body;

    // اعتبارسنجی ورودی
    if (!phoneNumber || !otpCode) {
      return NextResponse.json(
        { error: 'شماره موبایل و کد OTP الزامی هستند' },
        { status: 400 }
      );
    }

    // اعتبارسنجی فرمت شماره موبایل
    const phoneRegex = /^09\d{9}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json(
        { error: 'فرمت شماره موبایل صحیح نیست' },
        { status: 400 }
      );
    }

    // اعتبارسنجی فرمت کد OTP (6 رقم)
    if (!/^\d{6}$/.test(otpCode)) {
      return NextResponse.json(
        { error: 'کد OTP باید 6 رقم باشد' },
        { status: 400 }
      );
    }

    // بررسی کاربر
    const user = await prisma.user.findUnique({
      where: { phoneNumber }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'کاربری با این شماره موبایل یافت نشد' },
        { status: 404 }
      );
    }

    // بررسی کد OTP
    if (user.phoneVerificationCode !== otpCode) {
      // افزایش تعداد تلاش‌های ناموفق
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: {
            increment: 1
          },
          lastFailedLoginAt: new Date()
        }
      });

      return NextResponse.json(
        { error: 'کد OTP اشتباه است' },
        { status: 400 }
      );
    }

    // بررسی انقضای کد OTP
    if (user.phoneVerificationExpires && user.phoneVerificationExpires < new Date()) {
      return NextResponse.json(
        { error: 'کد OTP منقضی شده است' },
        { status: 400 }
      );
    }

    // بررسی مسدودیت حساب
    if (user.isBlocked && user.blockedUntil && user.blockedUntil > new Date()) {
      return NextResponse.json(
        { error: 'حساب شما مسدود شده است. لطفاً صبر کنید.' },
        { status: 403 }
      );
    }

    // تایید موفق - پاک کردن کد OTP و به‌روزرسانی اطلاعات ورود
    await prisma.user.update({
      where: { id: user.id },
      data: {
        phoneVerificationCode: null,
        phoneVerificationExpires: null,
        lastLoginAt: new Date(),
        loginAttempts: 0,
        failedLoginAttempts: 0,
        isBlocked: false,
        blockedUntil: null
      }
    });

    // ایجاد JWT tokens
    const tokens = generateTokens({
      userId: user.id,
      username: user.username
    });

    // ایجاد response
    const response = NextResponse.json({
      success: true,
      message: 'ورود موفقیت‌آمیز',
      user: {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        nationalId: user.nationalId,
        bankAccount: user.bankAccount,
        postalCode: user.postalCode,
        isVerified: user.isVerified,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: true
      }
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
    console.error('خطا در تایید OTP:', error);
    return NextResponse.json(
      { error: 'خطا در تایید کد OTP' },
      { status: 500 }
    );
  }
}
