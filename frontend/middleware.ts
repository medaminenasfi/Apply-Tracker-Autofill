import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function decodeJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    
    // Check expiration
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null; // Token is expired
    }
    
    return payload;
  } catch (e) {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const userRoutes = ['/dashboard', '/profile', '/applications', '/settings'];
  const adminRoutes = ['/admin'];

  const userToken = request.cookies.get('user_token')?.value;
  const adminToken = request.cookies.get('admin_token')?.value;

  const isUserRoute = userRoutes.some((route) => pathname.startsWith(route) && !pathname.startsWith('/admin'));
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  // Protect user routes
  if (isUserRoute) {
    if (!userToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    const payload = decodeJwt(userToken);
    if (!payload || payload.role === 'admin') {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('user_token');
      return response;
    }
  }

  // Protect admin routes
  if (isAdminRoute && pathname !== '/admin/login') {
    if (!adminToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    const payload = decodeJwt(adminToken);
    if (!payload || payload.role !== 'admin') {
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      response.cookies.delete('admin_token');
      return response;
    }
  }

  // Redirect from login if already authenticated
  if (pathname === '/login' || pathname === '/signup') {
    if (userToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }
  if (pathname === '/admin/login') {
    if (adminToken) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
