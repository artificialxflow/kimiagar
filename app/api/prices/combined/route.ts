import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getExternalPrices, transformExternalPrices, testExternalAPIConnection } from '@/app/lib/externalPriceService';
import { Decimal } from '@prisma/client/runtime/library';

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
        // Type assertion برای priceData
        const typedPriceData = priceData as {
          buyPrice: number;
          sellPrice: number;
          timestamp: string;
          persianName: string;
        };
        
        const existingIndex = combinedPrices.findIndex(p => p.productType === productType);
        
        if (existingIndex !== -1) {
          // به‌روزرسانی قیمت موجود با قیمت خارجی
          combinedPrices[existingIndex] = {
            ...combinedPrices[existingIndex],
            buyPrice: new Decimal(typedPriceData.buyPrice),
            sellPrice: new Decimal(typedPriceData.sellPrice),
            margin: new Decimal(typedPriceData.sellPrice - typedPriceData.buyPrice),
            source: 'external',
            updatedAt: new Date(typedPriceData.timestamp)
          };
        } else {
          // اضافه کردن قیمت جدید از API خارجی
          combinedPrices.push({
            id: `external_${productType}`,
            productType: productType as any,
            buyPrice: new Decimal(typedPriceData.buyPrice),
            sellPrice: new Decimal(typedPriceData.sellPrice),
            margin: new Decimal(typedPriceData.sellPrice - typedPriceData.buyPrice),
            source: 'external',
            isActive: true,
            validFrom: new Date(typedPriceData.timestamp),
            validTo: null,
            createdAt: new Date(typedPriceData.timestamp),
            updatedAt: new Date(typedPriceData.timestamp)
          } as any);
        }
      });
    }

    // مرتب‌سازی بر اساس آخرین بروزرسانی
    combinedPrices.sort((a, b) => {
      const aTime = a.updatedAt.toISOString();
      const bTime = b.updatedAt.toISOString();
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
