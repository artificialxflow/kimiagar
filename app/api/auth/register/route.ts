import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
                    const body = await request.json();
                const { firstName, lastName, phoneNumber, nationalId, bankAccount, postalCode } = body;

                // اعتبارسنجی ورودی‌ها
                if (!firstName || !lastName || !phoneNumber || !nationalId || !bankAccount || !postalCode) {
                    return NextResponse.json(
                        { error: 'تمام فیلدها الزامی هستند' },
                        { status: 400 }
                    );
                }

                // اعتبارسنجی فرمت‌ها
                if (!/^09\d{9}$/.test(phoneNumber)) {
                    return NextResponse.json(
                        { error: 'شماره موبایل نامعتبر است' },
                        { status: 400 }
                    );
                }

                if (!/^\d{10}$/.test(nationalId)) {
                    return NextResponse.json(
                        { error: 'کد ملی نامعتبر است' },
                        { status: 400 }
                    );
                }

                if (!/^IR\d{22}$/.test(bankAccount)) {
                    return NextResponse.json(
                        { error: 'شماره شبا نامعتبر است' },
                        { status: 400 }
                    );
                }

                if (!/^\d{10}$/.test(postalCode)) {
                    return NextResponse.json(
                        { error: 'کد پستی نامعتبر است' },
                        { status: 400 }
                    );
                }

    // بررسی وجود کاربر
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { phoneNumber },
          { nationalId }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'کاربر با این شماره موبایل یا کد ملی قبلاً ثبت شده است' },
        { status: 400 }
      );
    }

    // ایجاد کاربر جدید
    const user = await prisma.user.create({
      data: {
        phoneNumber,
        nationalId,
        bankAccount,
        postalCode,
        firstName,
        lastName,
        isVerified: true, // فعلاً true قرار می‌دهیم
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

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        firstName: user.firstName,
        lastName: user.lastName,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    console.error('خطا در ثبت‌نام:', error);
    return NextResponse.json(
      { error: 'خطا در ثبت‌نام کاربر' },
      { status: 500 }
    );
  }
} 