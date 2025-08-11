import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { verifyToken } from '@/app/lib/jwt';

// به‌روزرسانی وضعیت سفارش
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
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'شناسه سفارش و وضعیت جدید الزامی است' },
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

    // بررسی اعتبار وضعیت جدید
    const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'FAILED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'وضعیت نامعتبر است' },
        { status: 400 }
      );
    }

    // به‌روزرسانی سفارش
    const updateData: any = { status };

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

    return NextResponse.json({
      success: true,
      message: 'وضعیت سفارش با موفقیت به‌روزرسانی شد',
      order: updatedOrder,
    });
  } catch (error) {
    console.error('خطا در به‌روزرسانی وضعیت سفارش:', error);
    return NextResponse.json(
      { error: 'خطا در به‌روزرسانی وضعیت سفارش' },
      { status: 500 }
    );
  }
}
