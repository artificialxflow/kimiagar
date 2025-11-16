import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: ['error'],
  });
  
  // تست اتصال در production
  prisma.$connect()
    .then(() => {
      console.log('✅ Prisma Client به دیتابیس متصل شد');
      if (process.env.DATABASE_URL) {
        const dbUrl = process.env.DATABASE_URL;
        const urlMatch = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
        if (urlMatch) {
          console.log(`🔗 دیتابیس: ${urlMatch[5]}@${urlMatch[3]}:${urlMatch[4]}`);
        }
      }
    })
    .catch((error) => {
      console.error('❌ خطا در اتصال Prisma Client:', error.message);
      console.error('📋 جزئیات خطا:', error);
      if (error.code === 'P1001') {
        console.error('⚠️ نمی‌تواند به دیتابیس متصل شود - لطفا DATABASE_URL را بررسی کنید');
      } else if (error.code === 'P1003') {
        console.error('⚠️ دیتابیس وجود ندارد - لطفا دیتابیس را ایجاد کنید');
      }
    });
} else {
  if (!globalThis.prisma) {
    globalThis.prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
    });
    
    // تست اتصال در development
    globalThis.prisma.$connect()
      .then(() => {
        console.log('✅ Prisma Client به دیتابیس متصل شد (development)');
      })
      .catch((error) => {
        console.error('❌ خطا در اتصال Prisma Client (development):', error.message);
      });
  }
  prisma = globalThis.prisma;
}

// اضافه کردن event listener برای خطاها
prisma.$on('error' as never, (e: any) => {
  console.error('❌ Prisma Error Event:', e);
});

export { prisma };
