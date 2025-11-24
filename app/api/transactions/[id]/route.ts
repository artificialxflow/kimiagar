import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('📝 [Invoice API] ========== دریافت معامله برای فاکتور ==========');
  
  try {
    const { id: transactionId } = await params;

    console.log('📋 [Invoice API] Transaction ID:', transactionId);

    if (!transactionId) {
      console.error('❌ [Invoice API] شناسه معامله الزامی است');
      return NextResponse.json(
        { error: 'شناسه معامله الزامی است' },
        { status: 400 }
      );
    }

    // بررسی اینکه آیا این ID یک orderId است یا transactionId
    // اگر با 'mock_' شروع می‌شود، احتمالاً یک mock ID است
    if (transactionId.startsWith('mock_')) {
      console.warn('⚠️ [Invoice API] Mock transaction ID شناسایی شد');
      return NextResponse.json(
        { error: 'شناسه معامله نامعتبر است. لطفاً از شناسه معتبر استفاده کنید.' },
        { status: 400 }
      );
    }

    // ابتدا سعی کن transaction را پیدا کنی
    let transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        wallet: {
          select: {
            type: true
          }
        }
      }
    });

    console.log('📋 [Invoice API] Transaction یافت شد:', transaction ? 'بله' : 'خیر');

    // اگر transaction پیدا نشد، شاید این یک orderId باشد
    if (!transaction) {
      console.log('📋 [Invoice API] در حال بررسی به عنوان Order ID...');
      const order = await prisma.order.findUnique({
        where: { id: transactionId },
        include: {
          user: {
            select: {
              id: true
            }
          }
        }
      });

      if (order) {
        console.log('✅ [Invoice API] Order یافت شد، در حال ساخت transaction برای فاکتور...');
        // اگر order پیدا شد، یک transaction ساختگی برای فاکتور بساز
        const invoiceTransaction = {
          id: order.id, // استفاده از order.id به عنوان ID
          type: order.type,
          productType: order.productType,
          amount: Number(order.amount),
          price: Number(order.price),
          total: Number(order.totalPrice) - Number(order.commission || 0),
          commission: Number(order.commission || 0),
          finalTotal: Number(order.totalPrice),
          createdAt: order.createdAt,
          status: order.status,
          orderId: order.id
        };

        console.log('✅ [Invoice API] ========== فاکتور آماده شد ==========');
        return NextResponse.json({
          success: true,
          transaction: invoiceTransaction
        });
      }

      console.error('❌ [Invoice API] نه transaction و نه order یافت نشد');
      return NextResponse.json(
        { error: 'معامله یا سفارش یافت نشد' },
        { status: 404 }
      );
    }

    // اگر transaction پیدا شد، اطلاعات سفارش را بگیر
    let order = null;
    if (transaction.referenceId) {
      console.log('📋 [Invoice API] در حال دریافت Order با ID:', transaction.referenceId);
      order = await prisma.order.findUnique({
        where: { id: transaction.referenceId }
      });
      console.log('📋 [Invoice API] Order یافت شد:', order ? 'بله' : 'خیر');
    }

    // تبدیل به فرمت مورد نیاز فاکتور
    const invoiceTransaction = {
      id: transaction.id,
      type: transaction.type,
      productType: order?.productType || 'GOLD_18K',
      amount: order ? Number(order.amount) : Number(transaction.amount || 0),
      price: order ? Number(order.price) : 2500000,
      total: order ? Number(order.totalPrice) - Number(order.commission || 0) : Number(transaction.amount || 0) * 2500000,
      commission: order ? Number(order.commission || 0) : 0,
      finalTotal: order ? Number(order.totalPrice) : Number(transaction.amount || 0) * 2500000,
      createdAt: transaction.createdAt,
      status: transaction.status,
      orderId: order?.id || transaction.referenceId
    };

    console.log('✅ [Invoice API] ========== فاکتور آماده شد ==========');
    return NextResponse.json({
      success: true,
      transaction: invoiceTransaction
    });

  } catch (error: any) {
    console.error('❌ [Invoice API] ========== خطا در دریافت معامله ==========');
    console.error('❌ [Invoice API] خطا:', error);
    console.error('📋 [Invoice API] نوع خطا:', error?.constructor?.name || 'Unknown');
    console.error('📋 [Invoice API] پیام خطا:', error?.message || 'بدون پیام');
    console.error('📋 [Invoice API] Stack:', error?.stack || 'بدون stack');

    return NextResponse.json(
      { 
        error: 'خطا در دریافت اطلاعات معامله',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
      { status: 500 }
    );
  }
}
