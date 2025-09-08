import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, firstName, lastName, phoneNumber, nationalId, bankAccount, postalCode } = body;

    // اعتبارسنجی ورودی‌ها
    if (!userId || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'نام و نام خانوادگی الزامی هستند' },
        { status: 400 }
      );
    }

    // اعتبارسنجی فرمت‌ها (فقط اگر مقدار وارد شده باشد)
    if (phoneNumber && !/^09\d{9}$/.test(phoneNumber)) {
      return NextResponse.json(
        { error: 'شماره موبایل نامعتبر است' },
        { status: 400 }
      );
    }

    if (nationalId && !/^\d{10}$/.test(nationalId)) {
      return NextResponse.json(
        { error: 'کد ملی نامعتبر است' },
        { status: 400 }
      );
    }

    if (bankAccount && !/^IR\d{22}$/.test(bankAccount)) {
      return NextResponse.json(
        { error: 'شماره شبا نامعتبر است' },
        { status: 400 }
      );
    }

    if (postalCode && !/^\d{10}$/.test(postalCode)) {
      return NextResponse.json(
        { error: 'کد پستی نامعتبر است' },
        { status: 400 }
      );
    }

    // بررسی وجود کاربر
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'کاربر یافت نشد' },
        { status: 404 }
      );
    }

    // بررسی تکراری نبودن شماره موبایل و کد ملی (فقط اگر مقدار وارد شده باشد)
    if (phoneNumber || nationalId) {
      const duplicateCheck = await prisma.user.findFirst({
        where: {
          OR: [
            ...(phoneNumber ? [{ phoneNumber, id: { not: userId } }] : []),
            ...(nationalId ? [{ nationalId, id: { not: userId } }] : [])
          ]
        }
      });

      if (duplicateCheck) {
        return NextResponse.json(
          { error: 'شماره موبایل یا کد ملی قبلاً ثبت شده است' },
          { status: 400 }
        );
      }
    }

    // به‌روزرسانی اطلاعات کاربر
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        phoneNumber,
        nationalId,
        bankAccount,
        postalCode,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        phoneNumber: updatedUser.phoneNumber,
        nationalId: updatedUser.nationalId,
        bankAccount: updatedUser.bankAccount,
        postalCode: updatedUser.postalCode,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      }
    });

  } catch (error) {
    console.error('خطا در به‌روزرسانی پروفایل:', error);
    return NextResponse.json(
      { error: 'خطا در به‌روزرسانی اطلاعات' },
      { status: 500 }
    );
  }
} 