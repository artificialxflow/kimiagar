import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  console.error('🧪 [Test Log] ========== تست لاگ ==========');
  console.error('🧪 [Test Log] این یک تست لاگ است');
  console.error('🧪 [Test Log] Time:', new Date().toISOString());
  console.error('🧪 [Test Log] NODE_ENV:', process.env.NODE_ENV);
  
  return NextResponse.json({
    success: true,
    message: 'تست لاگ انجام شد - لاگ‌ها را در console بررسی کن',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
}

export async function POST(request: NextRequest) {
  console.error('🧪 [Test Log] ========== تست لاگ POST ==========');
  
  try {
    const body = await request.json();
    console.error('🧪 [Test Log] Body دریافت شد:', JSON.stringify(body));
    
    return NextResponse.json({
      success: true,
      message: 'تست لاگ POST انجام شد',
      receivedBody: body,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('🧪 [Test Log] خطا در خواندن body:', error);
    return NextResponse.json({
      success: false,
      error: error?.message,
      timestamp: new Date().toISOString()
    }, { status: 400 });
  }
}

