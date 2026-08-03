import { NextRequest, NextResponse } from 'next/server';
import { analyzeReceiptWithVision } from '@/services/visionService';

export async function POST(req: NextRequest) {
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
