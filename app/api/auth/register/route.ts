import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import bcrypt from 'bcryptjs';
import { generateTokens } from '@/app/lib/jwt';

export async function POST(request: NextRequest) {
  // لاگ‌های اولیه - باید همیشه نمایش داده شوند
  console.error('📝 [Register] ========== شروع ثبت‌نام ==========');
  console.error('📝 [Register] درخواست ثبت‌نام دریافت شد');
  console.error('📝 [Register] Time:', new Date().toISOString());
  const startTime = Date.now();
  
  try {
    console.error('📝 [Register] در حال خواندن body...');
    const body = await request.json();
    console.error('📝 [Register] Body خوانده شد');
    console.error('📋 [Register] Body دریافت شد:', JSON.stringify({
      username: body.username ? '✓' : '✗',
      phoneNumber: body.phoneNumber ? '✓' : '✗',
      nationalId: body.nationalId ? '✓' : '✗',
      firstName: body.firstName ? '✓' : '✗',
      lastName: body.lastName ? '✓' : '✗',
      email: body.email ? '✓' : '✗'
    }));
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
    if (!username || !password || !firstName || !lastName || !phoneNumber || !nationalId) {
      return NextResponse.json(
        { error: 'نام کاربری، رمز عبور، نام، نام خانوادگی، شماره تلفن و کد ملی الزامی هستند' },
        { status: 400 }
      );
    }

    // اعتبارسنجی تایید پسورد
    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'رمز عبور و تایید رمز عبور مطابقت ندارند' },
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

    // اعتبارسنجی شماره موبایل (الزامی)
    if (!/^09\d{9}$/.test(phoneNumber)) {
      return NextResponse.json(
        { error: 'فرمت شماره موبایل نامعتبر است (مثال: 09123456789)' },
        { status: 400 }
      );
    }

    // اعتبارسنجی کد ملی (الزامی)
    if (!/^\d{10}$/.test(nationalId)) {
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

    // اعتبارسنجی نام کاربری
    if (username.length < 3) {
      return NextResponse.json(
        { error: 'نام کاربری باید حداقل 3 کاراکتر باشد' },
        { status: 400 }
      );
    }

    if (username.length > 20) {
      return NextResponse.json(
        { error: 'نام کاربری نمی‌تواند بیش از 20 کاراکتر باشد' },
        { status: 400 }
      );
    }

    // بررسی فرمت نام کاربری
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json(
        { error: 'نام کاربری فقط می‌تواند شامل حروف، اعداد و _ باشد' },
        { status: 400 }
      );
    }

    // اعتبارسنجی رمز عبور
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'رمز عبور باید حداقل 8 کاراکتر باشد' },
        { status: 400 }
      );
    }

    if (password.length > 50) {
      return NextResponse.json(
        { error: 'رمز عبور نمی‌تواند بیش از 50 کاراکتر باشد' },
        { status: 400 }
      );
    }

    // اعتبارسنجی پیچیدگی رمز عبور
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        { error: 'رمز عبور باید شامل حروف کوچک، بزرگ و اعداد باشد' },
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
    console.error('📝 [Register] در حال بررسی وجود کاربر...');
    const existingUser = await prisma.user.findUnique({
      where: { username }
    });
    console.error('📝 [Register] بررسی کاربر انجام شد:', existingUser ? 'کاربر موجود است' : 'کاربر جدید');

    if (existingUser) {
      return NextResponse.json(
        { error: 'این نام کاربری قبلاً استفاده شده است' },
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

    // Hash کردن رمز عبور
    console.error('📝 [Register] در حال hash کردن رمز عبور...');
    const hashedPassword = await bcrypt.hash(password, 12);
    console.error('📝 [Register] رمز عبور hash شد');

    // تولید کد تایید ایمیل (اگر ایمیل ارائه شده)
    let emailVerificationCode = null;
    let emailVerificationExpires = null;
    
    if (email) {
      emailVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      emailVerificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 دقیقه
    }

    // ایجاد کاربر جدید
    console.error('📝 [Register] در حال ایجاد کاربر جدید در دیتابیس...');
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
    console.error('📝 [Register] در حال ایجاد کیف پول‌های پیش‌فرض...');
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
    console.error('📝 [Register] در حال ایجاد تنظیمات کاربر...');
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
      if (emailVerificationExpires) {
        console.log(`⏰ انقضا: ${emailVerificationExpires.toLocaleString('fa-IR')}`);
      }
    }

    // ایجاد JWT tokens
    console.error('📝 [Register] در حال ایجاد JWT tokens...');
    const tokens = generateTokens({
      userId: user.id,
      username: user.username,
      isAdmin: false
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

    console.error('✅ [Register] ========== ثبت‌نام موفق ==========');
    return response;

  } catch (error: any) {
    // استفاده از console.error برای اطمینان از نمایش در stderr
    console.error('❌ [Register] ========== خطا در ثبت‌نام ==========');
    console.error('❌ [Register] خطا در ثبت‌نام:', error);
    console.error('📋 [Register] نوع خطا:', error?.constructor?.name || 'Unknown');
    console.error('📋 [Register] پیام خطا:', error?.message || 'بدون پیام');
    console.error('📋 [Register] کد خطا:', error?.code || 'بدون کد');
    console.error('📋 [Register] Stack:', error?.stack || 'بدون stack');
    console.error('📋 [Register] Error Object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    
    // چک کردن نوع خطاهای Prisma
    if (error?.code === 'P2002') {
      const target = error?.meta?.target || [];
      console.error('⚠️ خطای تکراری: فیلد تکراری در دیتابیس');
      console.error('📋 فیلد(های) تکراری:', target.join(', '));
      return NextResponse.json(
        { 
          error: `این ${target.join(' یا ')} قبلاً استفاده شده است`,
          details: process.env.NODE_ENV === 'development' ? error?.message : undefined
        },
        { status: 400 }
      );
    } else if (error?.code === 'P1001') {
      console.error('⚠️ خطای اتصال: نمی‌تواند به دیتابیس متصل شود');
      return NextResponse.json(
        { 
          error: 'خطا در اتصال به دیتابیس',
          details: process.env.NODE_ENV === 'development' ? error?.message : undefined
        },
        { status: 503 }
      );
    } else if (error?.code === 'P1003') {
      console.error('⚠️ خطای دیتابیس: دیتابیس وجود ندارد');
      return NextResponse.json(
        { 
          error: 'خطا در دسترسی به دیتابیس',
          details: process.env.NODE_ENV === 'development' ? error?.message : undefined
        },
        { status: 503 }
      );
    } else if (error?.code === 'P2003') {
      console.error('⚠️ خطای Foreign Key: رکورد مرتبط وجود ندارد');
      return NextResponse.json(
        { 
          error: 'خطا در ایجاد رکورد مرتبط',
          details: process.env.NODE_ENV === 'development' ? error?.message : undefined
        },
        { status: 400 }
      );
    }
    
    // لاگ کردن stack trace در development
    if (process.env.NODE_ENV === 'development' && error?.stack) {
      console.error('📋 Stack Trace:', error.stack);
    }
    
    return NextResponse.json(
      { 
        error: 'خطا در ثبت‌نام کاربر',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
      { status: 500 }
    );
  }
} 