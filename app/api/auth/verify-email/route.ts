import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { error: 'ایمیل و کد تایید الزامی هستند' },
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

// ارسال کد تایید جدید
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

    // تولید کد تایید جدید
    const verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 دقیقه

    // به‌روزرسانی کد تایید
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationCode: verificationCode,
        emailVerificationExpires: expiresAt
      }
    });

    // TODO: ارسال ایمیل با کد تایید
    console.log(`کد تایید برای ${email}: ${verificationCode}`);

    return NextResponse.json({
      success: true,
      message: 'کد تایید جدید ارسال شد'
    });

  } catch (error) {
    console.error('خطا در ارسال کد تایید:', error);
    return NextResponse.json(
      { error: 'خطا در ارسال کد تایید' },
      { status: 500 }
    );
  }
}
