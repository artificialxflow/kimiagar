import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { verifyToken } from '@/app/lib/jwt';

// به‌روزرسانی وضعیت سفارش
export async function PATCH(request: NextRequest) {
  console.log('📝 [Admin Order Status] ========== به‌روزرسانی وضعیت سفارش ==========');
  console.log('📝 [Admin Order Status] Time:', new Date().toISOString());

  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      console.error('❌ [Admin Order Status] توکن احراز هویت یافت نشد');
      return NextResponse.json({ error: 'توکن احراز هویت یافت نشد' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      console.error('❌ [Admin Order Status] توکن نامعتبر است');
      return NextResponse.json({ error: 'توکن نامعتبر است' }, { status: 401 });
    }

    // بررسی دسترسی ادمین
    const adminUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, isAdmin: true, username: true }
    });

    if (!adminUser || !adminUser.isAdmin) {
      console.error('❌ [Admin Order Status] دسترسی غیرمجاز - کاربر ادمین نیست');
      return NextResponse.json(
        { error: 'دسترسی غیرمجاز. فقط ادمین‌ها می‌توانند وضعیت سفارش را تغییر دهند' },
        { status: 403 }
      );
    }

    console.log('✅ [Admin Order Status] ادمین تایید شد:', adminUser.username);

    const body = await request.json();
    const { orderId, status, statusReason } = body;

    if (!orderId || !status) {
      console.error('❌ [Admin Order Status] شناسه سفارش یا وضعیت جدید الزامی است');
      return NextResponse.json(
        { error: 'شناسه سفارش و وضعیت جدید الزامی است' },
        { status: 400 }
      );
    }

    console.log('📋 [Admin Order Status] OrderId:', orderId, 'New Status:', status);

    // بررسی وجود سفارش
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!existingOrder) {
      console.error('❌ [Admin Order Status] سفارش یافت نشد');
      return NextResponse.json(
        { error: 'سفارش یافت نشد' },
        { status: 404 }
      );
    }

    console.log('✅ [Admin Order Status] سفارش یافت شد:', existingOrder.id);
    console.log('📋 [Admin Order Status] نوع سفارش:', existingOrder.type);
    console.log('📋 [Admin Order Status] وضعیت فعلی:', existingOrder.status);

    // بررسی اعتبار وضعیت جدید
    const validStatuses = [
      'PENDING',
      'CONFIRMED',
      'PROCESSING',
      'COMPLETED',
      'CANCELLED',
      'FAILED',
      'EXPIRED',
      'REJECTED',
      'REJECTED_PRICE_CHANGE',
    ];
    if (!validStatuses.includes(status)) {
      console.error('❌ [Admin Order Status] وضعیت نامعتبر:', status);
      return NextResponse.json(
        { error: 'وضعیت نامعتبر است' },
        { status: 400 }
      );
    }

    const reasonRequiredStatuses = ['CANCELLED', 'FAILED', 'REJECTED', 'REJECTED_PRICE_CHANGE'];
    if (reasonRequiredStatuses.includes(status) && !statusReason) {
      return NextResponse.json(
        { error: 'لطفاً دلیل این تغییر وضعیت را وارد کنید' },
        { status: 400 }
      );
    }

    // بررسی اینکه سفارش قبلاً COMPLETED نشده باشد (جلوگیری از تکرار)
    if (status === 'COMPLETED' && existingOrder.status === 'COMPLETED') {
      console.warn('⚠️ [Admin Order Status] سفارش قبلاً COMPLETED شده است');
      return NextResponse.json(
        { error: 'این سفارش قبلاً تکمیل شده است' },
        { status: 400 }
      );
    }

    // اگر status به COMPLETED تغییر می‌کند و سفارش قبلاً COMPLETED نبوده، تراکنش‌ها را انجام بده
    if (status === 'COMPLETED' && existingOrder.status !== 'COMPLETED') {
      console.log('🔄 [Admin Order Status] در حال پردازش تراکنش‌ها...');

      // بررسی نوع سفارش و انجام تراکنش‌ها
      if (existingOrder.type === 'BUY') {
        // سفارش خرید: کسر از ریالی، اضافه به طلایی
        console.log('💰 [Admin Order Status] پردازش سفارش خرید...');

        // بررسی موجودی ریالی
        const rialWallet = await prisma.wallet.findFirst({
          where: {
            userId: existingOrder.userId,
            type: 'RIAL'
          }
        });

        if (!rialWallet) {
          console.error('❌ [Admin Order Status] کیف پول ریالی کاربر یافت نشد');
          return NextResponse.json(
            { error: 'کیف پول ریالی کاربر یافت نشد' },
            { status: 404 }
          );
        }

        const currentBalance = Number(rialWallet.balance);
        const requiredAmount = Number(existingOrder.totalPrice);

        console.log('📊 [Admin Order Status] موجودی فعلی ریالی:', currentBalance);
        console.log('📊 [Admin Order Status] مبلغ مورد نیاز:', requiredAmount);

        if (currentBalance < requiredAmount) {
          console.error('❌ [Admin Order Status] موجودی کافی نیست');
          return NextResponse.json(
            { 
              error: 'موجودی کافی نیست',
              details: {
                currentBalance,
                requiredAmount,
                shortage: requiredAmount - currentBalance
              }
            },
            { status: 400 }
          );
        }

        // انجام تراکنش‌ها با Prisma Transaction
        await prisma.$transaction(async (tx: any) => {
          // کسر از کیف پول ریالی
          await tx.wallet.update({
            where: { id: rialWallet.id },
            data: {
              balance: {
                decrement: requiredAmount
              }
            }
          });

          // اضافه کردن به کیف پول طلایی
          const goldWallet = await tx.wallet.findFirst({
            where: {
              userId: existingOrder.userId,
              type: 'GOLD'
            }
          });

          if (!goldWallet) {
            // ایجاد کیف پول طلایی اگر وجود نداشت
            const newGoldWallet = await tx.wallet.create({
              data: {
                userId: existingOrder.userId,
                type: 'GOLD',
                balance: 0,
                currency: 'GOLD',
                isActive: true
              }
            });
            await tx.wallet.update({
              where: { id: newGoldWallet.id },
              data: {
                balance: {
                  increment: Number(existingOrder.amount)
                }
              }
            });
          } else {
            await tx.wallet.update({
              where: { id: goldWallet.id },
              data: {
                balance: {
                  increment: Number(existingOrder.amount)
                }
              }
            });
          }

          // ثبت تراکنش کسر از کیف پول ریالی
          await tx.transaction.create({
            data: {
              userId: existingOrder.userId,
              walletId: rialWallet.id,
              type: 'ORDER_PAYMENT',
              amount: requiredAmount,
              description: `خرید ${existingOrder.amount} ${existingOrder.productType === 'GOLD_18K' ? 'گرم' : 'عدد'} ${existingOrder.productType} (تایید شده توسط ادمین)`,
              status: 'COMPLETED',
              referenceId: orderId,
              metadata: {
                orderId: orderId,
                orderType: 'BUY',
                adminId: adminUser.id,
                adminUsername: adminUser.username,
                approvedAt: new Date().toISOString()
              }
            }
          });

          // ثبت تراکنش اضافه به کیف پول طلایی
          const finalGoldWallet = await tx.wallet.findFirst({
            where: {
              userId: existingOrder.userId,
              type: 'GOLD'
            }
          });

          if (finalGoldWallet) {
            await tx.transaction.create({
              data: {
                userId: existingOrder.userId,
                walletId: finalGoldWallet.id,
                type: 'DEPOSIT',
                amount: Number(existingOrder.amount),
                description: `خرید ${existingOrder.amount} ${existingOrder.productType === 'GOLD_18K' ? 'گرم' : 'عدد'} ${existingOrder.productType} (تایید شده توسط ادمین)`,
                status: 'COMPLETED',
                referenceId: orderId,
                metadata: {
                  orderId: orderId,
                  orderType: 'BUY',
                  adminId: adminUser.id,
                  adminUsername: adminUser.username,
                  approvedAt: new Date().toISOString()
                }
              }
            });
          }
        });

        console.log('✅ [Admin Order Status] تراکنش‌های سفارش خرید با موفقیت انجام شد');

      } else if (existingOrder.type === 'SELL') {
        // سفارش فروش: کسر از طلایی، اضافه به ریالی
        console.log('💰 [Admin Order Status] پردازش سفارش فروش...');

        // بررسی موجودی طلایی
        const goldWallet = await prisma.wallet.findFirst({
          where: {
            userId: existingOrder.userId,
            type: 'GOLD'
          }
        });

        if (!goldWallet) {
          console.error('❌ [Admin Order Status] کیف پول طلایی کاربر یافت نشد');
          return NextResponse.json(
            { error: 'کیف پول طلایی کاربر یافت نشد' },
            { status: 404 }
          );
        }

        const currentBalance = Number(goldWallet.balance);
        const requiredAmount = Number(existingOrder.amount);

        console.log('📊 [Admin Order Status] موجودی فعلی طلایی:', currentBalance);
        console.log('📊 [Admin Order Status] مقدار مورد نیاز:', requiredAmount);

        if (currentBalance < requiredAmount) {
          console.error('❌ [Admin Order Status] موجودی طلایی کافی نیست');
          return NextResponse.json(
            { 
              error: 'موجودی طلایی کافی نیست',
              details: {
                currentBalance,
                requiredAmount,
                shortage: requiredAmount - currentBalance
              }
            },
            { status: 400 }
          );
        }

        // محاسبه مبلغ نهایی (بعد از کسر کارمزد)
        const finalPrice = Number(existingOrder.totalPrice) - Number(existingOrder.commission);

        // انجام تراکنش‌ها با Prisma Transaction
        await prisma.$transaction(async (tx: any) => {
          // کسر از کیف پول طلایی
          await tx.wallet.update({
            where: { id: goldWallet.id },
            data: {
              balance: {
                decrement: requiredAmount
              }
            }
          });

          // اضافه کردن به کیف پول ریالی
          const rialWallet = await tx.wallet.findFirst({
            where: {
              userId: existingOrder.userId,
              type: 'RIAL'
            }
          });

          if (!rialWallet) {
            // ایجاد کیف پول ریالی اگر وجود نداشت
            const newRialWallet = await tx.wallet.create({
              data: {
                userId: existingOrder.userId,
                type: 'RIAL',
                balance: 0,
                currency: 'IRR',
                isActive: true
              }
            });
            await tx.wallet.update({
              where: { id: newRialWallet.id },
              data: {
                balance: {
                  increment: finalPrice
                }
              }
            });
          } else {
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
              userId: existingOrder.userId,
              walletId: goldWallet.id,
              type: 'WITHDRAW',
              amount: requiredAmount,
              description: `فروش ${existingOrder.amount} ${existingOrder.productType === 'GOLD_18K' ? 'گرم' : 'عدد'} ${existingOrder.productType} (تایید شده توسط ادمین)`,
              status: 'COMPLETED',
              referenceId: orderId,
              metadata: {
                orderId: orderId,
                orderType: 'SELL',
                adminId: adminUser.id,
                adminUsername: adminUser.username,
                approvedAt: new Date().toISOString()
              }
            }
          });

          // ثبت تراکنش اضافه به کیف پول ریالی
          const finalRialWallet = await tx.wallet.findFirst({
            where: {
              userId: existingOrder.userId,
              type: 'RIAL'
            }
          });

          if (finalRialWallet) {
            await tx.transaction.create({
              data: {
                userId: existingOrder.userId,
                walletId: finalRialWallet.id,
                type: 'DEPOSIT',
                amount: finalPrice,
                description: `فروش ${existingOrder.amount} ${existingOrder.productType === 'GOLD_18K' ? 'گرم' : 'عدد'} ${existingOrder.productType} (تایید شده توسط ادمین)`,
                status: 'COMPLETED',
                referenceId: orderId,
                metadata: {
                  orderId: orderId,
                  orderType: 'SELL',
                  adminId: adminUser.id,
                  adminUsername: adminUser.username,
                  approvedAt: new Date().toISOString()
                }
              }
            });
          }
        });

        console.log('✅ [Admin Order Status] تراکنش‌های سفارش فروش با موفقیت انجام شد');
      }
    }

    // به‌روزرسانی سفارش
    const updateData: any = { status };

    if (statusReason !== undefined) {
      updateData.statusReason = statusReason || null;
    } else if (!reasonRequiredStatuses.includes(status)) {
      updateData.statusReason = null;
    }

    // تنظیم زمان‌های مربوط به وضعیت
    if (status === 'PROCESSING' && !existingOrder.processedAt) {
      updateData.processedAt = new Date();
    } else if (status === 'COMPLETED' && !existingOrder.completedAt) {
      updateData.completedAt = new Date();
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: { user: true },
    });

    console.log('✅ [Admin Order Status] سفارش به‌روزرسانی شد');

    // ایجاد اعلان برای کاربر
    const statusMessages: { [key: string]: string } = {
      'CONFIRMED': 'سفارش شما تایید شده و در حال پردازش است.',
      'PROCESSING': 'سفارش شما در حال پردازش است.',
      'COMPLETED': 'سفارش شما با موفقیت تکمیل شد.',
      'CANCELLED': statusReason || 'سفارش شما لغو شده است.',
      'FAILED': statusReason || 'سفارش شما ناموفق بوده است.',
      'EXPIRED': 'به دلیل پایان مهلت زمانی، سفارش شما منقضی شد.',
      'REJECTED': statusReason || 'سفارش شما رد شده است.',
      'REJECTED_PRICE_CHANGE': statusReason || 'به دلیل تغییر قیمت، سفارش شما بسته شد.',
    };

    const message = statusMessages[status] || `وضعیت سفارش شما به ${status} تغییر یافت.`;

    await prisma.notification.create({
      data: {
        userId: existingOrder.userId,
        type: 'ORDER',
        title: 'وضعیت سفارش تغییر یافت',
        message,
        metadata: {
          orderId: orderId,
          oldStatus: existingOrder.status,
          newStatus: status,
          timestamp: new Date().toISOString(),
          reason: statusReason || null,
        },
      },
    });

    console.log('✅ [Admin Order Status] ========== به‌روزرسانی موفق ==========');

    return NextResponse.json({
      success: true,
      message: 'وضعیت سفارش با موفقیت به‌روزرسانی شد',
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error('❌ [Admin Order Status] ========== خطا در به‌روزرسانی وضعیت سفارش ==========');
    console.error('❌ [Admin Order Status] خطا:', error);
    console.error('📋 [Admin Order Status] نوع خطا:', error?.constructor?.name || 'Unknown');
    console.error('📋 [Admin Order Status] پیام خطا:', error?.message || 'بدون پیام');
    console.error('📋 [Admin Order Status] Stack:', error?.stack || 'بدون stack');

    return NextResponse.json(
      { 
        error: 'خطا در به‌روزرسانی وضعیت سفارش',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
      { status: 500 }
    );
  }
}
