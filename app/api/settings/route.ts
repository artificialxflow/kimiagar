import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { verifyToken } from '@/app/lib/jwt';

// دریافت تنظیمات کاربر
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'توکن احراز هویت یافت نشد' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'توکن نامعتبر است' }, { status: 401 });
    }

    // دریافت تنظیمات موجود یا ایجاد تنظیمات پیش‌فرض
    let userSettings = await prisma.userSetting.findUnique({
      where: { userId: decoded.userId },
    });

    if (!userSettings) {
      // ایجاد تنظیمات پیش‌فرض
      userSettings = await prisma.userSetting.create({
        data: {
          userId: decoded.userId,
          smsEnabled: true,
          emailEnabled: true,
          pushEnabled: true,
          language: 'fa',
          timezone: 'Asia/Tehran',
        },
      });
    }

    return NextResponse.json({
      success: true,
      settings: userSettings,
    });
  } catch (error) {
    console.error('خطا در دریافت تنظیمات:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت تنظیمات' },
      { status: 500 }
    );
  }
}

// به‌روزرسانی تنظیمات کاربر
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'توکن احراز هویت یافت نشد' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'توکن نامعتبر است' }, { status: 401 });
    }

    const body = await request.json();
    const { smsEnabled, emailEnabled, pushEnabled, language, timezone } = body;

    // اعتبارسنجی ورودی‌ها
    if (typeof smsEnabled !== 'boolean' || 
        typeof emailEnabled !== 'boolean' || 
        typeof pushEnabled !== 'boolean') {
      return NextResponse.json(
        { error: 'مقادیر boolean برای تنظیمات اعلان‌ها الزامی است' },
        { status: 400 }
      );
    }

    if (!language || !timezone) {
      return NextResponse.json(
        { error: 'زبان و منطقه زمانی الزامی است' },
        { status: 400 }
      );
    }

    // بررسی وجود تنظیمات
    const existingSettings = await prisma.userSetting.findUnique({
      where: { userId: decoded.userId },
    });

    let updatedSettings;
    if (existingSettings) {
      // به‌روزرسانی تنظیمات موجود
      updatedSettings = await prisma.userSetting.update({
        where: { userId: decoded.userId },
        data: {
          smsEnabled,
          emailEnabled,
          pushEnabled,
          language,
          timezone,
          updatedAt: new Date(),
        },
      });
    } else {
      // ایجاد تنظیمات جدید
      updatedSettings = await prisma.userSetting.create({
        data: {
          userId: decoded.userId,
          smsEnabled,
          emailEnabled,
          pushEnabled,
          language,
          timezone,
        },
      });
    }

    // ایجاد اعلان برای کاربر
    await prisma.notification.create({
      data: {
        userId: decoded.userId,
        type: 'SYSTEM',
        title: 'تنظیمات به‌روزرسانی شد',
        message: 'تنظیمات حساب کاربری شما با موفقیت به‌روزرسانی شد.',
        metadata: {
          action: 'settings_updated',
          timestamp: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'تنظیمات با موفقیت به‌روزرسانی شد',
      settings: updatedSettings,
    });
  } catch (error) {
    console.error('خطا در به‌روزرسانی تنظیمات:', error);
    return NextResponse.json(
      { error: 'خطا در به‌روزرسانی تنظیمات' },
      { status: 500 }
    );
  }
}
