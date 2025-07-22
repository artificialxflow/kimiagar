import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, productType, amount, isAutomatic } = body;

    if (!userId || !productType || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'اطلاعات ناقص یا نامعتبر' },
        { status: 400 }
      );
    }

    // دریافت قیمت محصول
    const price = await prisma.price.findFirst({
      where: {
        productType,
        isActive: true
      }
    });

    if (!price) {
      return NextResponse.json(
        { error: 'قیمت محصول یافت نشد' },
        { status: 404 }
      );
    }

    // محاسبه قیمت‌ها
    const unitPrice = Number(price.sellPrice);
    const totalPrice = amount * unitPrice;
    const commission = totalPrice * 0.01; // 1% کمیسیون
    const finalPrice = totalPrice - commission;

    // بررسی موجودی کیف پول طلایی
    const goldWallet = await prisma.wallet.findFirst({
      where: {
        userId,
        type: 'GOLD'
      }
    });

    if (!goldWallet || Number(goldWallet.balance) < amount) {
      return NextResponse.json(
        { error: 'موجودی طلا کافی نیست' },
        { status: 400 }
      );
    }

    // ایجاد سفارش
    const order = await prisma.order.create({
      data: {
        userId,
        type: 'SELL',
        productType,
        amount,
        price: unitPrice,
        totalPrice,
        commission,
        status: isAutomatic ? 'COMPLETED' : 'PENDING',
        isAutomatic
      }
    });

    if (isAutomatic) {
      // اگر اتوماتیک است، تراکنش‌ها را انجام بده
      await prisma.$transaction(async (tx) => {
        // کسر از کیف پول طلایی
        await tx.wallet.update({
          where: { id: goldWallet.id },
          data: {
            balance: {
              decrement: amount
            }
          }
        });

        // اضافه کردن به کیف پول ریالی
        const rialWallet = await tx.wallet.findFirst({
          where: {
            userId,
            type: 'RIAL'
          }
        });

        if (rialWallet) {
          await tx.wallet.update({
            where: { id: rialWallet.id },
            data: {
              balance: {
                increment: finalPrice
              }
            }
          });
        }

        // ثبت تراکنش کسر از کیف پول طلایی
        await tx.transaction.create({
          data: {
            userId,
            walletId: goldWallet.id,
            type: 'WITHDRAW',
            amount,
            description: `فروش ${amount} ${productType === 'GOLD_18K' ? 'گرم' : 'عدد'} ${productType}`,
            status: 'COMPLETED',
            referenceId: order.id
          }
        });

        // ثبت تراکنش اضافه به کیف پول ریالی
        if (rialWallet) {
          await tx.transaction.create({
            data: {
              userId,
              walletId: rialWallet.id,
              type: 'DEPOSIT',
              amount: finalPrice,
              description: `فروش ${amount} ${productType === 'GOLD_18K' ? 'گرم' : 'عدد'} ${productType}`,
              status: 'COMPLETED',
              referenceId: order.id
            }
          });
        }
      });
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        productType: order.productType,
        amount: order.amount,
        totalPrice: order.totalPrice,
        commission: order.commission,
        finalPrice,
        status: order.status,
        isAutomatic: order.isAutomatic,
        createdAt: order.createdAt
      }
    });

  } catch (error) {
    console.error('خطا در ثبت سفارش فروش:', error);
    return NextResponse.json(
      { error: 'خطا در ثبت سفارش فروش' },
      { status: 500 }
    );
  }
} 