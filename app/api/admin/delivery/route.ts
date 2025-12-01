import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { verifyToken } from '@/app/lib/jwt';

// لیست و مدیریت درخواست‌های تحویل فیزیکی (فقط برای ادمین)

// GET /api/admin/delivery?status=&userId=&page=&limit=
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

    const adminUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, isAdmin: true },
    });

    if (!adminUser || !adminUser.isAdmin) {
      return NextResponse.json(
        { error: 'دسترسی غیرمجاز. فقط ادمین‌ها می‌توانند درخواست‌های تحویل را مدیریت کنند' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');

    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (userId) where.userId = userId;

    const [requests, total] = await Promise.all([
      prisma.deliveryRequest.findMany({
        where,
        orderBy: { requestedAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              phoneNumber: true,
            },
          },
        },
      }),
      prisma.deliveryRequest.count({ where }),
    ]);

    return NextResponse.json({
      requests,
      total,
      page,
      pageSize: limit,
    });
  } catch (error) {
    console.error('خطا در دریافت درخواست‌های تحویل:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت درخواست‌های تحویل' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/delivery  { id, status, adminNotes? }
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

    const adminUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, isAdmin: true },
    });

    if (!adminUser || !adminUser.isAdmin) {
      return NextResponse.json(
        { error: 'دسترسی غیرمجاز. فقط ادمین‌ها می‌توانند وضعیت تحویل را تغییر دهند' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, status, adminNotes } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'شناسه درخواست و وضعیت جدید الزامی است' },
        { status: 400 }
      );
    }

    const validStatuses = [
      'PENDING',
      'APPROVED',
      'PROCESSING',
      'READY',
      'DELIVERED',
      'CANCELLED',
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'وضعیت نامعتبر است' },
        { status: 400 }
      );
    }

    const existing = await prisma.deliveryRequest.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'درخواست تحویل یافت نشد' },
        { status: 404 }
      );
    }

    const data: any = {
      status,
      adminNotes: adminNotes ?? existing.adminNotes,
    };

    const now = new Date();
    if (status === 'APPROVED') data.approvedAt = now;
    if (status === 'READY') data.readyAt = now;
    if (status === 'DELIVERED') data.deliveredAt = now;

    const updated = await prisma.deliveryRequest.update({
      where: { id },
      data,
    });

    return NextResponse.json({
      message: 'وضعیت درخواست تحویل با موفقیت به‌روزرسانی شد',
      request: updated,
    });
  } catch (error) {
    console.error('خطا در به‌روزرسانی وضعیت تحویل:', error);
    return NextResponse.json(
      { error: 'خطا در به‌روزرسانی وضعیت تحویل' },
      { status: 500 }
    );
  }
}


