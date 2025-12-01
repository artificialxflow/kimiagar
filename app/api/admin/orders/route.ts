import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { verifyToken } from '@/app/lib/jwt';

async function expirePendingOrders() {
  const now = new Date();
  const pendingOrders = await prisma.order.findMany({
    where: {
      status: 'PENDING',
      expiresAt: {
        not: null,
        lt: now,
      },
    },
    select: {
      id: true,
      userId: true,
      type: true,
      productType: true,
      amount: true,
    },
  });

  if (!pendingOrders.length) return;

  for (const order of pendingOrders) {
    try {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'EXPIRED',
          statusReason: 'مهلت ۱۸۰ ثانیه‌ای برای تایید به پایان رسید',
          updatedAt: now,
        },
      });

      await prisma.notification.create({
        data: {
          userId: order.userId,
          type: 'ORDER',
          title: 'مهلت سفارش به پایان رسید',
          message: 'به دلیل پایان مهلت ۱۸۰ ثانیه‌ای، سفارش شما منقضی شد. لطفاً دوباره سفارش دهید.',
          metadata: {
            orderId: order.id,
            orderType: order.type,
            productType: order.productType,
            amount: order.amount.toString(),
            expiredAt: now.toISOString(),
          },
        },
      });
    } catch (error) {
      console.error('خطا در منقضی کردن سفارش:', order.id, error);
    }
  }
}

// دریافت لیست سفارش‌ها
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'توکن احراز هویت یافت نشد' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'توکن نامعتبر است' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    await expirePendingOrders();
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const productType = searchParams.get('productType');
    const userId = searchParams.get('userId');

    const skip = (page - 1) * limit;

    // فیلترهای جستجو
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    if (productType) {
      where.productType = productType;
    }

    if (userId) {
      where.userId = userId;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        select: {
          id: true,
          userId: true,
          type: true,
          productType: true,
          amount: true,
          price: true,
          totalPrice: true,
          commission: true,
          commissionRate: true,
          status: true,
          isAutomatic: true,
          notes: true,
          adminNotes: true,
          statusReason: true,
          priceLockedAt: true,
          expiresAt: true,
          processedAt: true,
          completedAt: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
              username: true,
              phoneNumber: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    // اضافه کردن موجودی کیف پول‌ها و بررسی موجودی کافی برای هر سفارش
    const ordersWithWallet = await Promise.all(
      orders.map(async (order) => {
        // دریافت کیف پول‌های کاربر
        const wallets = await prisma.wallet.findMany({
          where: { userId: order.userId },
          select: {
            type: true,
            balance: true,
            currency: true,
          },
        });

        const rialWallet = wallets.find((w) => w.type === 'RIAL');
        const goldWallet = wallets.find((w) => w.type === 'GOLD');

        const rialBalance = rialWallet ? Number(rialWallet.balance) : 0;
        const goldBalance = goldWallet ? Number(goldWallet.balance) : 0;

        // بررسی موجودی کافی
        let hasEnoughBalance = true;
        let balanceCheck: any = null;

          if (order.status === 'PENDING') {
            if (order.type === 'BUY') {
              // برای خرید: باید موجودی ریالی >= totalPrice باشد
              const required = Number(order.totalPrice);
              hasEnoughBalance = rialBalance >= required;
              balanceCheck = {
                type: 'RIAL',
                current: rialBalance,
                required,
                shortage: hasEnoughBalance ? 0 : required - rialBalance,
              };
            } else if (order.type === 'SELL') {
              const isCoinProduct =
                order.productType === 'COIN_BAHAR_86' ||
                order.productType === 'COIN_NIM_86' ||
                order.productType === 'COIN_ROBE_86';

              if (isCoinProduct) {
                // برای فروش سکه: باید تعداد سکه کافی از روی سفارش‌های تکمیل‌شده وجود داشته باشد
                const completedOrders = await prisma.order.findMany({
                  where: {
                    userId: order.userId,
                    productType: order.productType,
                    status: 'COMPLETED',
                  },
                  select: {
                    type: true,
                    amount: true,
                  },
                });

                let coinBalance = 0;
                completedOrders.forEach((o) => {
                  if (o.type === 'BUY') {
                    coinBalance += Number(o.amount);
                  } else if (o.type === 'SELL') {
                    coinBalance -= Number(o.amount);
                  }
                });

                coinBalance = Math.max(0, coinBalance);

                const required = Number(order.amount);
                hasEnoughBalance = coinBalance >= required;
                balanceCheck = {
                  type: 'COIN',
                  current: coinBalance,
                  required,
                  shortage: hasEnoughBalance ? 0 : required - coinBalance,
                };
              } else {
                // برای فروش طلای وزنی: باید موجودی طلایی >= amount باشد
                const required = Number(order.amount);
                hasEnoughBalance = goldBalance >= required;
                balanceCheck = {
                  type: 'GOLD',
                  current: goldBalance,
                  required,
                  shortage: hasEnoughBalance ? 0 : required - goldBalance,
                };
              }
            }
          }

        return {
          ...order,
          userWallet: {
            rial: rialBalance,
            gold: goldBalance,
          },
          hasEnoughBalance,
          balanceCheck,
        };
      })
    );

    return NextResponse.json({
      success: true,
      orders: ordersWithWallet,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('خطا در دریافت لیست سفارش‌ها:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت لیست سفارش‌ها' },
      { status: 500 }
    );
  }
}

// به‌روزرسانی سفارش
export async function PATCH(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'توکن احراز هویت یافت نشد' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'توکن نامعتبر است' }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, status, adminNotes, processedAt, completedAt } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: 'شناسه سفارش الزامی است' },
        { status: 400 }
      );
    }

    // بررسی وجود سفارش
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'سفارش یافت نشد' },
        { status: 404 }
      );
    }

    // به‌روزرسانی سفارش
    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

    // تنظیم زمان‌های مربوط به وضعیت
    if (status === 'PROCESSING' && !existingOrder.processedAt) {
      updateData.processedAt = new Date();
    } else if (status === 'COMPLETED' && !existingOrder.completedAt) {
      updateData.completedAt = new Date();
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: { user: true },
    });

    // ایجاد اعلان برای کاربر
    if (status && status !== existingOrder.status) {
      const statusMessages: { [key: string]: string } = {
        'CONFIRMED': 'سفارش شما تایید شده و در حال پردازش است.',
        'PROCESSING': 'سفارش شما در حال پردازش است.',
        'COMPLETED': 'سفارش شما با موفقیت تکمیل شد.',
        'CANCELLED': 'سفارش شما لغو شده است.',
        'FAILED': 'سفارش شما ناموفق بوده است.',
      };

      const message = statusMessages[status] || `وضعیت سفارش شما به ${status} تغییر یافت.`;

      await prisma.notification.create({
        data: {
          userId: existingOrder.userId,
          type: 'ORDER',
          title: 'وضعیت سفارش تغییر یافت',
          message,
          metadata: {
            orderId: orderId,
            oldStatus: existingOrder.status,
            newStatus: status,
            timestamp: new Date().toISOString(),
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'سفارش با موفقیت به‌روزرسانی شد',
      order: updatedOrder,
    });
  } catch (error) {
    console.error('خطا در به‌روزرسانی سفارش:', error);
    return NextResponse.json(
      { error: 'خطا در به‌روزرسانی سفارش' },
      { status: 500 }
    );
  }
}
