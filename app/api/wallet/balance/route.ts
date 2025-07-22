import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'شناسه کاربر الزامی است' },
        { status: 400 }
      );
    }

    // دریافت کیف پول‌های کاربر
    const wallets = await prisma.wallet.findMany({
      where: { userId },
      select: {
        id: true,
        type: true,
        balance: true,
        currency: true,
        createdAt: true
      }
    });

    // دریافت آخرین تراکنش‌ها
    const recentTransactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        type: true,
        amount: true,
        description: true,
        status: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      success: true,
      wallets,
      recentTransactions
    });

  } catch (error) {
    console.error('خطا در دریافت موجودی:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت اطلاعات کیف پول' },
      { status: 500 }
    );
  }
} 