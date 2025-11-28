import { NextResponse } from 'next/server';
import { getTradingMode } from '@/app/lib/systemSettings';

export async function GET() {
  try {
    const mode = await getTradingMode();
    return NextResponse.json({ success: true, mode });
  } catch (error) {
    console.error('خطا در دریافت وضعیت عمومی معاملات:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت وضعیت معاملات' },
      { status: 500 }
    );
  }
}

