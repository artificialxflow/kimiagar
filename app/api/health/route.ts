import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(request: NextRequest) {
  const healthStatus: {
    status: string;
    timestamp: string;
    environment: string;
    error?: string;
    checks: {
      database: string;
      migrations: string;
      tables: string;
    };
    database: {
      connected: boolean;
      url: string;
    };
    migrations: {
      count: number;
      lastMigration: string | null;
    };
  } = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    checks: {
      database: 'unknown',
      migrations: 'unknown',
      tables: 'unknown'
    },
    database: {
      connected: false,
      url: process.env.DATABASE_URL ? 'تعریف شده' : '❌ تعریف نشده'
    },
    migrations: {
      count: 0,
      lastMigration: null
    }
  };

  try {
    // چک کردن اتصال دیتابیس
    console.log('🔍 [Health Check] بررسی اتصال دیتابیس...');
    try {
      await prisma.$queryRaw`SELECT 1`;
      healthStatus.checks.database = 'connected';
      healthStatus.database.connected = true;
      console.log('✅ [Health Check] دیتابیس متصل است');
    } catch (dbError: any) {
      console.error('❌ [Health Check] خطا در اتصال دیتابیس:', dbError.message);
      healthStatus.checks.database = 'disconnected';
      healthStatus.database.connected = false;
      healthStatus.status = 'error';
      healthStatus.error = `خطا در اتصال دیتابیس: ${dbError.message}`;
      
      return NextResponse.json(healthStatus, { status: 503 });
    }

    // چک کردن تعداد جداول
    try {
      const tables = await prisma.$queryRaw<Array<{ table_name: string }>>`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `;
      const tableCount = Array.isArray(tables) ? tables.length : 0;
      healthStatus.checks.tables = tableCount > 0 ? 'ok' : 'empty';
      console.log(`📊 [Health Check] تعداد جداول: ${tableCount}`);
      
      if (tableCount === 0) {
        console.warn('⚠️ [Health Check] هیچ جدولی در دیتابیس یافت نشد - ممکن است مایگریشن‌ها اجرا نشده باشند');
      }
    } catch (tableError: any) {
      console.error('⚠️ [Health Check] خطا در دریافت لیست جداول:', tableError.message);
      healthStatus.checks.tables = 'error';
    }

    // چک کردن مایگریشن‌های اعمال شده
    try {
      const migrations = await prisma.$queryRaw<Array<{ 
        migration_name: string; 
        finished_at: Date | null;
        applied_steps_count: number;
      }>>`
        SELECT migration_name, finished_at, applied_steps_count
        FROM _prisma_migrations
        WHERE finished_at IS NOT NULL
        ORDER BY finished_at DESC
      `;
      
      const migrationCount = Array.isArray(migrations) ? migrations.length : 0;
      healthStatus.migrations.count = migrationCount;
      healthStatus.migrations.lastMigration = migrations?.[0]?.migration_name || null;
      healthStatus.checks.migrations = migrationCount > 0 ? 'ok' : 'none';
      
      console.log(`📋 [Health Check] تعداد مایگریشن‌های اعمال شده: ${migrationCount}`);
      if (migrationCount > 0) {
        console.log(`📋 [Health Check] آخرین مایگریشن: ${migrations[0]?.migration_name}`);
      } else {
        console.warn('⚠️ [Health Check] هیچ مایگریشنی اعمال نشده است');
      }
    } catch (migError: any) {
      console.error('⚠️ [Health Check] خطا در بررسی مایگریشن‌ها:', migError.message);
      healthStatus.checks.migrations = 'error';
      // اگر جدول _prisma_migrations وجود نداشته باشد، احتمالاً مایگریشن‌ها اجرا نشده‌اند
      if (migError.message?.includes('does not exist') || migError.message?.includes('relation')) {
        console.warn('💡 [Health Check] جدول مایگریشن‌ها وجود ندارد - مایگریشن‌ها باید اجرا شوند');
        healthStatus.checks.migrations = 'not_applied';
      }
    }

    return NextResponse.json(healthStatus);
  } catch (error: any) {
    console.error('❌ [Health Check] خطا در health check:', error);
    healthStatus.status = 'error';
    healthStatus.error = error?.message || 'خطا در بررسی وضعیت سرویس';
    
    return NextResponse.json(healthStatus, { status: 500 });
  }
} 