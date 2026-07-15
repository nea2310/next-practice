// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAuthToken, verifyToken } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const token = await getAuthToken(); // из cookies
  const isAuthenticated =
    !!token &&
    (() => {
      try {
        verifyToken(token);
        return true;
      } catch {
        return false;
      }
    })();

  const path = request.nextUrl.pathname;

  // Публичные маршруты (не требуют авторизации)
  const publicPaths = ['/login', '/register'];
  if (publicPaths.includes(path)) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/main', request.url));
    }
    return NextResponse.next();
  }

  // Защищённые маршруты (требуют авторизации)
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/main/:path*', '/notifications/:path*', '/login', '/register'],
};
