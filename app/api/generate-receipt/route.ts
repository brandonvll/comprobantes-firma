import { NextRequest, NextResponse } from 'next/server';
import { generateReceiptImage } from '@/services/receiptService';
import { GenerateReceiptRequest } from '@/types/receipt';

export async function POST(req: NextRequest) {
  try {
    const body: GenerateReceiptRequest = await req.json();
    const { image, fields } = body;

    if (!image) {
      return NextResponse.json(
        { success: false, error: 'Se requiere la imagen original del recibo.' },
        { status: 400 }
      );
    }

    if (!fields || !fields.amount) {
      return NextResponse.json(
        {
          success: false,
          error: 'Se requiere el monto para generar el comprobante.',
        },
        { status: 400 }
      );
    }

    const result = await generateReceiptImage({ image, fields });
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API Error in generate-receipt:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al procesar la solicitud con GPT Image.' },
      { status: 500 }
    );
  }
}
