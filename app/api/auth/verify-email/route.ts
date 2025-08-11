import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code } = body;

    // اعتبارسنجی ورودی
    if (!email || !code) {
      return NextResponse.json(
        { error: 'ایمیل و کد تایید الزامی هستند' },
        { status: 400 }
      );
    }

    // اعتبارسنجی فرمت ایمیل
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'فرمت ایمیل نامعتبر است' },
        { status: 400 }
      );
    }

    // اعتبارسنجی فرمت کد تایید (6 رقم)
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: 'کد تایید باید 6 رقم باشد' },
        { status: 400 }
      );
    }

    // بررسی کاربر با این ایمیل
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'کاربری با این ایمیل یافت نشد' },
        { status: 404 }
      );
    }

    // بررسی کد تایید
    if (user.emailVerificationCode !== code) {
      return NextResponse.json(
        { error: 'کد تایید اشتباه است' },
        { status: 400 }
      );
    }

    // بررسی انقضای کد
    if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
      return NextResponse.json(
        { error: 'کد تایید منقضی شده است' },
        { status: 400 }
      );
    }

    // تایید ایمیل
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationCode: null,
        emailVerificationExpires: null
      }
    });

    return NextResponse.json({
      success: true,
      message: 'ایمیل با موفقیت تایید شد'
    });

  } catch (error) {
    console.error('خطا در تایید ایمیل:', error);
    return NextResponse.json(
      { error: 'خطا در تایید ایمیل' },
      { status: 500 }
    );
  }
}

// ارسال مجدد کد تایید
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'ایمیل الزامی است' },
        { status: 400 }
      );
    }

    // اعتبارسنجی فرمت ایمیل
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'فرمت ایمیل نامعتبر است' },
        { status: 400 }
      );
    }

    // بررسی کاربر
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'کاربری با این ایمیل یافت نشد' },
        { status: 404 }
      );
    }

    // بررسی محدودیت ارسال (حداکثر 5 بار در روز)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentAttempts = await prisma.user.count({
      where: {
        email,
        emailVerificationExpires: {
          gte: oneDayAgo
        }
      }
    });

    if (recentAttempts >= 5) {
      return NextResponse.json(
        { error: 'حداکثر تعداد ارسال کد در روز (5 بار) تکمیل شده. لطفاً فردا تلاش کنید.' },
        { status: 429 }
      );
    }

    // تولید کد تایید جدید
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 دقیقه

    // به‌روزرسانی کد تایید
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationCode: verificationCode,
        emailVerificationExpires: expiresAt
      }
    });

    // TODO: ارسال ایمیل با کد تایید
    if (process.env.NODE_ENV === 'development') {
      console.log(`📧 کد تایید ایمیل برای ${email}: ${verificationCode}`);
      console.log(`⏰ انقضا: ${expiresAt.toLocaleString('fa-IR')}`);
    }

    return NextResponse.json({
      success: true,
      message: 'کد تایید جدید ارسال شد',
      expiresIn: '15 دقیقه'
    });

  } catch (error) {
    console.error('خطا در ارسال کد تایید:', error);
    return NextResponse.json(
      { error: 'خطا در ارسال کد تایید' },
      { status: 500 }
    );
  }
}
