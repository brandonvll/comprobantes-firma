import { NextRequest, NextResponse } from 'next/server';

/**
 * Validates API access: allows same-origin browser requests,
 * or requires x-api-key header for external access.
 * Returns a NextResponse with error if unauthorized, or null if authorized.
 */
export function validateApiKey(req: NextRequest): NextResponse | null {
  const apiAccessKey = process.env.API_ACCESS_KEY;

  // If no API_ACCESS_KEY is configured in env, block ALL requests as a safety measure
  if (!apiAccessKey || apiAccessKey.trim() === '') {
    console.error('SECURITY: API_ACCESS_KEY is not configured. All API requests are blocked.');
    return NextResponse.json(
      { success: false, error: 'Server misconfigured: API access key not set.' },
      { status: 500 }
    );
  }

  // Allow same-origin browser requests (Origin or Referer matches app host)
  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');
  const host = req.headers.get('host') || '';

  const isSameOrigin =
    (origin && new URL(origin).host === host) ||
    (referer && new URL(referer).host === host);

  if (isSameOrigin) {
    return null; // Authorized
  }

  // External requests need x-api-key
  const providedKey = req.headers.get('x-api-key');

  if (!providedKey || providedKey !== apiAccessKey) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: API key required.' },
      { status: 401 }
    );
  }

  return null; // Authorized
}
