import { NextRequest, NextResponse } from 'next/server';
import { generateReceiptImage } from '@/services/receiptService';
import { GenerateReceiptRequest } from '@/types/receipt';
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
    const body: GenerateReceiptRequest = await req.json();
    const { image, fields, templateId } = body;

    if (!image) {
      return NextResponse.json(
        { success: false, error: 'Se requiere la imagen original del recibo.' },
        { status: 400 }
      );
    }

    const activeTemplateId = templateId || fields?.templateId || 'chase';

    if (!fields) {
      return NextResponse.json(
        {
          success: false,
          error: 'Se requieren los campos para generar el comprobante.',
        },
        { status: 400 }
      );
    }

    const result = await generateReceiptImage({ image, fields, templateId: activeTemplateId });
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API Error in generate-receipt:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al procesar la solicitud con GPT Image.' },
      { status: 500 }
    );
  }
}
