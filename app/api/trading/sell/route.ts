import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, productType, amount, isAutomatic } = body;

    if (!userId || !productType || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'اطلاعات ناقص یا نامعتبر' },
        { status: 400 }
      );
    }

    // دریافت قیمت محصول
    const price = await prisma.price.findFirst({
      where: {
        productType,
        isActive: true
      }
    });

    if (!price) {
      return NextResponse.json(
        { error: 'قیمت محصول یافت نشد' },
        { status: 404 }
      );
    }

    // دریافت نرخ کارمزد از دیتابیس
    const commissionRate = await prisma.commission.findFirst({
      where: {
        productType,
        isActive: true
      }
    });

    // محاسبه قیمت‌ها
    const unitPrice = Number(price.sellPrice);
    const totalPrice = amount * unitPrice;
    const commissionRateValue = commissionRate ? Number(commissionRate.sellRate) : 0.01; // پیش‌فرض 1%
    const commission = totalPrice * commissionRateValue;
    const finalPrice = totalPrice - commission;

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

    // ایجاد سفارش - همیشه با status PENDING (ادمین باید تایید کند)
    const order = await prisma.order.create({
      data: {
        userId,
        type: 'SELL',
        productType,
        amount,
        price: unitPrice,
        totalPrice,
        commission,
        commissionRate: commissionRateValue,
        status: 'PENDING', // همیشه PENDING - ادمین باید تایید کند
        isAutomatic: false // غیرفعال کردن حالت اتوماتیک
      }
    });

    // حذف منطق اتوماتیک - ادمین باید تایید کند
    // تراکنش‌ها فقط زمانی انجام می‌شوند که ادمین سفارش را به COMPLETED تغییر دهد

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        productType: order.productType,
        amount: order.amount,
        totalPrice: order.totalPrice,
        commission: order.commission,
        finalPrice,
        status: order.status,
        createdAt: order.createdAt
      }
    });

  } catch (error) {
    console.error('خطا در ثبت سفارش فروش:', error);
    return NextResponse.json(
      { error: 'خطا در ثبت سفارش فروش' },
      { status: 500 }
    );
  }
} 