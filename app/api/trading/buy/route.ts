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

    // دریافت اطلاعات کاربر برای اطلاع‌رسانی
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
      },
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
    const unitPrice = Number(price.buyPrice);
    const totalPrice = amount * unitPrice;
    const commissionRateValue = commissionRate ? Number(commissionRate.buyRate) : 0.01; // پیش‌فرض 1%
    const commission = totalPrice * commissionRateValue;
    const finalPrice = totalPrice + commission;

    // بررسی موجودی کیف پول ریالی
    const rialWallet = await prisma.wallet.findFirst({
      where: {
        userId,
        type: 'RIAL'
      }
    });

    if (!rialWallet || Number(rialWallet.balance) < finalPrice) {
      return NextResponse.json(
        { error: 'موجودی کافی نیست' },
        { status: 400 }
      );
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 180 * 1000); // 180 ثانیه بعد

    // ایجاد سفارش - همیشه با status PENDING (ادمین باید تایید کند)
    const order = await prisma.order.create({
      data: {
        userId,
        type: 'BUY',
        productType,
        amount,
        price: unitPrice,
        totalPrice,
        commission,
        commissionRate: commissionRateValue,
        status: 'PENDING', // همیشه PENDING - ادمین باید تایید کند
        isAutomatic: false, // غیرفعال کردن حالت اتوماتیک
        priceLockedAt: now,
        expiresAt,
      }
    });

    // ایجاد اعلان برای کاربر (اطلاع از ثبت سفارش)
    await prisma.notification.create({
      data: {
        userId,
        type: 'ORDER',
        title: 'سفارش شما ثبت شد',
        message: 'سفارش خرید شما در انتظار تایید ادمین است. لطفاً منتظر بمانید.',
        metadata: {
          orderId: order.id,
          orderType: 'BUY',
          productType,
          amount: amount.toString(),
          totalPrice: totalPrice.toString(),
          expiresAt: expiresAt.toISOString(),
        },
      },
    });

    // اطلاع‌رسانی به همه ادمین‌ها
    const adminUsers = await prisma.user.findMany({
      where: {
        isAdmin: true,
        isBlocked: false,
      },
      select: {
        id: true,
      },
    });

    const adminMessage = `کاربر ${user.firstName} ${user.lastName} درخواست خرید ${formatAmount(amount, productType)} به مبلغ ${finalPrice.toLocaleString('fa-IR')} تومان ثبت کرده است.`;

    await Promise.all(
      adminUsers.map((admin) =>
        prisma.notification.create({
          data: {
            userId: admin.id,
            type: 'ORDER',
            title: 'درخواست خرید جدید',
            message: adminMessage,
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
        status: order.status,
        createdAt: order.createdAt,
        expiresAt,
      }
    });

  } catch (error) {
    console.error('خطا در ثبت سفارش خرید:', error);
    return NextResponse.json(
      { error: 'خطا در ثبت سفارش خرید' },
      { status: 500 }
    );
  }
}

function formatAmount(amount: number, productType: string) {
  const isGold = productType?.toUpperCase()?.includes('GOLD');
  return `${amount} ${isGold ? 'گرم' : 'عدد'} ${getProductLabel(productType)}`;
}

function getProductLabel(productType: string) {
  const map: Record<string, string> = {
    'GOLD_18K': 'طلای 18 عیار',
    'GOLD_24K': 'طلای 24 عیار',
    'COIN_BAHAR': 'سکه بهار آزادی',
    'COIN_NIM': 'نیم سکه',
    'COIN_ROBE': 'ربع سکه',
    'COIN_BAHAR_86': 'سکه بهار آزادی 86',
    'COIN_NIM_86': 'نیم سکه 86',
    'COIN_ROBE_86': 'ربع سکه 86',
  };

  return map[productType] || productType;
}