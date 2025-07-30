import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // ایجاد response
    const response = NextResponse.json({
      success: true,
      message: 'خروج موفقیت‌آمیز بود'
    });

    // پاک کردن cookies
    response.cookies.delete('accessToken');
    response.cookies.delete('refreshToken');

    return response;

  } catch (error) {
    console.error('خطا در خروج:', error);
    return NextResponse.json(
      { error: 'خطا در خروج' },
      { status: 500 }
    );
  }
} 