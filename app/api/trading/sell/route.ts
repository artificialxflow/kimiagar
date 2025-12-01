import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getTradingMode } from '@/app/lib/systemSettings';

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

    const tradingMode = await getTradingMode();
    if (tradingMode.tradingPaused) {
      return NextResponse.json(
        { 
          error: tradingMode.message || 'مدیر در حال حاضر معاملات را موقتا متوقف کرده است',
          mode: tradingMode
        },
        { status: 423 }
      );
    }

    // جلوگیری از ثبت سفارش جدید در صورت وجود سفارش PENDING فعال
    const activePendingOrder = await prisma.order.findFirst({
      where: {
        userId,
        status: 'PENDING',
      },
      select: { id: true, productType: true, type: true },
    });

    if (activePendingOrder) {
      return NextResponse.json(
        {
          error: 'شما یک سفارش در حال بررسی دارید. لطفاً تا مشخص شدن نتیجه آن صبر کنید.',
          activeOrderId: activePendingOrder.id,
          activeOrderType: activePendingOrder.type,
          activeProductType: activePendingOrder.productType,
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, firstName: true, lastName: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'کاربر یافت نشد' },
        { status: 404 }
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

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 180 * 1000);

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
        status: 'PENDING',
        isAutomatic: false,
        priceLockedAt: now,
        expiresAt
      }
    });

    await prisma.notification.create({
      data: {
        userId,
        type: 'ORDER',
        title: 'سفارش فروش شما ثبت شد',
        message: 'سفارش فروش شما در انتظار تایید ادمین است.',
        metadata: {
          orderId: order.id,
          orderType: 'SELL',
          productType,
          amount: amount.toString(),
          totalPrice: totalPrice.toString(),
          expiresAt: expiresAt.toISOString(),
        },
      },
    });

    const adminUsers = await prisma.user.findMany({
      where: { isAdmin: true, isBlocked: false },
      select: { id: true },
    });

    await Promise.all(
      adminUsers.map((admin) =>
        prisma.notification.create({
          data: {
            userId: admin.id,
            type: 'ORDER',
            title: 'درخواست فروش جدید',
            message: `کاربر ${user.firstName} ${user.lastName} درخواست فروش ${amount} واحد از ${productType} ثبت کرده است.`,
            metadata: {
              orderId: order.id,
              userId,
              userName: `${user.firstName} ${user.lastName}`,
              productType,
              amount: amount.toString(),
              totalPrice: totalPrice.toString(),
              expiresAt: expiresAt.toISOString(),
            },
          },
        })
      )
    );

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
        createdAt: order.createdAt,
        expiresAt
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