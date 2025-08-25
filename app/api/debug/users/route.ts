import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // دریافت تمام کاربران
    const users = await prisma.user.findMany({
      include: {
        wallets: true,
        transactions: {
          take: 5,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    return NextResponse.json({
      success: true,
      count: users.length,
      users: users.map((user: any) => ({
        id: user.id,
        phoneNumber: user.phoneNumber,
        nationalId: user.nationalId,
        bankAccount: user.bankAccount,
        postalCode: user.postalCode,
        firstName: user.firstName,
        lastName: user.lastName,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        wallets: user.wallets,
        recentTransactions: user.transactions
      }))
    });

  } catch (error) {
    console.error('خطا در دریافت کاربران:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت اطلاعات کاربران' },
      { status: 500 }
    );
  }
} 