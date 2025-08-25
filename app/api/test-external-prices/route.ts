import { NextRequest, NextResponse } from 'next/server';
import { 
  testExternalAPIConnection,
  getExternalPrices,
  getExternalPriceStatus,
  checkExternalAPIHealth
} from '@/app/lib/externalPriceService';

export async function GET() {
  try {
    const results = {
      connection: false,
      prices: null,
      status: null,
      health: null,
      errors: [] as string[]
    };

    // تست اتصال
    try {
      results.connection = await testExternalAPIConnection();
    } catch (error) {
      results.errors.push(`خطا در تست اتصال: ${error}`);
    }

    // دریافت قیمت‌ها
    if (results.connection) {
      try {
        const pricesResponse = await getExternalPrices();
        results.prices = pricesResponse;
      } catch (error) {
        results.errors.push(`خطا در دریافت قیمت‌ها: ${error}`);
      }

      // دریافت وضعیت
      try {
        const statusResponse = await getExternalPriceStatus();
        results.status = statusResponse;
      } catch (error) {
        results.errors.push(`خطا در دریافت وضعیت: ${error}`);
      }

      // بررسی سلامت
      try {
        const healthResponse = await checkExternalAPIHealth();
        results.health = healthResponse;
      } catch (error) {
        results.errors.push(`خطا در بررسی سلامت: ${error}`);
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results
    });

  } catch (error) {
    console.error('خطا در تست API خارجی:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'خطا در تست API خارجی',
        message: error instanceof Error ? error.message : 'خطای نامشخص'
      },
      { status: 500 }
    );
  }
}
