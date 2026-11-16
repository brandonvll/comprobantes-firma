import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    const sitePassword = process.env.SITE_PASSWORD;

    if (!sitePassword) {
      return NextResponse.json(
        { success: false, error: 'Server misconfigured: SITE_PASSWORD not set.' },
        { status: 500 }
      );
    }

    if (password !== sitePassword) {
      return NextResponse.json(
        { success: false, error: 'Contraseña incorrecta.' },
        { status: 401 }
      );
    }

    // Create a simple auth token (hash of password + secret)
    const token = Buffer.from(`authenticated:${Date.now()}`).toString('base64');

    const response = NextResponse.json({ success: true });

    response.cookies.set('site-auth', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Error processing login.' },
      { status: 500 }
    );
  }
}
