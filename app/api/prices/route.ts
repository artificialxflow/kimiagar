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

    // اگر قیمت‌های داخلی وجود ندارند، قیمت‌های نمونه ایجاد کن
    if (internalPrices.length === 0) {
      const samplePrices = [
        {
          productType: 'GOLD_18K' as const,
          buyPrice: 2500000,
          sellPrice: 2550000,
          margin: 50000,
          source: 'manual'
        },
        {
          productType: 'COIN_BAHAR' as const,
          buyPrice: 85000000,
          sellPrice: 87000000,
          margin: 2000000,
          source: 'manual'
        },
        {
          productType: 'COIN_NIM' as const,
          buyPrice: 42500000,
          sellPrice: 43500000,
          margin: 1000000,
          source: 'manual'
        },
        {
          productType: 'COIN_ROBE' as const,
          buyPrice: 21250000,
          sellPrice: 21750000,
          margin: 500000,
          source: 'manual'
        },
        {
          productType: 'COIN_BAHAR_86' as const,
          buyPrice: 80000000,
          sellPrice: 82000000,
          margin: 2000000,
          source: 'manual'
        },
        {
          productType: 'COIN_NIM_86' as const,
          buyPrice: 40000000,
          sellPrice: 41000000,
          margin: 1000000,
          source: 'manual'
        },
        {
          productType: 'COIN_ROBE_86' as const,
          buyPrice: 20000000,
          sellPrice: 20500000,
          margin: 500000,
          source: 'manual'
        }
      ];

      await prisma.price.createMany({
        data: samplePrices
      });

      // دریافت قیمت‌های ایجاد شده
      const newPrices = await prisma.price.findMany({
        where: { isActive: true },
        orderBy: { updatedAt: 'desc' }
      });

      internalPrices.push(...newPrices);
    }

    // تلاش برای دریافت قیمت‌های خارجی
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

    // ترکیب قیمت‌های داخلی و خارجی
    const combinedPrices = [...internalPrices];
    
    if (externalPrices) {
      // اضافه کردن قیمت‌های خارجی به عنوان قیمت‌های جدید
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

    return NextResponse.json({
      success: true,
      prices: combinedPrices,
      externalPrices: externalPrices,
      externalPricesError,
      timestamp: new Date().toISOString(),
      sources: {
        internal: internalPrices.length,
        external: externalPrices ? Object.keys(externalPrices).length : 0
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