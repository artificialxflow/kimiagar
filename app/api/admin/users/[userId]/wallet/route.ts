import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { verifyToken } from '@/app/lib/jwt';

// مشاهده موجودی کاربر توسط ادمین
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  console.log('📝 [Admin Wallet] ========== مشاهده موجودی کاربر ==========');
  console.log('📝 [Admin Wallet] Time:', new Date().toISOString());

  try {
    // بررسی توکن و دسترسی ادمین
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      console.error('❌ [Admin Wallet] توکن احراز هویت یافت نشد');
      return NextResponse.json({ error: 'توکن احراز هویت یافت نشد' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      console.error('❌ [Admin Wallet] توکن نامعتبر است');
      return NextResponse.json({ error: 'توکن نامعتبر است' }, { status: 401 });
    }

    // بررسی دسترسی ادمین
    const adminUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, isAdmin: true, username: true }
    });

    if (!adminUser || !adminUser.isAdmin) {
      console.error('❌ [Admin Wallet] دسترسی غیرمجاز - کاربر ادمین نیست');
      return NextResponse.json(
        { error: 'دسترسی غیرمجاز. فقط ادمین‌ها می‌توانند موجودی کاربران را مشاهده کنند' },
        { status: 403 }
      );
    }

    console.log('✅ [Admin Wallet] ادمین تایید شد:', adminUser.username);

    const { userId } = await params;

    if (!userId) {
      console.error('❌ [Admin Wallet] شناسه کاربر الزامی است');
      return NextResponse.json(
        { error: 'شناسه کاربر الزامی است' },
        { status: 400 }
      );
    }

    console.log('📋 [Admin Wallet] در حال دریافت موجودی کاربر:', userId);

    // بررسی وجود کاربر
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        phoneNumber: true
      }
    });

    if (!user) {
      console.error('❌ [Admin Wallet] کاربر یافت نشد');
      return NextResponse.json(
        { error: 'کاربر یافت نشد' },
        { status: 404 }
      );
    }

    console.log('✅ [Admin Wallet] کاربر یافت شد:', user.username);

    // دریافت کیف پول‌های کاربر
    const wallets = await prisma.wallet.findMany({
      where: { userId },
      select: {
        id: true,
        type: true,
        balance: true,
        currency: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { type: 'asc' }
    });

    console.log('📊 [Admin Wallet] تعداد کیف پول‌ها:', wallets.length);

    // دریافت آخرین تراکنش‌ها (اختیاری)
    const { searchParams } = new URL(request.url);
    const includeTransactions = searchParams.get('includeTransactions') === 'true';
    const transactionLimit = parseInt(searchParams.get('transactionLimit') || '10');

    let recentTransactions: any[] = [];

    if (includeTransactions) {
      recentTransactions = await prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: transactionLimit,
        select: {
          id: true,
          type: true,
          amount: true,
          description: true,
          status: true,
          referenceId: true,
          metadata: true,
          createdAt: true,
          wallet: {
            select: {
              type: true
            }
          }
        }
      });

      console.log('📋 [Admin Wallet] تعداد تراکنش‌ها:', recentTransactions.length);
    }

    // محاسبه موجودی کل
    const totalRial = wallets
      .filter(w => w.type === 'RIAL')
      .reduce((sum, w) => sum + Number(w.balance), 0);

    const totalGold = wallets
      .filter(w => w.type === 'GOLD')
      .reduce((sum, w) => sum + Number(w.balance), 0);

    // محاسبه موجودی سکه‌ها از سفارش‌های COMPLETED
    const completedOrders = await prisma.order.findMany({
      where: {
        userId,
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

    console.log('✅ [Admin Wallet] ========== دریافت موفق ==========');
    console.log('📊 [Admin Wallet] موجودی ریالی کل:', totalRial);
    console.log('📊 [Admin Wallet] موجودی طلایی کل:', totalGold);
    console.log('📊 [Admin Wallet] موجودی سکه:', { fullCoin, halfCoin, quarterCoin });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber
      },
      wallets,
      summary: {
        totalRial,
        totalGold,
        walletCount: wallets.length
      },
      coins: {
        fullCoin,
        halfCoin,
        quarterCoin
      },
      recentTransactions: includeTransactions ? recentTransactions : undefined
    });

  } catch (error: any) {
    console.error('❌ [Admin Wallet] ========== خطا در مشاهده موجودی ==========');
    console.error('❌ [Admin Wallet] خطا:', error);
    console.error('📋 [Admin Wallet] نوع خطا:', error?.constructor?.name || 'Unknown');
    console.error('📋 [Admin Wallet] پیام خطا:', error?.message || 'بدون پیام');
    console.error('📋 [Admin Wallet] Stack:', error?.stack || 'بدون stack');

    return NextResponse.json(
      { 
        error: 'خطا در دریافت موجودی کاربر',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
      { status: 500 }
    );
  }
}

