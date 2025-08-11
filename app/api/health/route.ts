import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // تست اتصال دیتابیس
    let dbStatus = 'unknown';
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
    } catch (dbError) {
      console.error('خطا در اتصال دیتابیس:', dbError);
      dbStatus = 'error';
    }

    // تست Prisma Client
    let prismaStatus = 'unknown';
    try {
      await prisma.user.findFirst();
      prismaStatus = 'working';
    } catch (prismaError) {
      console.error('خطا در Prisma Client:', prismaError);
      prismaStatus = 'error';
    }

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      database: {
        status: dbStatus,
        url: process.env.DATABASE_URL ? 'configured' : 'not configured'
      },
      prisma: {
        status: prismaStatus
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      }
    });

  } catch (error) {
    console.error('خطا در health check:', error);
    return NextResponse.json(
      { 
        status: 'error',
        error: 'خطا در بررسی وضعیت سرویس',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 