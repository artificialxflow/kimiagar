import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(request: NextRequest) {
  console.log('📝 [Wallet Balance API] ========== دریافت موجودی کیف پول ==========');
  
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      console.error('❌ [Wallet Balance API] شناسه کاربر الزامی است');
      return NextResponse.json(
        { error: 'شناسه کاربر الزامی است' },
        { status: 400 }
      );
    }

    console.log('📋 [Wallet Balance API] User ID:', userId);

    // دریافت کیف پول‌های کاربر (همیشه از دیتابیس)
    const wallets = await prisma.wallet.findMany({
      where: { userId },
      select: {
        id: true,
        type: true,
        balance: true,
        currency: true,
        createdAt: true
      },
      orderBy: { type: 'asc' }
    });

    console.log('📊 [Wallet Balance API] تعداد کیف پول‌ها:', wallets.length);

    // دریافت آخرین تراکنش‌ها
    const recentTransactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        type: true,
        amount: true,
        description: true,
        status: true,
        createdAt: true,
        wallet: {
          select: {
            type: true
          }
        }
      }
    });

    // محاسبه آمار کلی
    const allTransactions = await prisma.transaction.findMany({
      where: { userId },
      select: {
        type: true,
        amount: true,
        status: true,
        wallet: {
          select: {
            type: true
          }
        }
      }
    });

    // محاسبه کل شارژ (DEPOSIT در کیف پول ریالی)
    const totalDeposit = allTransactions
      .filter(t => t.type === 'DEPOSIT' && t.wallet.type === 'RIAL' && t.status === 'COMPLETED')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // محاسبه کل برداشت (WITHDRAW از کیف پول ریالی)
    const totalWithdraw = allTransactions
      .filter(t => t.type === 'WITHDRAW' && t.wallet.type === 'RIAL' && t.status === 'COMPLETED')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // محاسبه تعداد کل تراکنش‌ها
    const totalTransactions = allTransactions.length;

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

    // محاسبه موجودی سکه‌ها
    let fullCoin = 0;
    let halfCoin = 0;
    let quarterCoin = 0;

    completedOrders.forEach(order => {
      if (order.type === 'BUY') {
        // خرید = اضافه شدن به موجودی
        if (order.productType === 'COIN_BAHAR_86') {
          fullCoin += Number(order.amount);
        } else if (order.productType === 'COIN_NIM_86') {
          halfCoin += Number(order.amount);
        } else if (order.productType === 'COIN_ROBE_86') {
          quarterCoin += Number(order.amount);
        }
      } else if (order.type === 'SELL') {
        // فروش = کسر از موجودی
        if (order.productType === 'COIN_BAHAR_86') {
          fullCoin -= Number(order.amount);
        } else if (order.productType === 'COIN_NIM_86') {
          halfCoin -= Number(order.amount);
        } else if (order.productType === 'COIN_ROBE_86') {
          quarterCoin -= Number(order.amount);
        }
      }
    });

    // اطمینان از مثبت بودن مقادیر
    fullCoin = Math.max(0, fullCoin);
    halfCoin = Math.max(0, halfCoin);
    quarterCoin = Math.max(0, quarterCoin);

    const coins = {
      fullCoin,
      halfCoin,
      quarterCoin,
      total: fullCoin + halfCoin + quarterCoin
    };

    console.log('✅ [Wallet Balance API] ========== موجودی آماده شد ==========');

    return NextResponse.json({
      success: true,
      wallets,
      recentTransactions,
      statistics: {
        totalDeposit: Number(totalDeposit),
        totalWithdraw: Number(totalWithdraw),
        totalTransactions
      },
      coins
    });

  } catch (error: any) {
    console.error('❌ [Wallet Balance API] ========== خطا در دریافت موجودی ==========');
    console.error('❌ [Wallet Balance API] خطا:', error);
    console.error('📋 [Wallet Balance API] نوع خطا:', error?.constructor?.name || 'Unknown');
    console.error('📋 [Wallet Balance API] پیام خطا:', error?.message || 'بدون پیام');
    
    return NextResponse.json(
      { 
        error: 'خطا در دریافت اطلاعات کیف پول',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
      { status: 500 }
    );
  }
} 