import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generateTokens } from '@/app/lib/jwt';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      username, 
      password, 
      confirmPassword,
      firstName, 
      lastName, 
      email, 
      phoneNumber,
      nationalId,
      bankAccount,
      postalCode
    } = body;

    // اعتبارسنجی ورودی‌های الزامی
    if (!username || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'یوزرنیم، پسورد، نام و نام خانوادگی الزامی هستند' },
        { status: 400 }
      );
    }

    // اعتبارسنجی تایید پسورد
    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'پسورد و تایید پسورد مطابقت ندارند' },
        { status: 400 }
      );
    }

    // اعتبارسنجی ایمیل (اختیاری)
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'فرمت ایمیل نامعتبر است' },
        { status: 400 }
      );
    }

    // اعتبارسنجی شماره موبایل (اختیاری)
    if (phoneNumber && !/^09\d{9}$/.test(phoneNumber)) {
      return NextResponse.json(
        { error: 'فرمت شماره موبایل نامعتبر است (مثال: 09123456789)' },
        { status: 400 }
      );
    }

    // اعتبارسنجی کد ملی (اختیاری)
    if (nationalId && !/^\d{10}$/.test(nationalId)) {
      return NextResponse.json(
        { error: 'کد ملی باید 10 رقم باشد' },
        { status: 400 }
      );
    }

    // اعتبارسنجی شماره شبا (اختیاری)
    if (bankAccount && !/^IR\d{24}$/.test(bankAccount)) {
      return NextResponse.json(
        { error: 'فرمت شماره شبا نامعتبر است (مثال: IR123456789012345678901234)' },
        { status: 400 }
      );
    }

    // اعتبارسنجی کد پستی (اختیاری)
    if (postalCode && !/^\d{10}$/.test(postalCode)) {
      return NextResponse.json(
        { error: 'کد پستی باید 10 رقم باشد' },
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

    // اعتبارسنجی پیچیدگی پسورد
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        { error: 'پسورد باید شامل حروف کوچک، بزرگ و اعداد باشد' },
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

    // بررسی وجود ایمیل
    if (email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email }
      });

      if (existingEmail) {
        return NextResponse.json(
          { error: 'این ایمیل قبلاً استفاده شده است' },
          { status: 400 }
        );
      }
    }

    // بررسی وجود شماره موبایل
    if (phoneNumber) {
      const existingPhone = await prisma.user.findUnique({
        where: { phoneNumber }
      });

      if (existingPhone) {
        return NextResponse.json(
          { error: 'این شماره موبایل قبلاً استفاده شده است' },
          { status: 400 }
        );
      }
    }

    // بررسی وجود کد ملی
    if (nationalId) {
      const existingNationalId = await prisma.user.findUnique({
        where: { nationalId }
      });

      if (existingNationalId) {
        return NextResponse.json(
          { error: 'این کد ملی قبلاً استفاده شده است' },
          { status: 400 }
        );
      }
    }

    // Hash کردن پسورد
    const hashedPassword = await bcrypt.hash(password, 12);

    // تولید کد تایید ایمیل (اگر ایمیل ارائه شده)
    let emailVerificationCode = null;
    let emailVerificationExpires = null;
    
    if (email) {
      emailVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      emailVerificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 دقیقه
    }

    // ایجاد کاربر جدید
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        firstName,
        lastName,
        email,
        phoneNumber,
        nationalId,
        bankAccount,
        postalCode,
        isVerified: false, // نیاز به تایید موبایل
        isEmailVerified: false, // نیاز به تایید ایمیل
        emailVerificationCode,
        emailVerificationExpires
      }
    });

    // ایجاد کیف پول‌های پیش‌فرض
    await prisma.wallet.createMany({
      data: [
        {
          userId: user.id,
          type: 'RIAL',
          balance: 0,
          currency: 'IRR',
          isActive: true
        },
        {
          userId: user.id,
          type: 'GOLD',
          balance: 0,
          currency: 'GOLD',
          isActive: true
        }
      ]
    });

    // ایجاد تنظیمات کاربر
    await prisma.userSetting.create({
      data: {
        userId: user.id,
        smsEnabled: true,
        emailEnabled: true,
        pushEnabled: true,
        language: 'fa',
        timezone: 'Asia/Tehran'
      }
    });

    // TODO: ارسال کد تایید ایمیل
    if (email && emailVerificationCode) {
      console.log(`📧 کد تایید ایمیل برای ${email}: ${emailVerificationCode}`);
      console.log(`⏰ انقضا: ${emailVerificationExpires.toLocaleString('fa-IR')}`);
    }

    // ایجاد JWT tokens
    const tokens = generateTokens({
      userId: user.id,
      username: user.username
    });

    // ایجاد response
    const response = NextResponse.json({
      success: true,
      message: 'ثبت‌نام موفقیت‌آمیز',
      user: {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        nationalId: user.nationalId,
        bankAccount: user.bankAccount,
        postalCode: user.postalCode,
        isVerified: user.isVerified,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: false
      },
      requiresVerification: {
        email: !!email,
        phone: !!phoneNumber
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