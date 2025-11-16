import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { execSync } from 'child_process';

export async function GET() {
  try {
    console.log('🔍 [Migrations Debug] بررسی وضعیت مایگریشن‌ها...');
    
    // تست اتصال
    let dbConnected = false;
    try {
      await prisma.$connect();
      await prisma.$queryRaw`SELECT 1`;
      dbConnected = true;
      console.log('✅ [Migrations Debug] اتصال به دیتابیس برقرار است');
    } catch (dbError: any) {
      console.error('❌ [Migrations Debug] خطا در اتصال دیتابیس:', dbError.message);
      return NextResponse.json(
        {
          success: false,
          error: 'خطا در اتصال به دیتابیس',
          details: dbError.message,
          database: {
            connected: false,
            url: process.env.DATABASE_URL ? 'تعریف شده' : '❌ تعریف نشده'
          }
        },
        { status: 503 }
      );
    }

    // دریافت لیست مایگریشن‌ها از دیتابیس
    let appliedMigrations: any[] = [];
    let migrationTableExists = false;
    
    try {
      const migrations = await prisma.$queryRaw<Array<{ 
        migration_name: string; 
        finished_at: Date | null;
        applied_steps_count: number;
        started_at: Date | null;
      }>>`
        SELECT migration_name, finished_at, applied_steps_count, started_at
        FROM _prisma_migrations
        ORDER BY started_at DESC
      `;
      appliedMigrations = migrations || [];
      migrationTableExists = true;
      console.log(`📋 [Migrations Debug] تعداد مایگریشن‌های یافت شده: ${appliedMigrations.length}`);
    } catch (migTableError: any) {
      console.warn('⚠️ [Migrations Debug] خطا در دریافت مایگریشن‌ها:', migTableError.message);
      if (migTableError.message?.includes('does not exist') || migTableError.message?.includes('relation')) {
        console.warn('💡 [Migrations Debug] جدول _prisma_migrations وجود ندارد - مایگریشن‌ها باید اجرا شوند');
        migrationTableExists = false;
      }
    }

    // چک کردن وضعیت مایگریشن‌ها با Prisma CLI
    let migrationStatus = 'unknown';
    let migrationStatusOutput = '';
    
    try {
      const status = execSync('npx prisma migrate status', { 
        encoding: 'utf-8',
        timeout: 10000,
        stdio: 'pipe'
      });
      migrationStatus = 'ok';
      migrationStatusOutput = status;
      console.log('📊 [Migrations Debug] وضعیت مایگریشن‌ها:', status);
    } catch (error: any) {
      console.error('⚠️ [Migrations Debug] خطا در بررسی وضعیت مایگریشن‌ها:', error.message);
      migrationStatus = 'error';
      migrationStatusOutput = error.message || 'خطا در اجرای دستور';
      
      // اگر خروجی وجود دارد، آن را هم نمایش بده
      if (error.stdout) {
        migrationStatusOutput = error.stdout.toString();
        console.log('📋 [Migrations Debug] خروجی دستور:', error.stdout.toString());
      }
      if (error.stderr) {
        console.error('📋 [Migrations Debug] خطای دستور:', error.stderr.toString());
      }
    }

    // دریافت لیست جداول برای اطمینان از اینکه مایگریشن‌ها اعمال شده‌اند
    let tables: string[] = [];
    try {
      const tableList = await prisma.$queryRaw<Array<{ table_name: string }>>`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `;
      tables = tableList.map(t => t.table_name);
      console.log(`📊 [Migrations Debug] تعداد جداول: ${tables.length}`);
    } catch (tableError: any) {
      console.error('⚠️ [Migrations Debug] خطا در دریافت لیست جداول:', tableError.message);
    }

    // بررسی اینکه آیا جداول اصلی وجود دارند
    const expectedTables = ['users', 'wallets', 'transactions', 'orders', 'prices'];
    const missingTables = expectedTables.filter(t => !tables.includes(t));
    const hasCoreTables = missingTables.length === 0;

    return NextResponse.json({
      success: true,
      database: {
        connected: dbConnected,
        url: process.env.DATABASE_URL ? 'تعریف شده' : '❌ تعریف نشده',
        migrationTableExists: migrationTableExists
      },
      migrations: {
        applied: appliedMigrations.map(m => ({
          name: m.migration_name,
          finishedAt: m.finished_at,
          startedAt: m.started_at,
          steps: m.applied_steps_count
        })),
        count: appliedMigrations.length,
        status: migrationStatus,
        statusOutput: migrationStatusOutput,
        lastMigration: appliedMigrations[0]?.migration_name || null
      },
      tables: {
        count: tables.length,
        list: tables,
        hasCoreTables: hasCoreTables,
        missingCoreTables: missingTables
      },
      recommendations: [
        ...(migrationTableExists && appliedMigrations.length === 0 
          ? ['⚠️ هیچ مایگریشنی اعمال نشده است - باید مایگریشن‌ها را اجرا کنید'] 
          : []),
        ...(!migrationTableExists 
          ? ['⚠️ جدول مایگریشن‌ها وجود ندارد - باید مایگریشن‌ها را اجرا کنید'] 
          : []),
        ...(missingTables.length > 0 
          ? [`⚠️ جداول اصلی وجود ندارند: ${missingTables.join(', ')}`] 
          : []),
        ...(migrationStatus === 'error' 
          ? ['⚠️ خطا در بررسی وضعیت مایگریشن‌ها - لطفا دستی بررسی کنید'] 
          : [])
      ]
    });
  } catch (error: any) {
    console.error('❌ [Migrations Debug] خطا در بررسی مایگریشن‌ها:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'خطا در بررسی مایگریشن‌ها',
        database: {
          connected: false,
          url: process.env.DATABASE_URL ? 'تعریف شده' : '❌ تعریف نشده'
        }
      },
      { status: 500 }
    );
  }
}

