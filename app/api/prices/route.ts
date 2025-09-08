import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { 
  getExternalPrices, 
  transformExternalPrices, 
  testExternalAPIConnection 
} from '@/app/lib/externalPriceService';
import { Decimal } from '@prisma/client/runtime/library';

export async function GET() {
  try {
    // دریافت قیمت‌های خارجی به صورت اولویت
    let externalPrices = null;
    let externalPricesError = null;
    
    try {
      const isConnected = await testExternalAPIConnection();
      if (isConnected) {
        const externalResponse = await getExternalPrices();
        externalPrices = transformExternalPrices(externalResponse);
      }
    } catch (error) {
      console.error('خطا در دریافت قیمت‌های خارجی:', error);
      externalPricesError = error instanceof Error ? error.message : 'خطا در اتصال به API خارجی';
    }

    // اگر قیمت‌های خارجی موجود است، از آن استفاده کن
    if (externalPrices && Object.keys(externalPrices).length > 0) {
      const combinedPrices = Object.entries(externalPrices).map(([productType, priceData]: [string, any]) => ({
        id: `external_${productType}`,
        productType: productType as any,
        buyPrice: new Decimal(priceData.buyPrice),
        sellPrice: new Decimal(priceData.sellPrice),
        margin: new Decimal(priceData.sellPrice - priceData.buyPrice),
        source: 'external',
        isActive: true,
        validFrom: new Date(priceData.timestamp),
        validTo: null,
        createdAt: new Date(priceData.timestamp),
        updatedAt: new Date(priceData.timestamp),
        persianName: priceData.persianName
      }));

      return NextResponse.json({
        success: true,
        prices: combinedPrices,
        externalPrices: externalPrices,
        externalPricesError,
        timestamp: new Date().toISOString(),
        sources: {
          internal: 0,
          external: Object.keys(externalPrices).length
        },
        lastUpdate: externalPrices[Object.keys(externalPrices)[0]]?.timestamp
      });
    }

    // اگر قیمت‌های خارجی موجود نیست، از قیمت‌های داخلی استفاده کن
    const internalPrices = await prisma.price.findMany({
      where: { isActive: true },
      orderBy: { updatedAt: 'desc' }
    });

    // اگر قیمت‌های داخلی وجود ندارند، قیمت‌های نمونه ایجاد کن
    if (internalPrices.length === 0) {
      const samplePrices = [
        {
          productType: 'GOLD_18K' as const,
          buyPrice: 37745677,
          sellPrice: 37894038,
          margin: 148361,
          source: 'fallback'
        },
        {
          productType: 'COIN_BAHAR_86' as const,
          buyPrice: 92908770,
          sellPrice: 93484205,
          margin: 575435,
          source: 'fallback'
        },
        {
          productType: 'COIN_NIM_86' as const,
          buyPrice: 49757147,
          sellPrice: 50614379,
          margin: 857232,
          source: 'fallback'
        },
        {
          productType: 'COIN_ROBE_86' as const,
          buyPrice: 28930894,
          sellPrice: 29571462,
          margin: 640568,
          source: 'fallback'
        }
      ];

      await prisma.price.createMany({
        data: samplePrices
      });

      const newPrices = await prisma.price.findMany({
        where: { isActive: true },
        orderBy: { updatedAt: 'desc' }
      });

      return NextResponse.json({
        success: true,
        prices: newPrices,
        externalPrices: null,
        externalPricesError: 'استفاده از قیمت‌های پشتیبان',
        timestamp: new Date().toISOString(),
        sources: {
          internal: newPrices.length,
          external: 0
        }
      });
    }

    return NextResponse.json({
      success: true,
      prices: internalPrices,
      externalPrices: null,
      externalPricesError: externalPricesError || 'استفاده از قیمت‌های داخلی',
      timestamp: new Date().toISOString(),
      sources: {
        internal: internalPrices.length,
        external: 0
      }
    });

  } catch (error) {
    console.error('خطا در دریافت قیمت‌ها:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت قیمت‌ها' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productType, buyPrice, sellPrice, margin, source } = body;

    // بررسی وجود قیمت برای این محصول
    const existingPrice = await prisma.price.findFirst({
      where: { productType, isActive: true }
    });

    if (existingPrice) {
      // به‌روزرسانی قیمت موجود
      const updatedPrice = await prisma.price.update({
        where: { id: existingPrice.id },
        data: {
          buyPrice,
          sellPrice,
          margin,
          source,
          updatedAt: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        price: updatedPrice
      });
    } else {
      // ایجاد قیمت جدید
      const newPrice = await prisma.price.create({
        data: {
          productType,
          buyPrice,
          sellPrice,
          margin,
          source
        }
      });

      return NextResponse.json({
        success: true,
        price: newPrice
      });
    }

  } catch (error) {
    console.error('خطا در به‌روزرسانی قیمت:', error);
    return NextResponse.json(
      { error: 'خطا در به‌روزرسانی قیمت' },
      { status: 500 }
    );
  }
} 