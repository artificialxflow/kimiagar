import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { verifyToken } from '@/app/lib/jwt';

// دریافت تنظیمات کارمزد
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'توکن احراز هویت مورد نیاز است' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'توکن نامعتبر است' }, { status: 401 });
    }

    // بررسی اینکه کاربر ادمین است یا نه
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, isAdmin: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'کاربر یافت نشد' }, { status: 404 });
    }

    // دریافت تنظیمات کارمزد
    const commissions = await prisma.commission.findMany({
      where: { isActive: true },
      orderBy: { productType: 'asc' }
    });

    return NextResponse.json({ commissions });
  } catch (error) {
    console.error('خطا در دریافت تنظیمات کارمزد:', error);
    return NextResponse.json({ error: 'خطا در دریافت تنظیمات کارمزد' }, { status: 500 });
  }
}

// به‌روزرسانی تنظیمات کارمزد (فقط ادمین)
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'توکن احراز هویت مورد نیاز است' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'توکن نامعتبر است' }, { status: 401 });
    }

    // بررسی اینکه کاربر ادمین است یا نه
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, isAdmin: true }
    });

    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });
    }

    const body = await request.json();
    const { productType, buyRate, sellRate, minAmount, maxAmount } = body;

    if (!productType || buyRate === undefined || sellRate === undefined) {
      return NextResponse.json({ error: 'تمام فیلدها الزامی هستند' }, { status: 400 });
    }

    // به‌روزرسانی یا ایجاد تنظیمات کارمزد
    const commission = await prisma.commission.upsert({
      where: { productType },
      update: {
        buyRate: parseFloat(buyRate),
        sellRate: parseFloat(sellRate),
        minAmount: minAmount ? parseFloat(minAmount) : 0,
        maxAmount: maxAmount ? parseFloat(maxAmount) : 999999999,
        updatedAt: new Date()
      },
      create: {
        productType,
        buyRate: parseFloat(buyRate),
        sellRate: parseFloat(sellRate),
        minAmount: minAmount ? parseFloat(minAmount) : 0,
        maxAmount: maxAmount ? parseFloat(maxAmount) : 999999999,
        createdBy: user.id
      }
    });

    // ایجاد اعلان برای کاربران
    await prisma.notification.createMany({
      data: {
        type: 'SYSTEM',
        title: 'تغییر نرخ کارمزد',
        message: `نرخ کارمزد ${productType} به‌روزرسانی شد. نرخ خرید: ${buyRate}%، نرخ فروش: ${sellRate}%`,
        isRead: false,
        isSent: false
      }
    });

    return NextResponse.json({ 
      message: 'تنظیمات کارمزد با موفقیت به‌روزرسانی شد',
      commission 
    });
  } catch (error) {
    console.error('خطا در به‌روزرسانی تنظیمات کارمزد:', error);
    return NextResponse.json({ error: 'خطا در به‌روزرسانی تنظیمات کارمزد' }, { status: 500 });
  }
}
