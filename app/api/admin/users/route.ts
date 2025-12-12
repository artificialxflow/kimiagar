import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { verifyToken } from '@/app/lib/jwt';

// دریافت لیست کاربران
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

    // بررسی دسترسی ادمین
    const adminUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, isAdmin: true }
    });

    if (!adminUser || !adminUser.isAdmin) {
      return NextResponse.json(
        { error: 'دسترسی غیرمجاز. فقط ادمین‌ها می‌توانند به این بخش دسترسی داشته باشند' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    const skip = (page - 1) * limit;

    // فیلترهای جستجو
    const where: any = {};

    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status === 'verified') {
      where.isVerified = true;
    } else if (status === 'unverified') {
      where.isVerified = false;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          email: true,
          isVerified: true,
          isEmailVerified: true,
          isPhoneVerified: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          wallets: {
            select: {
              type: true,
              balance: true,
              currency: true,
            },
          },
          _count: {
            select: {
              orders: true,
              transactions: true,
              wallets: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    // محاسبه موجودی سکه و تراکنش‌های در انتظار برای هر کاربر
    const usersWithDetails = await Promise.all(
      users.map(async (user) => {
        // محاسبه موجودی سکه از سفارش‌های COMPLETED
        const completedOrders = await prisma.order.findMany({
          where: {
            userId: user.id,
            status: 'COMPLETED'
          },
          select: {
            type: true,
            productType: true,
            amount: true
          }
        });

        let fullCoin = 0;
        let halfCoin = 0;
        let quarterCoin = 0;

        completedOrders.forEach(order => {
          if (order.type === 'BUY') {
            if (order.productType === 'COIN_BAHAR_86') {
              fullCoin += Number(order.amount);
            } else if (order.productType === 'COIN_NIM_86') {
              halfCoin += Number(order.amount);
            } else if (order.productType === 'COIN_ROBE_86') {
              quarterCoin += Number(order.amount);
            }
          } else if (order.type === 'SELL') {
            if (order.productType === 'COIN_BAHAR_86') {
              fullCoin -= Number(order.amount);
            } else if (order.productType === 'COIN_NIM_86') {
              halfCoin -= Number(order.amount);
            } else if (order.productType === 'COIN_ROBE_86') {
              quarterCoin -= Number(order.amount);
            }
          }
        });

        fullCoin = Math.max(0, fullCoin);
        halfCoin = Math.max(0, halfCoin);
        quarterCoin = Math.max(0, quarterCoin);

        // دریافت آخرین تراکنش در انتظار تایید
        const pendingTransaction = await prisma.transaction.findFirst({
          where: {
            userId: user.id,
            status: 'PENDING'
          },
          orderBy: {
            createdAt: 'desc'
          },
          select: {
            id: true,
            type: true,
            amount: true,
            description: true,
            createdAt: true,
            metadata: true,
            wallet: {
              select: {
                type: true
              }
            }
          }
        });

        // محاسبه موجودی قبل از تراکنش
        const rialWallet = user.wallets.find(w => w.type === 'RIAL');
        const goldWallet = user.wallets.find(w => w.type === 'GOLD');
        
        let rialBalanceBefore = rialWallet ? Number(rialWallet.balance) : 0;
        let goldBalanceBefore = goldWallet ? Number(goldWallet.balance) : 0;

        if (pendingTransaction) {
          if (pendingTransaction.wallet.type === 'RIAL') {
            if (pendingTransaction.type === 'DEPOSIT') {
              // برای واریز، موجودی فعلی منهای مبلغ واریز = موجودی قبل از واریز
              rialBalanceBefore = rialBalanceBefore - Number(pendingTransaction.amount);
            } else if (pendingTransaction.type === 'WITHDRAW') {
              // برای برداشت، موجودی فعلی به اضافه مبلغ برداشت = موجودی قبل از برداشت
              rialBalanceBefore = rialBalanceBefore + Number(pendingTransaction.amount);
            }
          } else if (pendingTransaction.wallet.type === 'GOLD') {
            if (pendingTransaction.type === 'DEPOSIT') {
              goldBalanceBefore = goldBalanceBefore - Number(pendingTransaction.amount);
            } else if (pendingTransaction.type === 'WITHDRAW') {
              goldBalanceBefore = goldBalanceBefore + Number(pendingTransaction.amount);
            }
          }
        }

        return {
          ...user,
          coinBalance: {
            fullCoin,
            halfCoin,
            quarterCoin
          },
          pendingTransaction: pendingTransaction ? {
            id: pendingTransaction.id,
            type: pendingTransaction.type,
            amount: Number(pendingTransaction.amount),
            description: pendingTransaction.description,
            createdAt: pendingTransaction.createdAt,
            metadata: pendingTransaction.metadata,
            walletType: pendingTransaction.wallet.type
          } : null,
          balanceBeforeTransaction: {
            rial: rialBalanceBefore,
            gold: goldBalanceBefore
          }
        };
      })
    );

    return NextResponse.json({
      success: true,
      users: usersWithDetails,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('خطا در دریافت لیست کاربران:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت لیست کاربران' },
      { status: 500 }
    );
  }
}

// به‌روزرسانی وضعیت کاربر
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

    // بررسی دسترسی ادمین
    const adminUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, isAdmin: true }
    });

    if (!adminUser || !adminUser.isAdmin) {
      return NextResponse.json(
        { error: 'دسترسی غیرمجاز. فقط ادمین‌ها می‌توانند به این بخش دسترسی داشته باشند' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, isVerified, isBlocked, adminNotes } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'شناسه کاربر الزامی است' },
        { status: 400 }
      );
    }

    // بررسی وجود کاربر
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'کاربر یافت نشد' },
        { status: 404 }
      );
    }

    // به‌روزرسانی کاربر
    const updateData: any = {};
    if (isVerified !== undefined) updateData.isVerified = isVerified;
    if (isBlocked !== undefined) updateData.isBlocked = isBlocked;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    // ایجاد اعلان برای کاربر
    if (isVerified !== undefined) {
      await prisma.notification.create({
        data: {
          userId,
          type: 'SYSTEM',
          title: isVerified ? 'حساب کاربری تایید شد' : 'حساب کاربری نیاز به تایید دارد',
          message: isVerified 
            ? 'حساب کاربری شما توسط ادمین تایید شد. اکنون می‌توانید از تمام قابلیت‌ها استفاده کنید.'
            : 'حساب کاربری شما نیاز به بررسی و تایید دارد.',
          metadata: {
            action: 'account_verification_updated',
            verified: isVerified,
            timestamp: new Date().toISOString(),
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'وضعیت کاربر با موفقیت به‌روزرسانی شد',
      user: updatedUser,
    });
  } catch (error) {
    console.error('خطا در به‌روزرسانی کاربر:', error);
    return NextResponse.json(
      { error: 'خطا در به‌روزرسانی کاربر' },
      { status: 500 }
    );
  }
}
