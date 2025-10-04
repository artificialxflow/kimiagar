import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { verifyToken } from '@/app/lib/jwt';

// تولید گزارش‌های مالی
export async function GET(request: NextRequest) {
  try {
    // در development mode از mock data استفاده کن
    if (process.env.NODE_ENV === 'development') {
      const mockReportData = {
        transactions: {
          total: 25000000,
          count: 15,
          monthly: [
            { month: 'آبان 1403', amount: 15000000 },
            { month: 'آذر 1403', amount: 10000000 }
          ]
        },
        orders: {
          total: 18000000,
          count: 12,
          monthly: [
            { month: 'آبان 1403', amount: 12000000 },
            { month: 'آذر 1403', amount: 6000000 }
          ],
          topProducts: [
            { product: 'طلای 18 عیار', count: 8, amount: 12000000 },
            { product: 'سکه بهار آزادی', count: 4, amount: 6000000 }
          ]
        },
        wallet: {
          balance: 5000000,
          monthly: [
            { month: 'آبان 1403', balance: 3000000 },
            { month: 'آذر 1403', balance: 5000000 }
          ]
        }
      };

      return NextResponse.json(mockReportData);
    }

    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'توکن احراز هویت یافت نشد' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'توکن نامعتبر است' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'transactions';
    const days = parseInt(searchParams.get('days') || '30');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let reportData: any = {};

    if (type === 'transactions') {
      reportData = await generateTransactionReport(decoded.userId, startDate);
    } else if (type === 'orders') {
      reportData = await generateOrderReport(decoded.userId, startDate);
    } else if (type === 'wallet') {
      reportData = await generateWalletReport(decoded.userId, startDate);
    }

    return NextResponse.json(reportData);
  } catch (error) {
    console.error('خطا در تولید گزارش:', error);
    return NextResponse.json(
      { error: 'خطا در تولید گزارش' },
      { status: 500 }
    );
  }
}

// گزارش تراکنش‌ها
async function generateTransactionReport(userId: string, startDate: Date) {
  const [transactions, totalVolume, totalCommission] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        userId,
        createdAt: { gte: startDate },
        status: 'COMPLETED',
      },
      select: {
        amount: true,
        type: true,
        createdAt: true,
        metadata: true,
      },
    }),
    prisma.transaction.aggregate({
      where: {
        userId,
        createdAt: { gte: startDate },
        status: 'COMPLETED',
        type: { in: ['DEPOSIT', 'WITHDRAW', 'TRANSFER'] },
      },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: {
        userId,
        createdAt: { gte: startDate },
        status: 'COMPLETED',
        type: 'COMMISSION',
      },
      _sum: { amount: true },
    }),
  ]);

  // گروه‌بندی بر اساس ماه
  const monthlyData = groupByMonth(transactions, 'transactions');
  
  // محاسبه آمار کلی
  const totalTransactions = transactions.length;
  const totalVolumeValue = totalVolume._sum.amount || 0;
  const totalCommissionValue = totalCommission._sum.amount || 0;

  return {
    totalTransactions,
    totalVolume: totalVolumeValue,
    totalCommission: totalCommissionValue,
    monthlyData,
    topProducts: [], // برای تراکنش‌ها خالی است
  };
}

// گزارش سفارش‌ها
async function generateOrderReport(userId: string, startDate: Date) {
  const [orders, totalVolume, totalCommission] = await Promise.all([
    prisma.order.findMany({
      where: {
        userId,
        createdAt: { gte: startDate },
        status: { in: ['COMPLETED', 'PROCESSING'] },
      },
      select: {
        amount: true,
        totalPrice: true,
        commission: true,
        productType: true,
        createdAt: true,
      },
    }),
    prisma.order.aggregate({
      where: {
        userId,
        createdAt: { gte: startDate },
        status: { in: ['COMPLETED', 'PROCESSING'] },
      },
      _sum: { totalPrice: true },
    }),
    prisma.order.aggregate({
      where: {
        userId,
        createdAt: { gte: startDate },
        status: { in: ['COMPLETED', 'PROCESSING'] },
      },
      _sum: { commission: true },
    }),
  ]);

  // گروه‌بندی بر اساس ماه
  const monthlyData = groupByMonth(orders, 'orders');
  
  // محصولات پرفروش
  const topProducts = await getTopProducts(userId, startDate);

  // محاسبه آمار کلی
  const totalTransactions = orders.length;
  const totalVolumeValue = totalVolume._sum.totalPrice || 0;
  const totalCommissionValue = totalCommission._sum.commission || 0;

  return {
    totalTransactions,
    totalVolume: totalVolumeValue,
    totalCommission: totalCommissionValue,
    monthlyData,
    topProducts,
  };
}

