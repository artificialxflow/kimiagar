import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { verifyToken } from '@/app/lib/jwt';

// مشاهده تراکنش‌های کاربر توسط ادمین
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  console.log('📝 [Admin Transactions] ========== مشاهده تراکنش‌های کاربر ==========');
  console.log('📝 [Admin Transactions] Time:', new Date().toISOString());

  try {
    // بررسی توکن و دسترسی ادمین
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      console.error('❌ [Admin Transactions] توکن احراز هویت یافت نشد');
      return NextResponse.json({ error: 'توکن احراز هویت یافت نشد' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      console.error('❌ [Admin Transactions] توکن نامعتبر است');
      return NextResponse.json({ error: 'توکن نامعتبر است' }, { status: 401 });
    }

    // بررسی دسترسی ادمین
    const adminUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, isAdmin: true, username: true }
    });

    if (!adminUser || !adminUser.isAdmin) {
      console.error('❌ [Admin Transactions] دسترسی غیرمجاز - کاربر ادمین نیست');
      return NextResponse.json(
        { error: 'دسترسی غیرمجاز. فقط ادمین‌ها می‌توانند تراکنش‌های کاربران را مشاهده کنند' },
        { status: 403 }
      );
    }

    console.log('✅ [Admin Transactions] ادمین تایید شد:', adminUser.username);

    const { userId } = await params;

    if (!userId) {
      console.error('❌ [Admin Transactions] شناسه کاربر الزامی است');
      return NextResponse.json(
        { error: 'شناسه کاربر الزامی است' },
        { status: 400 }
      );
    }

    // بررسی وجود کاربر
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true
      }
    });

    if (!user) {
      console.error('❌ [Admin Transactions] کاربر یافت نشد');
      return NextResponse.json(
        { error: 'کاربر یافت نشد' },
        { status: 404 }
      );
    }

    console.log('✅ [Admin Transactions] کاربر یافت شد:', user.username);

    // دریافت پارامترهای pagination و فیلتر
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    const skip = (page - 1) * limit;

    // ساخت فیلترها
    const where: any = {
      userId
    };

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    console.log('📋 [Admin Transactions] فیلترها:', { type, status, page, limit });

    // دریافت تراکنش‌ها و تعداد کل
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          type: true,
          amount: true,
          description: true,
          status: true,
          referenceId: true,
          metadata: true,
          createdAt: true,
          updatedAt: true,
          wallet: {
            select: {
              id: true,
              type: true,
              currency: true
            }
          }
        }
      }),
      prisma.transaction.count({ where })
    ]);

    console.log('✅ [Admin Transactions] ========== دریافت موفق ==========');
    console.log('📊 [Admin Transactions] تعداد تراکنش‌ها:', transactions.length);
    console.log('📊 [Admin Transactions] تعداد کل:', total);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName
      },
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error: any) {
    console.error('❌ [Admin Transactions] ========== خطا در مشاهده تراکنش‌ها ==========');
    console.error('❌ [Admin Transactions] خطا:', error);
    console.error('📋 [Admin Transactions] نوع خطا:', error?.constructor?.name || 'Unknown');
    console.error('📋 [Admin Transactions] پیام خطا:', error?.message || 'بدون پیام');
    console.error('📋 [Admin Transactions] Stack:', error?.stack || 'بدون stack');

    return NextResponse.json(
      { 
        error: 'خطا در دریافت تراکنش‌های کاربر',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
      { status: 500 }
    );
  }
}

