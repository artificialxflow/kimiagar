import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from './lib/jwt';

// مسیرهایی که نیاز به احراز هویت ندارند
const publicPaths = [
  '/login',
  '/api/auth/login',
  '/api/auth/register',
  '/api/health',
  '/api/debug/create-test-user'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // بررسی مسیرهای عمومی
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // بررسی API routes (به جز مسیرهای عمومی)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // بررسی صفحات frontend
  const token = request.cookies.get('accessToken')?.value;

  if (!token) {
    // اگر token وجود ندارد، به صفحه login هدایت شود
    if (pathname !== '/login') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // بررسی اعتبار token
  const payload = verifyAccessToken(token);
  if (!payload) {
    // اگر token نامعتبر است، cookie را پاک کرده و به login هدایت شود
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('accessToken');
    response.cookies.delete('refreshToken');
    return response;
  }

  return NextResponse.next();
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