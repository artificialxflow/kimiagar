import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// دریافت تمام نرخ‌های کارمزد فعال
export async function GET() {
  try {
    const commissions = await prisma.commission.findMany({
      where: { isActive: true },
      orderBy: { updatedAt: 'desc' }
    });

    // اگر کارمزدها وجود ندارند، کارمزدهای پیش‌فرض ایجاد کن
    if (commissions.length === 0) {
      const defaultCommissions = [
        {
          productType: 'GOLD_18K' as const,
          buyRate: 0.01, // 1%
          sellRate: 0.01, // 1%
          minAmount: 100000, // 100 هزار تومان
          maxAmount: 1000000000, // 1 میلیارد تومان
          isActive: true
        },
        {
          productType: 'COIN_BAHAR' as const,
          buyRate: 0.01, // 1%
          sellRate: 0.01, // 1%
          minAmount: 1000000, // 1 میلیون تومان
          maxAmount: 1000000000, // 1 میلیارد تومان
          isActive: true
        },
        {
          productType: 'COIN_NIM' as const,
          buyRate: 0.01, // 1%
          sellRate: 0.01, // 1%
          minAmount: 500000, // 500 هزار تومان
          maxAmount: 1000000000, // 1 میلیارد تومان
          isActive: true
        },
        {
          productType: 'COIN_ROBE' as const,
          buyRate: 0.01, // 1%
          sellRate: 0.01, // 1%
          minAmount: 250000, // 250 هزار تومان
          maxAmount: 1000000000, // 1 میلیارد تومان
          isActive: true
        },
        {
          productType: 'COIN_BAHAR_86' as const,
          buyRate: 0.01, // 1%
          sellRate: 0.01, // 1%
          minAmount: 1000000, // 1 میلیون تومان
          maxAmount: 1000000000, // 1 میلیارد تومان
          isActive: true
        },
        {
          productType: 'COIN_NIM_86' as const,
          buyRate: 0.01, // 1%
          sellRate: 0.01, // 1%
          minAmount: 500000, // 500 هزار تومان
          maxAmount: 1000000000, // 1 میلیارد تومان
          isActive: true
        },
        {
          productType: 'COIN_ROBE_86' as const,
          buyRate: 0.01, // 1%
          sellRate: 0.01, // 1%
          minAmount: 250000, // 250 هزار تومان
          maxAmount: 1000000000, // 1 میلیارد تومان
          isActive: true
        }
      ];

      await prisma.commission.createMany({
        data: defaultCommissions
      });

      // دریافت کارمزدهای ایجاد شده
      const newCommissions = await prisma.commission.findMany({
        where: { isActive: true },
        orderBy: { updatedAt: 'desc' }
      });

      return NextResponse.json({
        success: true,
        commissions: newCommissions
      });
    }

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

// ایجاد یا به‌روزرسانی نرخ کارمزد
export async function POST(request: NextRequest) {
  try {
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
      where: { productType, isActive: true }
    });

    if (existingCommission) {
      // به‌روزرسانی کارمزد موجود
      const updatedCommission = await prisma.commission.update({
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

      return NextResponse.json({
        success: true,
        commission: updatedCommission,
        message: 'نرخ کارمزد با موفقیت به‌روزرسانی شد'
      });
    } else {
      // ایجاد کارمزد جدید
      const newCommission = await prisma.commission.create({
        data: {
          productType,
          buyRate,
          sellRate,
          minAmount: minAmount || 100000,
          maxAmount: maxAmount || 1000000000,
          isActive
        }
      });

      return NextResponse.json({
        success: true,
        commission: newCommission,
        message: 'نرخ کارمزد جدید با موفقیت ایجاد شد'
      });
    }

  } catch (error) {
    console.error('خطا در به‌روزرسانی کارمزد:', error);
    return NextResponse.json(
      { error: 'خطا در به‌روزرسانی کارمزد' },
      { status: 500 }
    );
  }
}

// تغییر وضعیت فعال/غیرفعال کارمزد
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, isActive } = body;

    if (!id || isActive === undefined) {
      return NextResponse.json(
        { error: 'شناسه و وضعیت فعال الزامی هستند' },
        { status: 400 }
      );
    }

    const updatedCommission = await prisma.commission.update({
      where: { id },
      data: { isActive, updatedAt: new Date() }
    });

    return NextResponse.json({
      success: true,
      commission: updatedCommission,
      message: `کارمزد ${isActive ? 'فعال' : 'غیرفعال'} شد`
    });

  } catch (error) {
    console.error('خطا در تغییر وضعیت کارمزد:', error);
    return NextResponse.json(
      { error: 'خطا در تغییر وضعیت کارمزد' },
      { status: 500 }
    );
  }
}

// حذف کارمزد (soft delete)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'شناسه کارمزد الزامی است' },
        { status: 400 }
      );
    }

    // به جای حذف، غیرفعال کن
    const updatedCommission = await prisma.commission.update({
      where: { id },
      data: { isActive: false, updatedAt: new Date() }
    });

    return NextResponse.json({
      success: true,
      message: 'کارمزد با موفقیت غیرفعال شد'
    });

  } catch (error) {
    console.error('خطا در حذف کارمزد:', error);
    return NextResponse.json(
      { error: 'خطا در حذف کارمزد' },
      { status: 500 }
    );
  }
}
