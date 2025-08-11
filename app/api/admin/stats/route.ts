import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { verifyToken } from '@/app/lib/jwt';

// دریافت آمار کلی سیستم
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

    // بررسی نقش ادمین (در حالت واقعی باید از جدول AdminUser بررسی شود)
    // فعلاً برای تست، همه کاربران را ادمین در نظر می‌گیریم

    const [
      totalUsers,
      totalOrders,
      totalTransactions,
      totalRevenue,
      pendingOrders,
      activeUsers,
    ] = await Promise.all([
      // کل کاربران
      prisma.user.count(),
      
      // کل سفارش‌ها
      prisma.order.count(),
      
      // کل تراکنش‌ها
      prisma.transaction.count(),
      
      // کل درآمد (کارمزدها)
      prisma.order.aggregate({
        where: { status: { in: ['COMPLETED', 'PROCESSING'] } },
        _sum: { commission: true },
      }),
      
      // سفارش‌های در انتظار
      prisma.order.count({
        where: { status: 'PENDING' },
      }),
      
      // کاربران فعال (ورود در 30 روز گذشته)
      prisma.user.count({
        where: {
          lastLoginAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      totalUsers,
      totalOrders,
      totalTransactions,
      totalRevenue: totalRevenue._sum.commission || 0,
      pendingOrders,
      activeUsers,
    });
  } catch (error) {
    console.error('خطا در دریافت آمار ادمین:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت آمار ادمین' },
      { status: 500 }
    );
  }
}
