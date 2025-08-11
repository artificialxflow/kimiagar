import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { verifyToken } from '@/app/lib/jwt';

// دریافت تمام نرخ‌های کارمزد (فقط ادمین)
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
      return NextResponse.json({ error: 'دسترسی غیرمجاز. فقط ادمین‌ها می‌توانند به این بخش دسترسی داشته باشند' }, { status: 403 });
    }

    const commissions = await prisma.commission.findMany({
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      commissions
    });
  } catch (error) {
    console.error('خطا در دریافت کارمزدها:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت کارمزدها' },
      { status: 500 }
    );
  }
}

// ایجاد یا به‌روزرسانی نرخ کارمزد (فقط ادمین)
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
      return NextResponse.json({ error: 'دسترسی غیرمجاز. فقط ادمین‌ها می‌توانند کارمزدها را تغییر دهند' }, { status: 403 });
    }

    const body = await request.json();
    const { productType, buyRate, sellRate, minAmount, maxAmount, isActive = true } = body;

    // اعتبارسنجی ورودی‌ها
    if (!productType || buyRate === undefined || sellRate === undefined) {
      return NextResponse.json(
        { error: 'نوع محصول و نرخ‌های کارمزد الزامی هستند' },
        { status: 400 }
      );
    }

    // اعتبارسنجی نرخ‌های کارمزد (بین 0 تا 0.1 = 0% تا 10%)
    if (buyRate < 0 || buyRate > 0.1 || sellRate < 0 || sellRate > 0.1) {
      return NextResponse.json(
        { error: 'نرخ کارمزد باید بین 0 تا 10 درصد باشد' },
        { status: 400 }
      );
    }

    // بررسی وجود کارمزد برای این محصول
    const existingCommission = await prisma.commission.findFirst({
      where: { productType }
    });

    let commission;
    if (existingCommission) {
      // به‌روزرسانی کارمزد موجود
      commission = await prisma.commission.update({
        where: { id: existingCommission.id },
        data: {
          buyRate,
          sellRate,
          minAmount: minAmount || existingCommission.minAmount,
          maxAmount: maxAmount || existingCommission.maxAmount,
          isActive,
          updatedAt: new Date()
        }
      });
    } else {
      // ایجاد کارمزد جدید
      commission = await prisma.commission.create({
        data: {
          productType,
          buyRate,
          sellRate,
          minAmount: minAmount || 0,
          maxAmount: maxAmount || 1000000000,
          isActive,
          createdBy: decoded.userId
        }
      });
    }

    // ثبت در Audit Log
    await prisma.auditLog.create({
      data: {
        adminUserId: decoded.userId,
        action: existingCommission ? 'UPDATE_COMMISSION' : 'CREATE_COMMISSION',
        table: 'commissions',
        recordId: commission.id,
        oldValues: existingCommission ? existingCommission : null,
        newValues: commission,
        ipAddress: request.headers.get('x-forwarded-for') || request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    });

    return NextResponse.json({
      success: true,
      message: existingCommission ? 'کارمزد با موفقیت به‌روزرسانی شد' : 'کارمزد جدید با موفقیت ایجاد شد',
      commission
    });
  } catch (error) {
    console.error('خطا در مدیریت کارمزد:', error);
    return NextResponse.json(
      { error: 'خطا در مدیریت کارمزد' },
      { status: 500 }
    );
  }
}

// حذف کارمزد (فقط ادمین)
export async function DELETE(request: NextRequest) {
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
      return NextResponse.json({ error: 'دسترسی غیرمجاز. فقط ادمین‌ها می‌توانند کارمزدها را حذف کنند' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const commissionId = searchParams.get('id');

    if (!commissionId) {
      return NextResponse.json({ error: 'شناسه کارمزد الزامی است' }, { status: 400 });
    }

    // بررسی وجود کارمزد
    const existingCommission = await prisma.commission.findUnique({
      where: { id: commissionId }
    });

    if (!existingCommission) {
      return NextResponse.json({ error: 'کارمزد یافت نشد' }, { status: 404 });
    }

    // حذف کارمزد
    await prisma.commission.delete({
      where: { id: commissionId }
    });

    // ثبت در Audit Log
    await prisma.auditLog.create({
      data: {
        adminUserId: decoded.userId,
        action: 'DELETE_COMMISSION',
        table: 'commissions',
        recordId: commissionId,
        oldValues: existingCommission,
        newValues: null,
        ipAddress: request.headers.get('x-forwarded-for') || request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'کارمزد با موفقیت حذف شد'
    });
  } catch (error) {
    console.error('خطا در حذف کارمزد:', error);
    return NextResponse.json(
      { error: 'خطا در حذف کارمزد' },
      { status: 500 }
    );
  }
}
