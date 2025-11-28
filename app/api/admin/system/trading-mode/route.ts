import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { verifyToken } from '@/app/lib/jwt';
import { getTradingMode, setTradingMode } from '@/app/lib/systemSettings';

async function ensureAdmin(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) {
    return { error: NextResponse.json({ error: 'توکن احراز هویت یافت نشد' }, { status: 401 }) };
  }

  const decoded = verifyToken(token);
  if (!decoded?.userId) {
    return { error: NextResponse.json({ error: 'توکن نامعتبر است' }, { status: 401 }) };
  }

  const admin = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: { id: true, firstName: true, lastName: true, isAdmin: true },
  });

  if (!admin?.isAdmin) {
    return { error: NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 }) };
  }

  return { admin };
}

export async function GET(request: NextRequest) {
  try {
    const auth = await ensureAdmin(request);
    if ('error' in auth) return auth.error;

    const mode = await getTradingMode();
    return NextResponse.json({ success: true, mode });
  } catch (error) {
    console.error('خطا در دریافت وضعیت معاملات:', error);
    return NextResponse.json({ error: 'خطا در دریافت وضعیت معاملات' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await ensureAdmin(request);
    if ('error' in auth) return auth.error;

    const body = await request.json();
    const { tradingPaused, message } = body;

    if (typeof tradingPaused !== 'boolean') {
      return NextResponse.json({ error: 'وضعیت معاملات باید مشخص شود' }, { status: 400 });
    }

    const updated = await setTradingMode({
      tradingPaused,
      message: message || (tradingPaused ? 'مدیر آفلاین است؛ معاملات متوقف شد' : 'معاملات فعال شد'),
      updatedBy: auth.admin.id,
    });

    return NextResponse.json({ success: true, mode: updated });
  } catch (error) {
    console.error('خطا در تغییر وضعیت معاملات:', error);
    return NextResponse.json({ error: 'خطا در تغییر وضعیت معاملات' }, { status: 500 });
  }
}

