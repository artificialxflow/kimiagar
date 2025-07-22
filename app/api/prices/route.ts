import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // دریافت قیمت‌های فعال
    const prices = await prisma.price.findMany({
      where: { isActive: true },
      orderBy: { updatedAt: 'desc' }
    });

    // اگر قیمت‌ها وجود ندارند، قیمت‌های نمونه ایجاد کن
    if (prices.length === 0) {
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

      return NextResponse.json({
        success: true,
        prices: newPrices
      });
    }

    return NextResponse.json({
      success: true,
      prices
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