import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 شروع seeding دیتابیس...');

  // پاک کردن داده‌های موجود
  console.log('🧹 پاک کردن داده‌های موجود...');
  await prisma.userSetting.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.order.deleteMany();
  await prisma.transfer.deleteMany();
  await prisma.deliveryRequest.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.user.deleteMany();

  // ایجاد کاربر تست
  console.log('👤 ایجاد کاربر تست...');
  const testUser = await prisma.user.create({
    data: {
      username: 'testuser',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/vHqHqHq', // password123
      firstName: 'کاربر',
      lastName: 'تست',
      phoneNumber: '09123456789',
      nationalId: '1234567890',
      email: 'test@example.com',
      isVerified: true,
      isEmailVerified: true,
      isPhoneVerified: true,
      isAdmin: false
    }
  });

  // ایجاد کاربر ادمین
  console.log('👑 ایجاد کاربر ادمین...');
  const adminUser = await prisma.user.create({
    data: {
      username: 'admin',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/vHqHqHq', // password123
      firstName: 'ادمین',
      lastName: 'سیستم',
      phoneNumber: '09987654321',
      nationalId: '0987654321',
      email: 'admin@kimiagar.com',
      isVerified: true,
      isEmailVerified: true,
      isPhoneVerified: true,
      isAdmin: true
    }
  });

  // ایجاد کیف پول‌ها برای کاربر تست
  console.log('💰 ایجاد کیف پول‌ها...');
  await prisma.wallet.createMany({
    data: [
      {
        userId: testUser.id,
        type: 'RIAL',
        balance: 1000000, // 1 میلیون تومان
        currency: 'IRR',
        isActive: true
      },
      {
        userId: testUser.id,
        type: 'GOLD',
        balance: 10, // 10 گرم طلا
        currency: 'GOLD',
        isActive: true
      }
    ]
  });

  // ایجاد کیف پول‌ها برای کاربر ادمین
  await prisma.wallet.createMany({
    data: [
      {
        userId: adminUser.id,
        type: 'RIAL',
        balance: 0,
        currency: 'IRR',
        isActive: true
      },
      {
        userId: adminUser.id,
        type: 'GOLD',
        balance: 0,
        currency: 'GOLD',
        isActive: true
      }
    ]
  });

  // ایجاد تنظیمات کاربر
  console.log('⚙️ ایجاد تنظیمات کاربر...');
  await prisma.userSetting.createMany({
    data: [
      {
        userId: testUser.id,
        smsEnabled: true,
        emailEnabled: true,
        pushEnabled: true,
        language: 'fa',
        timezone: 'Asia/Tehran'
      },
      {
        userId: adminUser.id,
        smsEnabled: true,
        emailEnabled: true,
        pushEnabled: true,
        language: 'fa',
        timezone: 'Asia/Tehran'
      }
    ]
  });

  console.log('✅ Seeding دیتابیس با موفقیت انجام شد!');
  console.log('👤 کاربر تست:', testUser.username);
  console.log('👑 کاربر ادمین:', adminUser.username);
  console.log('🔑 رمز عبور هر دو کاربر: password123');
}

main()
  .catch((e) => {
    console.error('❌ خطا در seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
