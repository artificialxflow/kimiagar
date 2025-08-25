import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    if (!userId) {
      return NextResponse.json({ error: 'شناسه کاربر الزامی است' }, { status: 400 });
    }

    // محاسبه offset برای pagination
    const offset = (page - 1) * limit;

    // ساخت where clause
    const whereClause: any = { userId };
    if (type) whereClause.type = type;
    if (status) whereClause.status = status;

    // دریافت تراکنش‌ها
    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
      include: {
        wallet: {
          select: {
            type: true,
            currency: true
          }
        }
      }
    });

    // شمارش کل تراکنش‌ها
    const totalTransactions = await prisma.transaction.count({
      where: whereClause
    });

    // محاسبه آمار
    const stats = await prisma.transaction.groupBy({
      by: ['type'],
      where: { userId },
      _sum: {
        amount: true
      }
    });

    const totalPages = Math.ceil(totalTransactions / limit);

    return NextResponse.json({
      success: true,
      transactions: transactions.map((t: any) => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        description: t.description,
        status: t.status,
        referenceId: t.referenceId,
        createdAt: t.createdAt,
        wallet: t.wallet
      })),
      pagination: {
        page,
        limit,
        total: totalTransactions,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      stats: stats.reduce((acc: Record<string, number>, stat: any) => {
        acc[stat.type] = Number(stat._sum.amount) || 0;
        return acc;
      }, {} as Record<string, number>)
    });

  } catch (error) {
    console.error('خطا در دریافت تراکنش‌ها:', error);
    return NextResponse.json({ error: 'خطا در دریافت تراکنش‌ها' }, { status: 500 });
  }
} 