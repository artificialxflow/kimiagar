import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getTradingMode } from '@/app/lib/systemSettings';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, fromWallet, toWallet, amount, description } = body;

    const tradingMode = await getTradingMode();
    if (tradingMode.tradingPaused) {
      return NextResponse.json(
        { 
          error: tradingMode.message || 'مدیر در حال حاضر معاملات را موقتا متوقف کرده است',
          mode: tradingMode
        },
        { status: 423 }
      );
    }

    // اعتبارسنجی ورودی‌ها
    if (!userId || !fromWallet || !toWallet || !amount) {
      return NextResponse.json(
        { error: 'تمام فیلدها الزامی هستند' },
        { status: 400 }
      );
    }

    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      return NextResponse.json(
        { error: 'مبلغ باید عدد مثبت باشد' },
        { status: 400 }
      );
    }

    // بررسی وجود کیف پول‌ها
    const fromWalletData = await prisma.wallet.findUnique({
      where: { id: fromWallet, userId }
    });

    const toWalletData = await prisma.wallet.findUnique({
      where: { id: toWallet, userId }
    });

    if (!fromWalletData || !toWalletData) {
      return NextResponse.json(
        { error: 'کیف پول یافت نشد' },
        { status: 404 }
      );
    }

    // بررسی موجودی کافی
    if (transferAmount > parseFloat(fromWalletData.balance.toString())) {
      return NextResponse.json(
        { error: 'موجودی کافی نیست' },
        { status: 400 }
      );
    }

    // بررسی عدم انتقال به خود
    if (fromWallet === toWallet) {
      return NextResponse.json(
        { error: 'کیف پول مبدا و مقصد نمی‌تواند یکسان باشد' },
        { status: 400 }
      );
    }

    // انجام انتقال در تراکنش دیتابیس
    const result = await prisma.$transaction(async (tx: any) => {
      // کاهش موجودی کیف پول مبدا
      const updatedFromWallet = await tx.wallet.update({
        where: { id: fromWallet },
        data: {
          balance: {
            decrement: transferAmount
          }
        }
      });

      // افزایش موجودی کیف پول مقصد
      const updatedToWallet = await tx.wallet.update({
        where: { id: toWallet },
        data: {
          balance: {
            increment: transferAmount
          }
        }
      });

      // ثبت تراکنش انتقال
      const transaction = await tx.transaction.create({
        data: {
          userId,
          walletId: fromWallet,
          type: 'TRANSFER',
          amount: transferAmount,
          description: description || `انتقال به کیف پول ${toWalletData.type === 'RIAL' ? 'ریالی' : 'طلایی'}`,
          status: 'COMPLETED',
          referenceId: `TRF_${Date.now()}`
        }
      });

      // ثبت تراکنش دریافت
      await tx.transaction.create({
        data: {
          userId,
          walletId: toWallet,
          type: 'TRANSFER',
          amount: transferAmount,
          description: description || `دریافت از کیف پول ${fromWalletData.type === 'RIAL' ? 'ریالی' : 'طلایی'}`,
          status: 'COMPLETED',
          referenceId: `TRF_${Date.now()}_RECV`
        }
      });

      return {
        fromWallet: updatedFromWallet,
        toWallet: updatedToWallet,
        transaction
      };
    });

    return NextResponse.json({
      success: true,
      message: 'انتقال با موفقیت انجام شد',
      data: {
        fromWalletBalance: result.fromWallet.balance,
        toWalletBalance: result.toWallet.balance,
        amount: transferAmount
      }
    });

  } catch (error) {
    console.error('خطا در انجام انتقال:', error);
    return NextResponse.json(
      { error: 'خطا در انجام انتقال' },
      { status: 500 }
    );
  }
} 