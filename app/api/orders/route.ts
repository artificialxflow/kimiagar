import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { verifyToken } from '@/app/lib/jwt';

// دریافت سفارش‌های کاربر
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
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const productType = searchParams.get('productType');

    const skip = (page - 1) * limit;

    // فیلترهای جستجو
    const where: any = {
      userId: decoded.userId,
    };

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    if (productType) {
      where.productType = productType;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
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
        },
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('خطا در دریافت سفارش‌ها:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت سفارش‌ها' },
      { status: 500 }
    );
  }
}

// ایجاد سفارش جدید
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
    const { type, productType, amount, price, notes } = body;

    // اعتبارسنجی ورودی‌ها
    if (!type || !productType || !amount || !price) {
      return NextResponse.json(
        { error: 'تمام فیلدهای الزامی باید پر شوند' },
        { status: 400 }
      );
    }

    if (amount <= 0 || price <= 0) {
      return NextResponse.json(
        { error: 'مقدار و قیمت باید بزرگتر از صفر باشد' },
        { status: 400 }
      );
    }

    // محاسبه کارمزد از جدول commissions
    const commissionData = await prisma.commission.findFirst({
      where: {
        productType,
        isActive: true,
        minAmount: { lte: parseFloat(amount.toString()) * parseFloat(price.toString()) },
        maxAmount: { gte: parseFloat(amount.toString()) * parseFloat(price.toString()) },
      },
    });

    if (!commissionData) {
      return NextResponse.json(
        { error: 'نرخ کارمزد برای این محصول یافت نشد' },
        { status: 400 }
      );
    }

    const commissionRate = type === 'BUY' ? commissionData.buyRate : commissionData.sellRate;
    const commission = (parseFloat(amount.toString()) * parseFloat(price.toString())) * commissionRate;
    const totalPrice = (parseFloat(amount.toString()) * parseFloat(price.toString())) + commission;

    const order = await prisma.order.create({
      data: {
        userId: decoded.userId,
        type,
        productType,
        amount,
        price,
        totalPrice,
        commission,
        commissionRate,
        notes,
        status: 'PENDING',
      },
    });

    // ایجاد اعلان برای کاربر
    await prisma.notification.create({
      data: {
        userId: decoded.userId,
        type: 'ORDER',
        title: 'سفارش جدید ثبت شد',
        message: `سفارش ${type === 'BUY' ? 'خرید' : 'فروش'} ${productType} با موفقیت ثبت شد.`,
        metadata: {
          orderId: order.id,
          orderType: type,
          productType,
          amount: amount.toString(),
          totalPrice: totalPrice.toString(),
        },
      },
    });

    return NextResponse.json({
      message: 'سفارش با موفقیت ثبت شد',
      order,
    });
  } catch (error) {
    console.error('خطا در ایجاد سفارش:', error);
    return NextResponse.json(
      { error: 'خطا در ایجاد سفارش' },
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
    const { orderId, notes, status } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: 'شناسه سفارش الزامی است' },
        { status: 400 }
      );
    }

    // بررسی مالکیت سفارش
    const existingOrder = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: decoded.userId,
      },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'سفارش یافت نشد' },
        { status: 404 }
      );
    }

    // فقط کاربران می‌توانند یادداشت‌ها را تغییر دهند
    const updateData: any = {};
    if (notes !== undefined) {
      updateData.notes = notes;
    }

    // فقط ادمین‌ها می‌توانند وضعیت را تغییر دهند
    if (status && decoded.role === 'ADMIN') {
      updateData.status = status;
      if (status === 'COMPLETED') {
        updateData.completedAt = new Date();
      } else if (status === 'PROCESSING') {
        updateData.processedAt = new Date();
      }
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    });

    return NextResponse.json({
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
