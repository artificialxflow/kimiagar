import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, code } = body;

    if (!phoneNumber || !code) {
      return NextResponse.json(
        { error: 'شماره موبایل و کد تایید الزامی هستند' },
        { status: 400 }
      );
    }

    // بررسی کاربر با این شماره موبایل
    const user = await prisma.user.findUnique({
      where: { phoneNumber }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'کاربری با این شماره موبایل یافت نشد' },
        { status: 404 }
      );
    }

    // بررسی کد تایید
    if (user.phoneVerificationCode !== code) {
      return NextResponse.json(
        { error: 'کد تایید اشتباه است' },
        { status: 400 }
      );
    }

    // بررسی انقضای کد
    if (user.phoneVerificationExpires && user.phoneVerificationExpires < new Date()) {
      return NextResponse.json(
        { error: 'کد تایید منقضی شده است' },
        { status: 400 }
      );
    }

    // تایید موبایل
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        phoneVerificationCode: null,
        phoneVerificationExpires: null
      }
    });

    return NextResponse.json({
      success: true,
      message: 'موبایل با موفقیت تایید شد'
    });

  } catch (error) {
    console.error('خطا در تایید موبایل:', error);
    return NextResponse.json(
      { error: 'خطا در تایید موبایل' },
      { status: 500 }
    );
  }
}

// ارسال کد تایید جدید
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber } = body;

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'شماره موبایل الزامی است' },
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

    // تولید کد تایید جدید
    const verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 دقیقه

    // به‌روزرسانی کد تایید
    await prisma.user.update({
      where: { id: user.id },
      data: {
        phoneVerificationCode: verificationCode,
        phoneVerificationExpires: expiresAt
      }
    });

    // TODO: ارسال SMS با کد تایید
    console.log(`کد تایید برای ${phoneNumber}: ${verificationCode}`);

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