// گزارش کیف پول
async function generateWalletReport(userId: string, startDate: Date) {
  const [wallets, transactions] = await Promise.all([
    prisma.wallet.findMany({
      where: { userId, isActive: true },
      select: {
        type: true,
        balance: true,
        currency: true,
      },
    }),
    prisma.transaction.findMany({
      where: {
        userId,
        createdAt: { gte: startDate },
        status: 'COMPLETED',
        type: { in: ['DEPOSIT', 'WITHDRAW'] },
      },
      select: {
        amount: true,
        type: true,
        createdAt: true,
      },
    }),
  ]);

  // گروه‌بندی بر اساس ماه
  const monthlyData = groupByMonth(transactions, 'wallet');
  
  // محاسبه آمار کلی
  const totalTransactions = transactions.length;
  const totalVolumeValue = transactions.reduce((sum: number, t: any) => sum + parseFloat(t.amount.toString()), 0);
  const totalCommissionValue = 0; // برای کیف پول کارمزد محاسبه نمی‌شود

  return {
    totalTransactions,
    totalVolume: totalVolumeValue,
    totalCommission: totalCommissionValue,
    monthlyData,
    topProducts: [], // برای کیف پول خالی است
    wallets, // اطلاعات کیف پول‌ها
  };
}

// گروه‌بندی داده‌ها بر اساس ماه
function groupByMonth(data: any[], type: string) {
  const months: { [key: string]: any } = {};
  
  data.forEach((item: any) => {
    const date = new Date(item.createdAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = date.toLocaleDateString('fa-IR', { year: 'numeric', month: 'long' });
    
    if (!months[monthKey]) {
      months[monthKey] = {
        month: monthLabel,
        transactions: 0,
        volume: 0,
        commission: 0,
      };
    }
    
    months[monthKey].transactions++;
    
    if (type === 'transactions') {
      if (item.type === 'DEPOSIT' || item.type === 'WITHDRAW' || item.type === 'TRANSFER') {
        months[monthKey].volume += parseFloat(item.amount.toString());
      } else if (item.type === 'COMMISSION') {
        months[monthKey].commission += parseFloat(item.amount.toString());
      }
    } else if (type === 'orders') {
      months[monthKey].volume += parseFloat(item.totalPrice.toString());
      months[monthKey].commission += parseFloat(item.commission.toString());
    } else if (type === 'wallet') {
      months[monthKey].volume += parseFloat(item.amount.toString());
    }
  });
  
  return Object.values(months).sort((a, b) => {
    const aDate = new Date(a.month);
    const bDate = new Date(b.month);
    return bDate.getTime() - aDate.getTime();
  });
}

// دریافت محصولات پرفروش
async function getTopProducts(userId: string, startDate: Date) {
  const orders = await prisma.order.groupBy({
    by: ['productType'],
    where: {
      userId,
      createdAt: { gte: startDate },
      status: { in: ['COMPLETED', 'PROCESSING'] },
    },
    _sum: {
      totalPrice: true,
    },
    _count: {
      id: true,
    },
    orderBy: {
      _sum: {
        totalPrice: 'desc',
      },
    },
    take: 5,
  });

  return orders.map((order: any) => ({
    productType: order.productType,
    volume: order._sum.totalPrice || 0,
    count: order._count.id,
  }));
}
