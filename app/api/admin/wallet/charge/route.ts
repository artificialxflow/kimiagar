import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { verifyToken } from '@/app/lib/jwt';

// شارژ دستی موجودی توسط ادمین
export async function POST(request: NextRequest) {
  console.log('📝 [Admin Charge] ========== شروع شارژ دستی موجودی ==========');
  console.log('📝 [Admin Charge] Time:', new Date().toISOString());
  const startTime = Date.now();

  try {
    // بررسی توکن و دسترسی ادمین
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      console.error('❌ [Admin Charge] توکن احراز هویت یافت نشد');
      return NextResponse.json({ error: 'توکن احراز هویت یافت نشد' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      console.error('❌ [Admin Charge] توکن نامعتبر است');
      return NextResponse.json({ error: 'توکن نامعتبر است' }, { status: 401 });
    }

    // بررسی دسترسی ادمین
    const adminUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, isAdmin: true, username: true }
    });

    if (!adminUser || !adminUser.isAdmin) {
      console.error('❌ [Admin Charge] دسترسی غیرمجاز - کاربر ادمین نیست');
      return NextResponse.json(
        { error: 'دسترسی غیرمجاز. فقط ادمین‌ها می‌توانند موجودی را شارژ کنند' },
        { status: 403 }
      );
    }

    console.log('✅ [Admin Charge] ادمین تایید شد:', adminUser.username);

    // خواندن body
    const body = await request.json();
    const { userId, amount, walletType, coinType, description, receiptNumber, adminNotes } = body;

    console.log('📋 [Admin Charge] داده‌های دریافت شده:', {
      userId: userId ? '✓' : '✗',
      amount: amount ? '✓' : '✗',
      walletType: walletType || 'N/A',
      coinType: coinType || 'N/A',
      description: description ? '✓' : '✗',
      receiptNumber: receiptNumber ? '✓' : '✗'
    });

    // Validation ورودی‌ها
    if (!userId) {
      console.error('❌ [Admin Charge] شناسه کاربر الزامی است');
      return NextResponse.json(
        { error: 'شناسه کاربر الزامی است' },
        { status: 400 }
      );
    }

    if (!amount || amount <= 0) {
      console.error('❌ [Admin Charge] مبلغ باید مثبت باشد');
      return NextResponse.json(
        { error: 'مبلغ باید مثبت باشد' },
        { status: 400 }
      );
    }

    if (!walletType || !['RIAL', 'GOLD', 'COIN'].includes(walletType)) {
      console.error('❌ [Admin Charge] نوع کیف پول نامعتبر');
      return NextResponse.json(
        { error: 'نوع کیف پول باید RIAL، GOLD یا COIN باشد' },
        { status: 400 }
      );
    }

    if (walletType === 'COIN' && !coinType) {
      console.error('❌ [Admin Charge] نوع سکه الزامی است');
      return NextResponse.json(
        { error: 'نوع سکه الزامی است' },
        { status: 400 }
      );
    }

    if (walletType === 'COIN' && !['COIN_FULL', 'COIN_HALF', 'COIN_QUARTER'].includes(coinType)) {
      console.error('❌ [Admin Charge] نوع سکه نامعتبر');
      return NextResponse.json(
        { error: 'نوع سکه نامعتبر است' },
        { status: 400 }
      );
    }

    // تبدیل coinType به productType
    const getProductType = (coinType: string): 'COIN_BAHAR_86' | 'COIN_NIM_86' | 'COIN_ROBE_86' => {
      if (coinType === 'COIN_FULL') return 'COIN_BAHAR_86';
      if (coinType === 'COIN_HALF') return 'COIN_NIM_86';
      if (coinType === 'COIN_QUARTER') return 'COIN_ROBE_86';
      throw new Error('نوع سکه نامعتبر است');
    };

    // بررسی وجود کاربر
    console.log('📝 [Admin Charge] در حال بررسی وجود کاربر...');
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true
      }
    });

    if (!targetUser) {
      console.error('❌ [Admin Charge] کاربر یافت نشد');
      return NextResponse.json(
        { error: 'کاربر یافت نشد' },
        { status: 404 }
      );
    }

    console.log('✅ [Admin Charge] کاربر یافت شد:', targetUser.username);

    // استفاده از Prisma Transaction برای atomicity
    const result = await prisma.$transaction(async (tx) => {
      // اگر شارژ سکه است، Order ایجاد کن
      if (walletType === 'COIN') {
        const productType = getProductType(coinType);
        const now = new Date();

        // دریافت قیمت محصول (برای ثبت در Order)
        const price = await tx.price.findFirst({
          where: {
            productType,
            isActive: true
          }
        });

        const unitPrice = price ? Number(price.buyPrice) : 0;
        const totalPrice = Number(amount) * unitPrice;
        const commission = 0; // شارژ دستی بدون کارمزد
        const finalPrice = totalPrice;

        // ایجاد Order با وضعیت COMPLETED
        console.log('📝 [Admin Charge] در حال ایجاد سفارش سکه...');
        const order = await tx.order.create({
          data: {
            userId,
            type: 'BUY',
            productType,
            amount: Number(amount),
            price: unitPrice,
            totalPrice: finalPrice,
            commission,
            commissionRate: 0,
            status: 'COMPLETED',
            isAutomatic: false,
            priceLockedAt: now,
            completedAt: now,
            notes: description || `شارژ دستی سکه توسط ادمین`,
            adminNotes: adminNotes || undefined
          }
        });

        console.log('✅ [Admin Charge] سفارش سکه ایجاد شد:', order.id);

        // آماده‌سازی metadata
        const metadata: any = {
          adminId: adminUser.id,
          adminUsername: adminUser.username,
          receiptDate: new Date().toISOString(),
          chargeType: 'MANUAL_ADMIN_COIN',
          orderId: order.id,
          productType,
          coinType
        };

        if (receiptNumber) {
          metadata.receiptNumber = receiptNumber;
        }

        if (adminNotes) {
          metadata.adminNotes = adminNotes;
        }

        // ایجاد Notification برای کاربر
        console.log('📝 [Admin Charge] در حال ایجاد اعلان برای کاربر...');
        await tx.notification.create({
          data: {
            userId,
            type: 'TRANSACTION',
            title: 'شارژ موجودی سکه',
            message: `${amount} عدد ${coinType === 'COIN_FULL' ? 'تمام سکه' : coinType === 'COIN_HALF' ? 'نیم سکه' : 'ربع سکه'} به موجودی شما اضافه شد.`,
            metadata: {
              orderId: order.id,
              amount: Number(amount),
              coinType,
              receiptNumber: receiptNumber || null,
              timestamp: new Date().toISOString()
            }
          }
        });

        console.log('✅ [Admin Charge] اعلان ایجاد شد');

        return { order, targetUser, coinType, amount: Number(amount) };
      }

      // برای RIAL و GOLD - منطق قبلی
      // بررسی وجود کیف پول
      console.log('📝 [Admin Charge] در حال بررسی کیف پول...');
      let wallet = await tx.wallet.findFirst({
        where: {
          userId,
          type: walletType
        }
      });

      // اگر کیف پول وجود نداشت، ایجاد کن
      if (!wallet) {
        console.log('📝 [Admin Charge] کیف پول وجود ندارد، در حال ایجاد...');
        wallet = await tx.wallet.create({
          data: {
            userId,
            type: walletType,
            balance: 0,
            currency: walletType === 'RIAL' ? 'IRR' : 'GOLD',
            isActive: true
          }
        });
        console.log('✅ [Admin Charge] کیف پول ایجاد شد');
      }

      // به‌روزرسانی موجودی کیف پول
      console.log('📝 [Admin Charge] در حال به‌روزرسانی موجودی...');
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: {
            increment: amount
          }
        }
      });

      console.log('✅ [Admin Charge] موجودی به‌روزرسانی شد. موجودی جدید:', updatedWallet.balance.toString());

      // آماده‌سازی metadata
      const metadata: any = {
        adminId: adminUser.id,
        adminUsername: adminUser.username,
        receiptDate: new Date().toISOString(),
        chargeType: 'MANUAL_ADMIN'
      };

      if (receiptNumber) {
        metadata.receiptNumber = receiptNumber;
      }

      if (adminNotes) {
        metadata.adminNotes = adminNotes;
      }

      // ثبت تراکنش
      console.log('📝 [Admin Charge] در حال ثبت تراکنش...');
      const transaction = await tx.transaction.create({
        data: {
          userId,
          walletId: wallet.id,
          type: 'DEPOSIT',
          amount,
          description: description || `شارژ دستی توسط ادمین (${walletType})`,
          status: 'COMPLETED',
          referenceId: receiptNumber || `ADMIN-${Date.now()}`,
          metadata
        }
      });

      console.log('✅ [Admin Charge] تراکنش ثبت شد:', transaction.id);

      // ایجاد Notification برای کاربر
      console.log('📝 [Admin Charge] در حال ایجاد اعلان برای کاربر...');
      await tx.notification.create({
        data: {
          userId,
          type: 'TRANSACTION',
          title: 'شارژ موجودی',
          message: `موجودی کیف پول ${walletType === 'RIAL' ? 'ریالی' : 'طلایی'} شما به مبلغ ${amount} ${walletType === 'RIAL' ? 'تومان' : 'گرم'} شارژ شد.`,
          metadata: {
            transactionId: transaction.id,
            amount,
            walletType,
            receiptNumber: receiptNumber || null,
            timestamp: new Date().toISOString()
          }
        }
      });

      console.log('✅ [Admin Charge] اعلان ایجاد شد');

      return { updatedWallet, transaction, targetUser };
    }, {
      timeout: 10000 // 10 second timeout
    });

    const duration = Date.now() - startTime;
    console.log('✅ [Admin Charge] ========== شارژ موفق ==========');
    console.log('✅ [Admin Charge] مدت زمان:', `${duration}ms`);
    console.log('✅ [Admin Charge] کاربر:', result.targetUser.username);
    console.log('✅ [Admin Charge] مبلغ:', amount);
    console.log('✅ [Admin Charge] نوع:', walletType);

    if (walletType === 'COIN') {
      // Type guard: بررسی وجود order در result
      if ('order' in result && result.order) {
        return NextResponse.json({
          success: true,
          message: 'سکه‌ها با موفقیت شارژ شدند',
          order: {
            id: result.order.id,
            amount: result.amount,
            coinType: result.coinType,
            status: 'COMPLETED',
            createdAt: result.order.createdAt
          },
          user: {
            id: result.targetUser.id,
            username: result.targetUser.username,
            firstName: result.targetUser.firstName,
            lastName: result.targetUser.lastName
          }
        });
      } else {
        return NextResponse.json(
          { error: 'خطا در ایجاد سفارش سکه' },
          { status: 500 }
        );
      }
    }

    // Type guard: بررسی وجود updatedWallet و transaction در result
    if ('updatedWallet' in result && result.updatedWallet && 'transaction' in result && result.transaction) {
      return NextResponse.json({
        success: true,
        message: 'موجودی با موفقیت شارژ شد',
        wallet: {
          id: result.updatedWallet.id,
          type: result.updatedWallet.type,
          balance: result.updatedWallet.balance,
          currency: result.updatedWallet.currency
        },
        transaction: {
          id: result.transaction.id,
          amount: result.transaction.amount,
          status: result.transaction.status,
          createdAt: result.transaction.createdAt
        },
      user: {
        id: result.targetUser.id,
        username: result.targetUser.username,
        firstName: result.targetUser.firstName,
        lastName: result.targetUser.lastName
      }
      });
    } else {
      return NextResponse.json(
        { error: 'خطا در شارژ موجودی' },
        { status: 500 }
      );
    }

  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error('❌ [Admin Charge] ========== خطا در شارژ ==========');
    console.error('❌ [Admin Charge] خطا:', error);
    console.error('📋 [Admin Charge] نوع خطا:', error?.constructor?.name || 'Unknown');
    console.error('📋 [Admin Charge] پیام خطا:', error?.message || 'بدون پیام');
    console.error('📋 [Admin Charge] کد خطا:', error?.code || 'بدون کد');
    console.error('📋 [Admin Charge] Stack:', error?.stack || 'بدون stack');
    console.error('📋 [Admin Charge] مدت زمان قبل از خطا:', `${duration}ms`);

    // لاگ کردن جزئیات بیشتر برای Prisma errors
    if (error?.meta) {
      console.error('📋 [Admin Charge] Prisma Meta:', JSON.stringify(error.meta, null, 2));
    }

    // بررسی نوع خطاهای Prisma
    if (error?.code === 'P2002') {
      const target = error?.meta?.target || [];
      console.error('⚠️ [Admin Charge] خطای تکراری: فیلد تکراری در دیتابیس');
      return NextResponse.json(
        { 
          error: `این ${target.join(' یا ')} قبلاً استفاده شده است`,
          details: process.env.NODE_ENV === 'development' ? error?.message : undefined
        },
        { status: 400 }
      );
    } else if (error?.code === 'P1001') {
      console.error('⚠️ [Admin Charge] خطای اتصال: نمی‌تواند به دیتابیس متصل شود');
      return NextResponse.json(
        { 
          error: 'خطا در اتصال به دیتابیس',
          details: process.env.NODE_ENV === 'development' ? error?.message : undefined
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { 
        error: 'خطا در شارژ موجودی',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
      { status: 500 }
    );
  }
}

