import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import bcrypt from 'bcryptjs';
import { generateTokens } from '@/app/lib/jwt';

/**
 * این endpoint برای تست کردن مراحل register بدون ایجاد کاربر واقعی است
 * فقط برای debugging استفاده می‌شود
 */
export async function POST(request: NextRequest) {
  const testResults: any = {
    timestamp: new Date().toISOString(),
    steps: {},
    errors: []
  };

  try {
    // Step 1: بررسی اتصال دیتابیس
    testResults.steps.databaseConnection = { status: 'testing' };
    try {
      await prisma.$queryRaw`SELECT 1`;
      testResults.steps.databaseConnection = { status: 'ok', message: 'اتصال برقرار است' };
    } catch (error: any) {
      testResults.steps.databaseConnection = { status: 'error', error: error.message };
      testResults.errors.push('خطا در اتصال دیتابیس');
    }

    // Step 2: بررسی وجود جداول
    testResults.steps.tablesCheck = { status: 'testing' };
    try {
      const tables = await prisma.$queryRaw<Array<{ table_name: string }>>`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'users'
      `;
      if (tables.length > 0) {
        testResults.steps.tablesCheck = { status: 'ok', message: 'جدول users وجود دارد' };
      } else {
        testResults.steps.tablesCheck = { status: 'error', message: 'جدول users وجود ندارد' };
        testResults.errors.push('جدول users وجود ندارد');
      }
    } catch (error: any) {
      testResults.steps.tablesCheck = { status: 'error', error: error.message };
      testResults.errors.push('خطا در بررسی جداول');
    }

    // Step 3: تست bcrypt
    testResults.steps.bcryptTest = { status: 'testing' };
    try {
      const testPassword = 'Test1234';
      const hashed = await bcrypt.hash(testPassword, 12);
      const isValid = await bcrypt.compare(testPassword, hashed);
      if (isValid) {
        testResults.steps.bcryptTest = { status: 'ok', message: 'bcrypt کار می‌کند' };
      } else {
        testResults.steps.bcryptTest = { status: 'error', message: 'bcrypt hash/compare کار نمی‌کند' };
        testResults.errors.push('خطا در bcrypt');
      }
    } catch (error: any) {
      testResults.steps.bcryptTest = { status: 'error', error: error.message };
      testResults.errors.push('خطا در تست bcrypt');
    }

    // Step 4: تست JWT
    testResults.steps.jwtTest = { status: 'testing' };
    try {
      const testPayload = {
        userId: 'test-user-id',
        username: 'testuser',
        isAdmin: false
      };
      const tokens = generateTokens(testPayload);
      if (tokens.accessToken && tokens.refreshToken) {
        testResults.steps.jwtTest = { status: 'ok', message: 'JWT tokens ایجاد شدند' };
      } else {
        testResults.steps.jwtTest = { status: 'error', message: 'JWT tokens ایجاد نشدند' };
        testResults.errors.push('خطا در ایجاد JWT tokens');
      }
    } catch (error: any) {
      testResults.steps.jwtTest = { status: 'error', error: error.message, stack: error.stack };
      testResults.errors.push('خطا در تست JWT');
    }

    // Step 5: تست Prisma User Model
    testResults.steps.prismaUserModel = { status: 'testing' };
    try {
      // فقط بررسی می‌کنیم که آیا می‌توانیم یک query ساده انجام دهیم
      const userCount = await prisma.user.count();
      testResults.steps.prismaUserModel = { 
        status: 'ok', 
        message: `Prisma User Model کار می‌کند (تعداد کاربران: ${userCount})` 
      };
    } catch (error: any) {
      testResults.steps.prismaUserModel = { 
        status: 'error', 
        error: error.message,
        code: error.code,
        meta: error.meta
      };
      testResults.errors.push('خطا در Prisma User Model');
    }

    // Step 6: تست ایجاد Wallet
    testResults.steps.walletModel = { status: 'testing' };
    try {
      const walletCount = await prisma.wallet.count();
      testResults.steps.walletModel = { 
        status: 'ok', 
        message: `Prisma Wallet Model کار می‌کند (تعداد کیف پول‌ها: ${walletCount})` 
      };
    } catch (error: any) {
      testResults.steps.walletModel = { 
        status: 'error', 
        error: error.message,
        code: error.code
      };
      testResults.errors.push('خطا در Prisma Wallet Model');
    }

    // Step 7: تست ایجاد UserSetting
    testResults.steps.userSettingModel = { status: 'testing' };
    try {
      const settingCount = await prisma.userSetting.count();
      testResults.steps.userSettingModel = { 
        status: 'ok', 
        message: `Prisma UserSetting Model کار می‌کند (تعداد تنظیمات: ${settingCount})` 
      };
    } catch (error: any) {
      testResults.steps.userSettingModel = { 
        status: 'error', 
        error: error.message,
        code: error.code
      };
      testResults.errors.push('خطا در Prisma UserSetting Model');
    }

    // نتیجه نهایی
    testResults.success = testResults.errors.length === 0;
    testResults.summary = testResults.errors.length === 0 
      ? 'همه تست‌ها موفق بودند' 
      : `${testResults.errors.length} خطا یافت شد`;

    return NextResponse.json(testResults, { 
      status: testResults.success ? 200 : 500 
    });

  } catch (error: any) {
    testResults.success = false;
    testResults.errors.push(`خطای کلی: ${error.message}`);
    testResults.error = {
      message: error.message,
      stack: error.stack,
      code: error.code
    };
    
    return NextResponse.json(testResults, { status: 500 });
  }
}

