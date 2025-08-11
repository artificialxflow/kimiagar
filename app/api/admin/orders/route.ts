import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { verifyToken } from '@/app/lib/jwt';

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

    return NextResponse.json({
      success: true,
      orders,
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
