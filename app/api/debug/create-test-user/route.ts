import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // ایجاد کاربر تست
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    const user = await prisma.user.create({
      data: {
        username: 'testuser',
        password: hashedPassword,
        firstName: 'کاربر',
        lastName: 'تست',
        phoneNumber: '09123456789',
        nationalId: '1234567890',
        isVerified: true,
      }
    });

    // ایجاد کیف پول‌های پیش‌فرض
    await prisma.wallet.createMany({
      data: [
        {
          userId: user.id,
          type: 'RIAL',
          balance: 1000000, // 1 میلیون تومان
          currency: 'IRR'
        },
        {
          userId: user.id,
          type: 'GOLD',
          balance: 5, // 5 گرم طلا
          currency: 'GOLD'
        }
      ]
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        isVerified: user.isVerified
      },
      message: 'کاربر تست با موفقیت ایجاد شد. نام کاربری: testuser، رمز عبور: 123456'
    });

  } catch (error) {
    console.error('خطا در ایجاد کاربر تست:', error);
    return NextResponse.json(
      { error: 'خطا در ایجاد کاربر تست' },
      { status: 500 }
    );
  }
} 