import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { verifyToken } from '@/app/lib/jwt';

// وضعیت یک سفارش خاص برای کاربر (برای پولینگ در UI خرید/فروش)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');

    if (!orderId) {
      return NextResponse.json(
        { error: 'شناسه سفارش الزامی است' },
        { status: 400 }
      );
    }

    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'توکن احراز هویت یافت نشد' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'توکن نامعتبر است' }, { status: 401 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        userId: true,
        status: true,
        productType: true,
        amount: true,
        totalPrice: true,
        commission: true,
        statusReason: true,
        adminNotes: true,
        expiresAt: true,
        createdAt: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'سفارش یافت نشد' },
        { status: 404 }
      );
    }

    // اطمینان از اینکه کاربر فقط سفارش خودش را می‌بیند
    if (order.userId !== decoded.userId) {
      return NextResponse.json(
        { error: 'دسترسی غیرمجاز به سفارش' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      order: {
        id: order.id,
        status: order.status,
        productType: order.productType,
        amount: order.amount,
        totalPrice: order.totalPrice,
        commission: order.commission,
        expiresAt: order.expiresAt,
        createdAt: order.createdAt,
        adminMessage: order.statusReason || order.adminNotes || null,
      },
    });
  } catch (error) {
    console.error('خطا در دریافت وضعیت سفارش:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت وضعیت سفارش' },
      { status: 500 }
    );
  }
}


