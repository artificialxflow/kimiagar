import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, amount, description } = body;

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

    // به‌روزرسانی موجودی کیف پول
    const updatedWallet = await prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: {
          increment: amount
        }
      }
    });

    // ثبت تراکنش
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        walletId: wallet.id,
        type: 'DEPOSIT',
        amount,
        description: description || 'واریز به کیف پول',
        status: 'COMPLETED',
        referenceId: `DEP-${Date.now()}`
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
        createdAt: transaction.createdAt
      }
    });

  } catch (error) {
    console.error('خطا در واریز:', error);
    return NextResponse.json(
      { error: 'خطا در واریز به کیف پول' },
      { status: 500 }
    );
  }
} 