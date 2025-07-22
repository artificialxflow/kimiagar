import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, amount, description, bankAccount } = body;

    if (!userId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'اطلاعات ناقص یا نامعتبر' },
        { status: 400 }
      );
    }

    // دریافت کیف پول ریالی کاربر
    const wallet = await prisma.wallet.findFirst({
      where: {
        userId,
        type: 'RIAL'
      }
    });

    if (!wallet) {
      return NextResponse.json(
        { error: 'کیف پول ریالی یافت نشد' },
        { status: 404 }
      );
    }

    // بررسی موجودی کافی
    if (Number(wallet.balance) < amount) {
      return NextResponse.json(
        { error: 'موجودی کافی نیست' },
        { status: 400 }
      );
    }

    // بررسی حداقل مبلغ برداشت
    if (amount < 10000) {
      return NextResponse.json(
        { error: 'حداقل مبلغ برداشت 10,000 تومان است' },
        { status: 400 }
      );
    }

    // به‌روزرسانی موجودی کیف پول
    const updatedWallet = await prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: {
          decrement: amount
        }
      }
    });

    // ثبت تراکنش
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        walletId: wallet.id,
        type: 'WITHDRAW',
        amount,
        description: description || `برداشت به حساب ${bankAccount || 'بانکی'}`,
        status: 'PENDING', // نیاز به تایید اپراتور
        referenceId: `WTH-${Date.now()}`
      }
    });

    return NextResponse.json({
      success: true,
      wallet: {
        id: updatedWallet.id,
        balance: updatedWallet.balance,
        currency: updatedWallet.currency
      },
      transaction: {
        id: transaction.id,
        amount: transaction.amount,
        status: transaction.status,
        description: transaction.description,
        createdAt: transaction.createdAt
      },
      message: 'درخواست برداشت ثبت شد و در حال بررسی است'
    });

  } catch (error) {
    console.error('خطا در برداشت:', error);
    return NextResponse.json(
      { error: 'خطا در برداشت از کیف پول' },
      { status: 500 }
    );
  }
} 