import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

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

    // دریافت نرخ کارمزد از دیتابیس
    const commissionRate = await prisma.commission.findFirst({
      where: {
        productType,
        isActive: true
      }
    });

    // محاسبه قیمت‌ها
    const unitPrice = Number(price.buyPrice);
    const totalPrice = amount * unitPrice;
    const commissionRateValue = commissionRate ? Number(commissionRate.buyRate) : 0.01; // پیش‌فرض 1%
    const commission = totalPrice * commissionRateValue;
    const finalPrice = totalPrice + commission;

    // بررسی موجودی کیف پول ریالی
    const rialWallet = await prisma.wallet.findFirst({
      where: {
        userId,
        type: 'RIAL'
      }
    });

    if (!rialWallet || Number(rialWallet.balance) < finalPrice) {
      return NextResponse.json(
        { error: 'موجودی کافی نیست' },
        { status: 400 }
      );
    }

    // ایجاد سفارش
    const order = await prisma.order.create({
      data: {
        userId,
        type: 'BUY',
        productType,
        amount,
        price: unitPrice,
        totalPrice,
        commission,
        commissionRate: commissionRateValue,
        status: isAutomatic ? 'COMPLETED' : 'PENDING',
        isAutomatic
      }
    });

    if (isAutomatic) {
      // اگر اتوماتیک است، تراکنش‌ها را انجام بده
      await prisma.$transaction(async (tx: any) => {
        // کسر از کیف پول ریالی
        await tx.wallet.update({
          where: { id: rialWallet.id },
          data: {
            balance: {
              decrement: finalPrice
            }
          }
        });

        // اضافه کردن به کیف پول طلایی
        const goldWallet = await tx.wallet.findFirst({
          where: {
            userId,
            type: 'GOLD'
          }
        });

        if (goldWallet) {
          await tx.wallet.update({
            where: { id: goldWallet.id },
            data: {
              balance: {
                increment: amount
              }
            }
          });
        }

        // ثبت تراکنش کسر از کیف پول ریالی
        await tx.transaction.create({
          data: {
            userId,
            walletId: rialWallet.id,
            type: 'ORDER_PAYMENT',
            amount: finalPrice,
            description: `خرید ${amount} ${productType === 'GOLD_18K' ? 'گرم' : 'عدد'} ${productType}`,
            status: 'COMPLETED',
            referenceId: order.id
          }
        });

        // ثبت تراکنش اضافه به کیف پول طلایی
        if (goldWallet) {
          await tx.transaction.create({
            data: {
              userId,
              walletId: goldWallet.id,
              type: 'DEPOSIT',
              amount,
              description: `خرید ${amount} ${productType === 'GOLD_18K' ? 'گرم' : 'عدد'} ${productType}`,
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
        status: order.status,
        isAutomatic: order.isAutomatic,
        createdAt: order.createdAt
      }
    });

  } catch (error) {
    console.error('خطا در ثبت سفارش خرید:', error);
    return NextResponse.json(
      { error: 'خطا در ثبت سفارش خرید' },
      { status: 500 }
    );
  }
} 