import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// ثبت درخواست واریز توسط کاربر (مرحله اول - بدون شارژ مستقیم کیف پول)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, amount, description, receiptNumber } = body;

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

    // فقط ثبت تراکنش در حالت PENDING
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        walletId: wallet.id,
        type: 'DEPOSIT',
        amount,
        description: description || 'درخواست واریز به کیف پول',
        status: 'PENDING',
        referenceId: receiptNumber || `DEP-${Date.now()}`,
        metadata: {
          createdBy: 'USER',
          source: 'WALLET_DEPOSIT_API',
          receiptNumber: receiptNumber || null
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'درخواست واریز ثبت شد و در انتظار تایید ادمین است',
      transaction: {
        id: transaction.id,
        amount: transaction.amount,
        status: transaction.status,
        createdAt: transaction.createdAt
      }
    });

  } catch (error) {
    console.error('خطا در ثبت درخواست واریز:', error);
    return NextResponse.json(
      { error: 'خطا در ثبت درخواست واریز به کیف پول' },
      { status: 500 }
    );
  }
}