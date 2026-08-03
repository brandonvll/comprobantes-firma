import { getOpenAIClient } from '@/lib/openai';
import { GenerateReceiptRequest, GenerateReceiptResponse } from '@/types/receipt';
import { createMockReceiptDataUrl, formatCurrencyString } from '@/lib/utils';
import { toFile } from 'openai';

export function buildReceiptPrompt(fields: {
  bankType?: string;
  account?: string;
  amount: string;
  date?: string;
  time?: string;
  recipientName?: string;
  contactInfo?: string;
}): string {
  const formattedAmount = formatCurrencyString(fields.amount || '');

  if (fields.bankType === 'zelle') {
    const firstName = (fields.recipientName || 'Felipe').trim().split(' ')[0];
    return `Usa la captura de pantalla de Zelle proporcionada como referencia.

Regenera la imagen manteniendo exactamente la misma plantilla, colores, fuente, botones ("Añadir a Siri", "Listo", check verde) y diseño de Zelle.

Modifica únicamente estos valores:

1. Monto enviado:
${formattedAmount}

DETALLES OBLIGATORIOS DEL MONTO:
- El número del monto debe llevar comas para separar los miles (ejemplo exacto: $2,000.00 y NO $2000.00).
- GROSOR DE LA FUENTE DEL MONTO: El texto del monto $2,000.00 debe tener un grosor REGULAR / MEDIANO (normal font weight, no en negrita, no en bold grueso). Conserva exactamente el mismo peso de fuente ligero de la imagen de referencia original.

2. Nombre del destinatario / Registrado como:
${fields.recipientName || 'Felipe Gonzalez'}
(Reemplaza el nombre en AMBOS lugares de la imagen: en el texto "Estamos enviando tu dinero ahora. [Nombre] Zelle lo recibirá..." y en el campo "Registrado como [NOMBRE]").

3. Teléfono o Correo electrónico del destinatario:
${fields.contactInfo || ''}
(Reemplaza el número de teléfono o correo bajo el campo Registrado como).

4. Texto del acceso directo de Siri:
Actualiza el primer nombre en la frase de Siri: 'Agrega un acceso directo de Siri, como "Paga a ${firstName}", para ahorrar tiempo al enviar dinero'.

ELEMENTO CRÍTICO A CONSERVAR - BOTÓN AÑADIR A SIRI:
- Conserva el botón "Añadir a Siri" exactamente igual al original: recuadro blanco con borde sutil, esquinas redondeadas, texto en negrita "Añadir a Siri" y la esfera/ícono multicolor brillante característico de Siri a la izquierda del texto. NO elimines ni simplifiques la esfera multicolor de Siri.

IMPORTANTE: Zelle NO incluye fecha ni hora. No agregues fecha ni hora a la imagen.
No señales los cambios. No agregues marcas, flechas ni recuadros. Debe parecer una captura de pantalla 100% auténtica.`;
  }

  return `Usa la imagen proporcionada como referencia.

Regenera la fotografía manteniendo exactamente el mismo recibo.

Conserva:
perspectiva, iluminación, papel, sombras, calidad fotográfica, textura, posición, logotipo, fuente, espaciado.

Modifica únicamente estos valores:

Últimos cuatro números:
${fields.account || ''}

Monto:
${fields.amount || ''}

Fecha:
${fields.date || ''}

Hora:
${fields.time || ''}

No señales los cambios. No dibujes cuadros. No agregues flechas. No agregues marcas. No alteres ningún otro texto. Debe parecer una fotografía completamente auténtica.`;
}

export async function generateReceiptImage(
  request: GenerateReceiptRequest
): Promise<GenerateReceiptResponse> {
  const { image, fields } = request;
  const prompt = buildReceiptPrompt(fields);
  const openai = getOpenAIClient();

  // Check if API key is configured
  if (!openai) {
    console.warn('OPENAI_API_KEY no encontrada. Generando comprobante sintético en modo simulación.');
    const mockUrl = createMockReceiptDataUrl(image, fields);
    return {
      success: true,
      imageUrl: mockUrl,
      promptUsed: prompt,
      isMock: true,
    };
  }

  try {
    // Convert base64 data URL to buffer/file for OpenAI images.edit API
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Use official OpenAI toFile utility function
    const imageFile = await toFile(buffer, 'receipt.png', { type: 'image/png' });

    // Attempt OpenAI Images Edit API call
    try {
      const response = await openai.images.edit({
        image: imageFile,
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        response_format: 'url',
      });

      const generatedUrl = response?.data?.[0]?.url || response?.data?.[0]?.b64_json;
      if (!generatedUrl) {
        throw new Error('No se recibió la imagen generada por OpenAI.');
      }

      return {
        success: true,
        imageUrl: generatedUrl,
        promptUsed: prompt,
        isMock: false,
      };
    } catch (editError: any) {
      console.warn('Images edit endpoint fail, attempting DALL-E image generation with vision prompt:', editError?.message);

      // Alternative fallback using DALL-E-3 generation with photorealistic prompt
      const dallePrompt = `Photorealistic crisp high-resolution photo of a bank payment receipt on paper texture with realistic lighting and shadows. Bank receipt showing account **** ${fields.account}, total amount ${fields.amount}, date ${fields.date}, time ${fields.time}. Authentic camera photograph style.`;
      
      const dalleResponse = await openai.images.generate({
        model: 'dall-e-3',
        prompt: `${prompt}\n\n${dallePrompt}`,
        n: 1,
        size: '1024x1024',
        quality: 'hd',
      });

      const generatedUrl = dalleResponse?.data?.[0]?.url;
      if (!generatedUrl) {
        throw new Error('Falló la generación con DALL-E 3.');
      }

      return {
        success: true,
        imageUrl: generatedUrl,
        promptUsed: prompt,
        isMock: false,
      };
    }
  } catch (error: any) {
    console.error('Error generating receipt image:', error);
    
    // Fallback to high quality synthetic generator to ensure the user gets a working experience
    const fallbackMockUrl = createMockReceiptDataUrl(image, fields);
    return {
      success: true,
      imageUrl: fallbackMockUrl,
      promptUsed: prompt,
      isMock: true,
      error: `OpenAI API Note: ${error.message || 'Sin cuota o endpoint restringido'}. Se muestra resultado simulado de alta fidelidad.`,
    };
  }
}
