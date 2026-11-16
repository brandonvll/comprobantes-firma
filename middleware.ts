import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js Middleware — runs BEFORE any route handler.
 *
 * Protection layers:
 * 1. SITE PASSWORD: All pages require a valid auth cookie.
 *    Without it, users are redirected to /login.
 * 2. API KEY: API routes accept same-origin browser requests (with auth cookie)
 *    or external requests with `x-api-key` header.
 * 3. RATE LIMITING: Applied at the route handler level.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // --- Public paths that don't need auth ---
  const isLoginPage = pathname === '/login';
  const isAuthApi = pathname.startsWith('/api/auth/');
  const isStaticAsset =
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.endsWith('.ico') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.js');

  if (isLoginPage || isAuthApi || isStaticAsset) {
    return NextResponse.next();
  }

  // --- Check site auth cookie for ALL other routes ---
  const authCookie = req.cookies.get('site-auth')?.value;

  // For page routes (non-API): redirect to login if no auth cookie
  if (!pathname.startsWith('/api/')) {
    if (!authCookie) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = '/login';
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // --- API routes protection ---
  const apiAccessKey = process.env.API_ACCESS_KEY;

  if (!apiAccessKey || apiAccessKey.trim() === '') {
    console.error('SECURITY: API_ACCESS_KEY not configured. Blocking all API requests.');
    return NextResponse.json(
      { success: false, error: 'Server misconfigured: API access key not set.' },
      { status: 500 }
    );
  }

  // Mode 1: Same-origin browser requests with valid auth cookie
  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');
  const appHost = req.nextUrl.host;

  const isSameOrigin =
    (origin && new URL(origin).host === appHost) ||
    (referer && new URL(referer).host === appHost);

  if (isSameOrigin && authCookie) {
    return NextResponse.next();
  }

  // Mode 2: External requests need x-api-key
  const providedKey = req.headers.get('x-api-key');

  if (!providedKey || providedKey !== apiAccessKey) {
    const clientIp = req.headers.get('x-forwarded-for') || req.ip || 'unknown';
    console.warn(`SECURITY: Unauthorized API request to ${pathname} from ${clientIp}`);
    return NextResponse.json(
      { success: false, error: 'Unauthorized: API key required.' },
      { status: 401 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
