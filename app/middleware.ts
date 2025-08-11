import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from './lib/jwt';

// مسیرهایی که نیاز به احراز هویت ندارند
const publicPaths = [
  '/',
  '/login',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/send-otp',
  '/api/auth/verify-otp',
  '/api/auth/verify-phone',
  '/api/auth/verify-email',
  '/api/health',
  '/api/debug/create-test-user',
  '/api/prices',
  '/api/sms/send',
  '/support'
];

// مسیرهایی که فقط نیاز به احراز هویت دارند (بدون بررسی نقش)
const protectedPaths = [
  '/dashboard',
  '/trading',
  '/wallet',
  '/profile',
  '/transfer',
  '/api/trading',
  '/api/wallet',
  '/api/profile',
  '/api/transfer',
  '/api/delivery',
  '/api/payment'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // بررسی مسیرهای عمومی
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // بررسی API routes (به جز مسیرهای عمومی)
  if (pathname.startsWith('/api/') && !protectedPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // بررسی صفحات frontend و API های محافظت شده
  let token = request.cookies.get('accessToken')?.value;

  // اگر token در cookie نباشد، در header Authorization بررسی کن
  if (!token) {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    // اگر token وجود ندارد، به صفحه login هدایت شود
    if (pathname !== '/login' && !pathname.startsWith('/api/')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // برای API ها، خطای 401 برگردان
    if (pathname.startsWith('/api/') && protectedPaths.some(path => pathname.startsWith(path))) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return NextResponse.next();
  }

  // بررسی اعتبار token
  const payload = verifyAccessToken(token);
  if (!payload) {
    // اگر token نامعتبر است، cookie را پاک کرده و به login هدایت شود
    if (pathname !== '/login' && !pathname.startsWith('/api/')) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('accessToken');
      response.cookies.delete('refreshToken');
      return response;
    }
    
    // برای API ها، خطای 401 برگردان
    if (pathname.startsWith('/api/') && protectedPaths.some(path => pathname.startsWith(path))) {
      return new NextResponse(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return NextResponse.next();
  }

  // اضافه کردن اطلاعات کاربر به header برای استفاده در API ها
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', payload.userId);
  requestHeaders.set('x-username', payload.username);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 