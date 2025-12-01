import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { verifyToken } from '@/app/lib/jwt';

// تایید یا رد واریزهای در انتظار توسط ادمین (مرحله دوم)
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

    // بررسی دسترسی ادمین
    const adminUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, isAdmin: true, username: true }
    });

    if (!adminUser || !adminUser.isAdmin) {
      return NextResponse.json(
        { error: 'دسترسی غیرمجاز. فقط ادمین‌ها می‌توانند واریزها را تایید کنند' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { transactionId, action, reason } = body as {
      transactionId?: string;
      action?: 'APPROVE' | 'REJECT';
      reason?: string;
    };

    if (!transactionId || !action) {
      return NextResponse.json(
        { error: 'transactionId و action الزامی هستند' },
        { status: 400 }
      );
    }

    // تراکنش باید PENDING و از نوع DEPOSIT باشد
    const existingTx = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { wallet: true }
    });

    if (!existingTx || existingTx.type !== 'DEPOSIT') {
      return NextResponse.json(
        { error: 'تراکنش واریز در حال انتظار یافت نشد' },
        { status: 404 }
      );
    }

    if (existingTx.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'این تراکنش دیگر در وضعیت در انتظار نیست' },
        { status: 400 }
      );
    }

    if (!existingTx.wallet) {
      return NextResponse.json(
        { error: 'کیف پول مربوط به این تراکنش یافت نشد' },
        { status: 404 }
      );
    }

    if (action === 'REJECT' && !reason) {
      return NextResponse.json(
        { error: 'برای رد واریز، وارد کردن دلیل الزامی است' },
        { status: 400 }
      );
    }

    // تایید یا رد در یک تراکنش اتمیک
    const result = await prisma.$transaction(async (tx) => {
      if (action === 'REJECT') {
        const updatedTx = await tx.transaction.update({
          where: { id: existingTx.id },
          data: {
            status: 'FAILED',
            metadata: {
              ...(existingTx.metadata as object | null),
              adminAction: 'REJECT',
              adminId: adminUser.id,
              adminUsername: adminUser.username,
              adminReason: reason || null,
              reviewedAt: new Date().toISOString()
            }
          }
        });

        return { transaction: updatedTx, wallet: existingTx.wallet };
      }

      // APPROVE
      const updatedWallet = await tx.wallet.update({
        where: { id: existingTx.walletId },
        data: {
          balance: {
            increment: existingTx.amount
          }
        }
      });

      const updatedTx = await tx.transaction.update({
        where: { id: existingTx.id },
        data: {
          status: 'COMPLETED',
          metadata: {
            ...(existingTx.metadata as object | null),
            adminAction: 'APPROVE',
            adminId: adminUser.id,
            adminUsername: adminUser.username,
            reviewedAt: new Date().toISOString()
          }
        }
      });

      return { transaction: updatedTx, wallet: updatedWallet };
    });

    return NextResponse.json({
      success: true,
      message: action === 'APPROVE' ? 'واریز با موفقیت تایید شد' : 'واریز رد شد',
      transaction: {
        id: result.transaction.id,
        status: result.transaction.status,
        amount: result.transaction.amount,
        createdAt: result.transaction.createdAt,
        updatedAt: result.transaction.updatedAt
      },
      wallet: {
        id: result.wallet.id,
        balance: result.wallet.balance,
        type: result.wallet.type,
        currency: result.wallet.currency
      }
    });
  } catch (error) {
    console.error('خطا در تایید/رد واریز:', error);
    return NextResponse.json(
      { error: 'خطا در پردازش واریز در انتظار' },
      { status: 500 }
    );
  }
}


