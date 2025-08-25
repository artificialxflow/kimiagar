import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { 
  getExternalPrices, 
  transformExternalPrices, 
  testExternalAPIConnection 
} from '@/app/lib/externalPriceService';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // دریافت قیمت‌های داخلی
    const internalPrices = await prisma.price.findMany({
      where: { isActive: true },
      orderBy: { updatedAt: 'desc' }
    });

    // تلاش برای دریافت قیمت‌های خارجی
    let externalPrices = null;
    let externalPricesError = null;
    let externalConnectionStatus = false;
    
    try {
      const isConnected = await testExternalAPIConnection();
      externalConnectionStatus = isConnected;
      
      if (isConnected) {
        const externalResponse = await getExternalPrices();
        externalPrices = transformExternalPrices(externalResponse);
      }
    } catch (error) {
      console.error('خطا در دریافت قیمت‌های خارجی:', error);
      externalPricesError = error instanceof Error ? error.message : 'خطا در اتصال به API خارجی';
    }

    // ترکیب و مرتب‌سازی قیمت‌ها
    const combinedPrices = [...internalPrices];
    
    if (externalPrices) {
      // اضافه کردن یا به‌روزرسانی قیمت‌های خارجی
      Object.entries(externalPrices).forEach(([productType, priceData]) => {
        const existingIndex = combinedPrices.findIndex(p => p.productType === productType);
        
        if (existingIndex !== -1) {
          // به‌روزرسانی قیمت موجود با قیمت خارجی
          combinedPrices[existingIndex] = {
            ...combinedPrices[existingIndex],
            buyPrice: priceData.buyPrice,
            sellPrice: priceData.sellPrice,
            margin: priceData.sellPrice - priceData.buyPrice,
            source: 'external',
            updatedAt: new Date(priceData.timestamp),
            externalData: {
              timestamp: priceData.timestamp,
              persianName: priceData.persianName,
              source: 'external'
            }
          };
        } else {
          // اضافه کردن قیمت جدید از API خارجی
          combinedPrices.push({
            id: `external_${productType}`,
            productType: productType as any,
            buyPrice: priceData.buyPrice,
            sellPrice: priceData.sellPrice,
            margin: priceData.sellPrice - priceData.buyPrice,
            source: 'external',
            isActive: true,
            validFrom: new Date(priceData.timestamp),
            validTo: null,
            createdAt: new Date(priceData.timestamp),
            updatedAt: new Date(priceData.timestamp),
            externalData: {
              timestamp: priceData.timestamp,
              persianName: priceData.persianName,
              source: 'external'
            }
          } as any);
        }
      });
    }

    // مرتب‌سازی بر اساس آخرین بروزرسانی
    combinedPrices.sort((a, b) => {
      const aTime = a.externalData?.timestamp || a.updatedAt.toISOString();
      const bTime = b.externalData?.timestamp || b.updatedAt.toISOString();
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });

    // گروه‌بندی قیمت‌ها بر اساس منبع
    const groupedPrices = {
      internal: internalPrices,
      external: externalPrices,
      combined: combinedPrices
    };

    // آمار کلی
    const stats = {
      total: combinedPrices.length,
      internal: internalPrices.length,
      external: externalPrices ? Object.keys(externalPrices).length : 0,
      externalConnectionStatus,
      lastUpdate: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: groupedPrices,
      stats,
      externalPricesError,
      timestamp: new Date().toISOString(),
      sources: {
        internal: internalPrices.length,
        external: externalPrices ? Object.keys(externalPrices).length : 0
      }
    });

  } catch (error) {
    console.error('خطا در دریافت قیمت‌های ترکیبی:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'خطا در دریافت قیمت‌های ترکیبی',
        message: error instanceof Error ? error.message : 'خطای نامشخص'
      },
      { status: 500 }
    );
  }
}
