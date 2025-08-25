import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transactionId, paymentStatus, referenceId, amount } = body;

    if (!transactionId || !paymentStatus || !referenceId) {
      return NextResponse.json(
        { error: 'اطلاعات ناقص یا نامعتبر' },
        { status: 400 }
      );
    }

    // دریافت تراکنش پرداخت
    const paymentTransaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        type: 'ORDER_PAYMENT'
      }
    });

    if (!paymentTransaction) {
      return NextResponse.json(
        { error: 'تراکنش پرداخت یافت نشد' },
        { status: 404 }
      );
    }

    if (paymentTransaction.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'تراکنش قبلاً پردازش شده' },
        { status: 400 }
      );
    }

    // دریافت اطلاعات سفارش
    const order = await prisma.order.findUnique({
      where: {
        id: paymentTransaction.referenceId || ''
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'سفارش یافت نشد' },
        { status: 404 }
      );
    }

    // به‌روزرسانی وضعیت تراکنش پرداخت
    await prisma.transaction.update({
      where: {
        id: transactionId
      },
      data: {
        status: paymentStatus,
        referenceId,
        updatedAt: new Date()
      }
    });

    if (paymentStatus === 'SUCCESS') {
      // اگر پرداخت موفق بود، سفارش را تکمیل کن
      await prisma.$transaction(async (tx: any) => {
        // به‌روزرسانی وضعیت سفارش
        await tx.order.update({
          where: {
            id: order.id
          },
          data: {
            status: 'COMPLETED',
            completedAt: new Date()
          }
        });

        // کسر از کیف پول ریالی
        const rialWallet = await tx.wallet.findFirst({
          where: {
            userId: paymentTransaction.userId,
            type: 'RIAL'
          }
        });

        if (rialWallet) {
          await tx.wallet.update({
            where: {
              id: rialWallet.id
            },
            data: {
              balance: {
                decrement: paymentTransaction.amount
              }
            }
          });
        }

        // اضافه کردن به کیف پول طلایی
        const goldWallet = await tx.wallet.findFirst({
          where: {
            userId: paymentTransaction.userId,
            type: 'GOLD'
          }
        });

        if (goldWallet) {
          await tx.wallet.update({
            where: {
              id: goldWallet.id
            },
            data: {
              balance: {
                increment: order.amount
              }
            }
          });
        }

        // ثبت تراکنش کسر از کیف پول ریالی
        if (rialWallet) {
          await tx.transaction.create({
            data: {
              userId: paymentTransaction.userId,
              walletId: rialWallet.id,
              type: 'ORDER_PAYMENT',
              amount: paymentTransaction.amount,
              description: `پرداخت سفارش ${order.productType}`,
              status: 'COMPLETED',
              referenceId: order.id
            }
          });
        }

        // ثبت تراکنش اضافه به کیف پول طلایی
        if (goldWallet) {
          await tx.transaction.create({
            data: {
              userId: paymentTransaction.userId,
              walletId: goldWallet.id,
              type: 'DEPOSIT',
              amount: order.amount,
              description: `خرید ${order.amount} ${order.productType}`,
              status: 'COMPLETED',
              referenceId: order.id
            }
          });
        }

        // ارسال SMS اعلان
        try {
          await fetch('/api/sms/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              phone: order.userId, // استفاده از order.userId به جای user.phone
              message: `سفارش شما با موفقیت تکمیل شد. مبلغ ${Number(paymentTransaction.amount).toLocaleString('fa-IR')} تومان از کیف پول شما کسر شد.`
            }),
          });
        } catch (error) {
          console.error('خطا در ارسال SMS:', error);
        }
      });

      return NextResponse.json({
        success: true,
        message: 'پرداخت با موفقیت تایید شد و سفارش تکمیل شد',
        transaction: {
          id: paymentTransaction.id,
          status: 'SUCCESS',
          orderId: order.id
        }
      });
    } else {
      // اگر پرداخت ناموفق بود
      return NextResponse.json({
        success: true,
        message: 'پرداخت ناموفق بود',
        transaction: {
          id: paymentTransaction.id,
          status: 'FAILED',
          orderId: order.id
        }
      });
    }

  } catch (error) {
    console.error('خطا در تایید پرداخت:', error);
    return NextResponse.json(
      { error: 'خطا در تایید پرداخت' },
      { status: 500 }
    );
  }
}
