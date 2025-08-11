import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber } = body;

    // اعتبارسنجی ورودی
    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'شماره موبایل الزامی است' },
        { status: 400 }
      );
    }

    // اعتبارسنجی فرمت شماره موبایل (11 رقم ایران)
    const phoneRegex = /^09\d{9}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json(
        { error: 'فرمت شماره موبایل صحیح نیست (مثال: 09123456789)' },
        { status: 400 }
      );
    }

    // بررسی وجود کاربر
    const user = await prisma.user.findUnique({
      where: { phoneNumber }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'کاربری با این شماره موبایل یافت نشد' },
        { status: 404 }
      );
    }

    // بررسی محدودیت ارسال (حداکثر 3 بار در ساعت)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentAttempts = await prisma.user.count({
      where: {
        phoneNumber,
        phoneVerificationExpires: {
          gte: oneHourAgo
        }
      }
    });

    if (recentAttempts >= 3) {
      return NextResponse.json(
        { error: 'حداکثر تعداد ارسال کد در ساعت (3 بار) تکمیل شده. لطفاً صبر کنید.' },
        { status: 429 }
      );
    }

    // تولید کد OTP 6 رقمی
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 دقیقه

    // به‌روزرسانی کد OTP در دیتابیس
    await prisma.user.update({
      where: { id: user.id },
      data: {
        phoneVerificationCode: otpCode,
        phoneVerificationExpires: expiresAt
      }
    });

    // TODO: ارسال SMS با کد OTP
    // در محیط development، کد را در console نمایش می‌دهیم
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔐 کد OTP برای ${phoneNumber}: ${otpCode}`);
      console.log(`⏰ انقضا: ${expiresAt.toLocaleString('fa-IR')}`);
    }

    // TODO: اتصال به سرویس SMS (کاوه‌پیام، ملی‌پیام)
    // const smsResult = await sendSMS(phoneNumber, `کد ورود شما: ${otpCode}`);

    return NextResponse.json({
      success: true,
      message: 'کد OTP ارسال شد',
      expiresIn: '5 دقیقه',
      phoneNumber: phoneNumber.replace(/(\d{4})(\d{3})(\d{4})/, '$1***$3') // مخفی کردن بخشی از شماره
    });

  } catch (error) {
    console.error('خطا در ارسال OTP:', error);
    return NextResponse.json(
      { error: 'خطا در ارسال کد OTP' },
      { status: 500 }
    );
  }
}
