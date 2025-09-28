import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: transactionId } = await params;

    if (!transactionId) {
      return NextResponse.json(
        { error: 'شناسه معامله الزامی است' },
        { status: 400 }
      );
    }

    // در development mode از mock data استفاده کن
    if (process.env.NODE_ENV === 'development') {
      const mockTransaction = {
        id: transactionId,
        type: 'BUY',
        productType: 'GOLD_18K',
        amount: 2.5,
        price: 2500000,
        total: 6250000,
        commission: 62500,
        finalTotal: 6312500,
        createdAt: new Date(),
        status: 'COMPLETED'
      };

      return NextResponse.json({
        success: true,
        transaction: mockTransaction
      });
    }

    // دریافت معامله از دیتابیس
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId }
    });

    if (!transaction) {
      return NextResponse.json(
        { error: 'معامله یافت نشد' },
        { status: 404 }
      );
    }

    // تبدیل به فرمت مورد نیاز فاکتور
    const invoiceTransaction = {
      id: transaction.id,
      type: transaction.type,
      productType: 'GOLD_18K', // Default value since order relation doesn't exist
      amount: Number(transaction.amount || 0),
      price: 2500000, // Default price
      total: Number(transaction.amount || 0) * 2500000,
      commission: 0,
      finalTotal: Number(transaction.amount || 0) * 2500000,
      createdAt: transaction.createdAt,
      status: transaction.status
    };

    return NextResponse.json({
      success: true,
      transaction: invoiceTransaction
    });

  } catch (error) {
    console.error('خطا در دریافت معامله:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت اطلاعات معامله' },
      { status: 500 }
    );
  }
}
