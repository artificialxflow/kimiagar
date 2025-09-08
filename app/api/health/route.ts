import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown'
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
  }
} 