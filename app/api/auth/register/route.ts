import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generateTokens } from '@/app/lib/jwt';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, firstName, lastName } = body;

    // اعتبارسنجی ورودی‌ها
    if (!username || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'یوزرنیم، پسورد، نام و نام خانوادگی الزامی هستند' },
        { status: 400 }
      );
    }

    // اعتبارسنجی یوزرنیم
    if (username.length < 3) {
      return NextResponse.json(
        { error: 'یوزرنیم باید حداقل 3 کاراکتر باشد' },
        { status: 400 }
      );
    }

    if (username.length > 20) {
      return NextResponse.json(
        { error: 'یوزرنیم نمی‌تواند بیش از 20 کاراکتر باشد' },
        { status: 400 }
      );
    }

    // بررسی فرمت یوزرنیم
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json(
        { error: 'یوزرنیم فقط می‌تواند شامل حروف، اعداد و _ باشد' },
        { status: 400 }
      );
    }

    // اعتبارسنجی پسورد
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'پسورد باید حداقل 8 کاراکتر باشد' },
        { status: 400 }
      );
    }

    if (password.length > 50) {
      return NextResponse.json(
        { error: 'پسورد نمی‌تواند بیش از 50 کاراکتر باشد' },
        { status: 400 }
      );
    }

    // اعتبارسنجی نام و نام خانوادگی
    if (firstName.length < 2 || firstName.length > 30) {
      return NextResponse.json(
        { error: 'نام باید بین 2 تا 30 کاراکتر باشد' },
        { status: 400 }
      );
    }

    if (lastName.length < 2 || lastName.length > 30) {
      return NextResponse.json(
        { error: 'نام خانوادگی باید بین 2 تا 30 کاراکتر باشد' },
        { status: 400 }
      );
    }

    // بررسی وجود کاربر
    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'این یوزرنیم قبلاً استفاده شده است' },
        { status: 400 }
      );
    }

    // Hash کردن پسورد
    const hashedPassword = await bcrypt.hash(password, 10);

    // ایجاد کاربر جدید
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        firstName,
        lastName,
        isVerified: true,
      }
    });

    // ایجاد کیف پول‌های پیش‌فرض
    await prisma.wallet.createMany({
      data: [
        {
          userId: user.id,
          type: 'RIAL',
          balance: 0,
          currency: 'IRR'
        },
        {
          userId: user.id,
          type: 'GOLD',
          balance: 0,
          currency: 'GOLD'
        }
      ]
    });

    // ایجاد JWT tokens
    const tokens = generateTokens({
      userId: user.id,
      username: user.username
    });

    // ایجاد response
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        isVerified: user.isVerified
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
    console.error('خطا در ثبت‌نام:', error);
    return NextResponse.json(
      { error: 'خطا در ثبت‌نام کاربر' },
      { status: 500 }
    );
  }
} 