import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, productType, amount, deliveryAddress, deliveryDate, deliveryTime, contactPhone } = body;

    if (!userId || !productType || !amount || !deliveryAddress || !deliveryDate || !deliveryTime || !contactPhone) {
      return NextResponse.json(
        { error: 'اطلاعات ناقص یا نامعتبر' },
        { status: 400 }
      );
    }

    // بررسی موجودی کیف پول طلایی
    const goldWallet = await prisma.wallet.findFirst({
      where: {
        userId,
        type: 'GOLD'
      }
    });

    if (!goldWallet || Number(goldWallet.balance) < amount) {
      return NextResponse.json(
        { error: 'موجودی طلا کافی نیست' },
        { status: 400 }
      );
    }

    // بررسی حداقل مقدار تحویل (5 گرم)
    if (productType === 'GOLD_18K' && amount < 5) {
      return NextResponse.json(
        { error: 'حداقل مقدار تحویل طلا 5 گرم است' },
        { status: 400 }
      );
    }

    // محاسبه کارمزد تحویل
    let deliveryFee = 0;
    if (productType === 'GOLD_18K') {
      // کارمزد 2% برای تحویل طلا
      deliveryFee = amount * 0.02;
    } else {
      // کارمزد ثابت 50,000 تومان برای سکه‌ها
      deliveryFee = 50000;
    }

    // ایجاد درخواست تحویل
    const deliveryRequest = await prisma.deliveryRequest.create({
      data: {
        userId,
        productType,
        amount,
        deliveryAddress,
        commission: deliveryFee,
        status: 'PENDING',
        requestedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      deliveryRequest: {
        id: deliveryRequest.id,
        productType: deliveryRequest.productType,
        amount: deliveryRequest.amount,
        deliveryAddress: deliveryRequest.deliveryAddress,
        commission: deliveryRequest.commission,
        status: deliveryRequest.status,
        requestedAt: deliveryRequest.requestedAt
      }
    });

  } catch (error) {
    console.error('خطا در ثبت درخواست تحویل:', error);
    return NextResponse.json(
      { error: 'خطا در ثبت درخواست تحویل' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'شناسه کاربر الزامی است' },
        { status: 400 }
      );
    }

    // دریافت درخواست‌های تحویل کاربر
    const deliveryRequests = await prisma.deliveryRequest.findMany({
      where: {
        userId
      },
      orderBy: {
        requestedAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      deliveryRequests
    });

  } catch (error) {
    console.error('خطا در دریافت درخواست‌های تحویل:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت درخواست‌های تحویل' },
      { status: 500 }
    );
  }
}
