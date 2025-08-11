import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, orderId, amount, paymentMethod, callbackUrl } = body;

    if (!userId || !orderId || !amount || !paymentMethod || !callbackUrl) {
      return NextResponse.json(
        { error: 'اطلاعات ناقص یا نامعتبر' },
        { status: 400 }
      );
    }

    // بررسی سفارش
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
        status: 'PENDING'
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'سفارش یافت نشد یا قبلاً پردازش شده' },
        { status: 404 }
      );
    }

    // بررسی موجودی کیف پول ریالی
    const rialWallet = await prisma.wallet.findFirst({
      where: {
        userId,
        type: 'RIAL'
      }
    });

    if (!rialWallet || Number(rialWallet.balance) < amount) {
      return NextResponse.json(
        { error: 'موجودی کافی نیست' },
        { status: 400 }
      );
    }

    // ایجاد تراکنش پرداخت
    const paymentTransaction = await prisma.paymentTransaction.create({
      data: {
        userId,
        orderId,
        amount,
        paymentMethod,
        status: 'PENDING',
        callbackUrl,
        createdAt: new Date()
      }
    });

    // در اینجا باید اتصال به درگاه پرداخت واقعی انجام شود
    // برای نمونه، یک URL پرداخت ساختگی ایجاد می‌کنیم
    const paymentUrl = `/payment/process?transactionId=${paymentTransaction.id}&amount=${amount}`;

    return NextResponse.json({
      success: true,
      paymentTransaction: {
        id: paymentTransaction.id,
        amount: paymentTransaction.amount,
        status: paymentTransaction.status,
        paymentUrl
      }
    });

  } catch (error) {
    console.error('خطا در ایجاد تراکنش پرداخت:', error);
    return NextResponse.json(
      { error: 'خطا در ایجاد تراکنش پرداخت' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const transactionId = searchParams.get('transactionId');

    if (!userId) {
      return NextResponse.json(
        { error: 'شناسه کاربر الزامی است' },
        { status: 400 }
      );
    }

    if (transactionId) {
      // دریافت تراکنش خاص
      const transaction = await prisma.paymentTransaction.findFirst({
        where: {
          id: transactionId,
          userId
        }
      });

      if (!transaction) {
        return NextResponse.json(
          { error: 'تراکنش یافت نشد' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        transaction
      });
    } else {
      // دریافت تمام تراکنش‌های کاربر
      const transactions = await prisma.paymentTransaction.findMany({
        where: {
          userId
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return NextResponse.json({
        success: true,
        transactions
      });
    }

  } catch (error) {
    console.error('خطا در دریافت تراکنش‌های پرداخت:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت تراکنش‌های پرداخت' },
      { status: 500 }
    );
  }
}
