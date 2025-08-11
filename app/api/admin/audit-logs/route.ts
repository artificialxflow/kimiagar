import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { verifyToken } from '@/app/lib/jwt';

// دریافت Audit Log ها (فقط ادمین)
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

    // بررسی اینکه کاربر ادمین است
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { isAdmin: true }
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز. فقط ادمین‌ها می‌توانند Audit Log را مشاهده کنند' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const action = searchParams.get('action');
    const table = searchParams.get('table');
    const adminUserId = searchParams.get('adminUserId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // ساخت فیلترها
    const where: any = {};
    
    if (action) where.action = action;
    if (table) where.table = table;
    if (adminUserId) where.adminUserId = adminUserId;
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    // محاسبه offset
    const offset = (page - 1) * limit;

    // دریافت Audit Log ها
    const [auditLogs, totalCount] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          adminUser: {
            select: {
              username: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.auditLog.count({ where })
    ]);

    // محاسبه اطلاعات pagination
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      auditLogs,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage,
        hasPrevPage,
        limit
      }
    });
  } catch (error) {
    console.error('خطا در دریافت Audit Log:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت Audit Log' },
      { status: 500 }
    );
  }
}

// دریافت آمار Audit Log (فقط ادمین)
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

    // بررسی اینکه کاربر ادمین است
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { isAdmin: true }
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز. فقط ادمین‌ها می‌توانند آمار Audit Log را مشاهده کنند' }, { status: 403 });
    }

    const body = await request.json();
    const { startDate, endDate } = body;

    // آمار کلی
    const totalActions = await prisma.auditLog.count({
      where: {
        createdAt: {
          gte: startDate ? new Date(startDate) : undefined,
          lte: endDate ? new Date(endDate) : undefined
        }
      }
    });

    // آمار بر اساس عملیات
    const actionsStats = await prisma.auditLog.groupBy({
      by: ['action'],
      where: {
        createdAt: {
          gte: startDate ? new Date(startDate) : undefined,
          lte: endDate ? new Date(endDate) : undefined
        }
      },
      _count: {
        action: true
      }
    });

    // آمار بر اساس جدول
    const tablesStats = await prisma.auditLog.groupBy({
      by: ['table'],
      where: {
        createdAt: {
          gte: startDate ? new Date(startDate) : undefined,
          lte: endDate ? new Date(endDate) : undefined
        }
      },
      _count: {
        table: true
      }
    });

    // آمار بر اساس ادمین
    const adminsStats = await prisma.auditLog.groupBy({
      by: ['adminUserId'],
      where: {
        createdAt: {
          gte: startDate ? new Date(startDate) : undefined,
          lte: endDate ? new Date(endDate) : undefined
        }
      },
      _count: {
        adminUserId: true
      }
    });

    // آمار روزانه (آخرین 30 روز)
    const dailyStats = await prisma.auditLog.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      },
      _count: {
        createdAt: true
      }
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalActions,
        actionsStats,
        tablesStats,
        adminsStats,
        dailyStats
      }
    });
  } catch (error) {
    console.error('خطا در دریافت آمار Audit Log:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت آمار Audit Log' },
      { status: 500 }
    );
  }
}
