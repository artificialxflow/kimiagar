import { NextRequest, NextResponse } from 'next/server';
import { 
  getExternalPrices, 
  transformExternalPrices, 
  testExternalAPIConnection,
  scrapeExternalPrices,
  getExternalPriceStatus
} from '@/app/lib/externalPriceService';

export async function GET() {
  try {
    // بررسی اتصال به API خارجی
    const isConnected = await testExternalAPIConnection();
    
    if (!isConnected) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'خطا در اتصال به API خارجی',
          message: 'سرور قیمت‌های خارجی در دسترس نیست'
        },
        { status: 503 }
      );
    }

    // دریافت قیمت‌های خارجی
    const externalResponse = await getExternalPrices();
    const transformedPrices = transformExternalPrices(externalResponse);

    return NextResponse.json({
      success: true,
      data: transformedPrices,
      timestamp: externalResponse.timestamp,
      count: externalResponse.count,
      source: 'external',
      apiUrl: 'https://yazdan-price.liara.run'
    });

  } catch (error) {
    console.error('خطا در دریافت قیمت‌های خارجی:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'خطا در دریافت قیمت‌های خارجی',
        message: error instanceof Error ? error.message : 'خطای نامشخص'
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    // بررسی اتصال به API خارجی
    const isConnected = await testExternalAPIConnection();
    
    if (!isConnected) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'خطا در اتصال به API خارجی',
          message: 'سرور قیمت‌های خارجی در دسترس نیست'
        },
        { status: 503 }
      );
    }

    // اسکرپ کردن قیمت‌های جدید
    const scrapeResponse = await scrapeExternalPrices();
    const transformedPrices = transformExternalPrices(scrapeResponse);

    return NextResponse.json({
      success: true,
      message: scrapeResponse.message,
      data: transformedPrices,
      timestamp: scrapeResponse.timestamp,
      count: scrapeResponse.count,
      source: 'external',
      action: 'scraped'
    });

  } catch (error) {
    console.error('خطا در اسکرپ قیمت‌های خارجی:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'خطا در اسکرپ قیمت‌های خارجی',
        message: error instanceof Error ? error.message : 'خطای نامشخص'
      },
      { status: 500 }
    );
  }
}
