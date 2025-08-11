import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { verifyToken } from '@/app/lib/jwt';

// دریافت اعلان‌های کاربر
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
    const limit = parseInt(searchParams.get('limit') || '20');
    const unreadOnly = searchParams.get('unread') === 'true';
    const type = searchParams.get('type');

    const skip = (page - 1) * limit;

    // فیلترهای جستجو
    const where: any = {
      userId: decoded.userId,
    };

    if (unreadOnly) {
      where.isRead = false;
    }

    if (type) {
      where.type = type;
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          type: true,
          title: true,
          message: true,
          isRead: true,
          isSent: true,
          sentAt: true,
          readAt: true,
          metadata: true,
          createdAt: true,
        },
      }),
      prisma.notification.count({ where }),
    ]);

    return NextResponse.json({
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('خطا در دریافت اعلان‌ها:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت اعلان‌ها' },
      { status: 500 }
    );
  }
}

// ایجاد اعلان جدید
export async function POST(request: NextRequest) {
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
    const { title, message, type = 'SYSTEM', metadata } = body;

    if (!title || !message) {
      return NextResponse.json(
        { error: 'عنوان و پیام اعلان الزامی است' },
        { status: 400 }
      );
    }

    const notification = await prisma.notification.create({
      data: {
        userId: decoded.userId,
        type,
        title,
        message,
        metadata: metadata || {},
      },
    });

    return NextResponse.json({
      message: 'اعلان با موفقیت ایجاد شد',
      notification,
    });
  } catch (error) {
    console.error('خطا در ایجاد اعلان:', error);
    return NextResponse.json(
      { error: 'خطا در ایجاد اعلان' },
      { status: 500 }
    );
  }
}

// به‌روزرسانی وضعیت اعلان (خوانده شده)
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
    const { notificationId, isRead } = body;

    if (!notificationId) {
      return NextResponse.json(
        { error: 'شناسه اعلان الزامی است' },
        { status: 400 }
      );
    }

    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId: decoded.userId,
      },
    });

    if (!notification) {
      return NextResponse.json(
        { error: 'اعلان یافت نشد' },
        { status: 404 }
      );
    }

    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: isRead !== undefined ? isRead : true,
        readAt: isRead ? new Date() : null,
      },
    });

    return NextResponse.json({
      message: 'وضعیت اعلان به‌روزرسانی شد',
      notification: updatedNotification,
    });
  } catch (error) {
    console.error('خطا در به‌روزرسانی اعلان:', error);
    return NextResponse.json(
      { error: 'خطا در به‌روزرسانی اعلان' },
      { status: 500 }
    );
  }
}
