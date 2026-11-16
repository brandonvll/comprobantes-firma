import { NextRequest, NextResponse } from 'next/server';
import { analyzeReceiptWithVision } from '@/services/visionService';
import { validateApiKey } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  // Auth check (defense in depth — middleware already checks, but this is a fallback)
  const authError = validateApiKey(req);
  if (authError) return authError;

  // Rate limiting
  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.ip || 'unknown';
  const rateCheck = checkRateLimit(clientIp);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { success: false, error: `Rate limit exceeded. Try again in ${Math.ceil((rateCheck.retryAfterMs || 60000) / 1000)}s.` },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rateCheck.retryAfterMs || 60000) / 1000)) } }
    );
  }

  try {
    const body = await req.json();
    const { image } = body;

    if (!image) {
      return NextResponse.json(
        { success: false, error: 'Se requiere la imagen para el análisis.' },
        { status: 400 }
      );
    }

    const result = await analyzeReceiptWithVision(image);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API Error in analyze-receipt:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error interno del servidor.' },
      { status: 500 }
    );
  }
}
