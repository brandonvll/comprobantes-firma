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

  if (fields.bankType === 'bofa') {
    return `Usa la fotografía del comprobante de Bank of America proporcionada como referencia.

Regenera la fotografía manteniendo exactamente la misma hoja de papel horizontal de Bank of America ("Client Receipt"), la textura de madera del fondo, la iluminación y la inclinación de la foto.

Modifica únicamente estos valores en la sección de texto impreso a la derecha:

1. Número de cuenta:
Modifica los últimos dígitos en "Trans:Deposit Acct#: *********${fields.account || '5441'}"

2. Monto total:
Modifica los montos en "Trans Total: ${formattedAmount}" y "Chk Amt: ${formattedAmount}"

3. Fecha y Hora:
Modifica la fecha y hora impresas arriba por "${fields.date || '01/24/2026'} ${fields.time || '12:51'}"
Modifica la fecha en "Transaction Posts On: ${fields.date || '01/25/2026'}"

Conserva intacto el logotipo "BANK OF AMERICA" con su símbolo oficial de bandera roja de franjas diagonales a la izquierda.
POSICIÓN DEL ENCABEZADO: El texto "Client Receipt" debe ir ubicado en el CENTRO del encabezado (al lado del logo de Bank of America, NO al extremo derecho).
IMPORTANTE: Mantén el bloque de texto impreso a la derecha alineado hacia el centro de la hoja para garantizar un margen derecho amplio y limpio, evitando que los números finales (cuenta y fecha) se recorten o queden pegados al borde.
No señales los cambios. No dibujes cuadros. No agregues flechas. Debe parecer una fotografía 100% auténtica.`;
  }

  if (fields.bankType === 'chase') {
    return `Usa la fotografía del recibo térmico de Chase Bank proporcionada como referencia.

Regenera la fotografía manteniendo exactamente la misma tira de papel térmico vertical de Chase recostada sobre la superficie de madera, la perspectiva, iluminación y tipografía de impresora térmica.

Modifica únicamente estos valores:

1. Número de cuenta:
Modifica los últimos dígitos finales de la cuenta en "Número de cuenta que termina en: ${fields.account || '2274'}"

2. Monto de la transacción:
Modifica el monto en "Depósito en cuenta ${formattedAmount}" y en "Pagar en ${formattedAmount}"

3. Fecha y Hora:
Modifica la fecha y hora al final del comprobante por "${fields.date || '07/25/2026'} ${fields.time || '11:02'}"

Conserva intacto el logo de CHASE (texto y símbolo de octágono), los textos "My Transaction Summary", la información de la sucursal Hunters Point, "Business Date" y "Thank you - Sam".
No señales los cambios. No dibujes cuadros. No agregues flechas. Debe parecer una fotografía 100% auténtica.`;
  }

  return `Usa la imagen proporcionada como referencia.

Regenera la fotografía manteniendo exactamente el mismo recibo.

Conserva:
perspectiva, iluminación, papel, sombras, calidad fotográfica, textura, posición, logotipo, fuente, espaciado.

Modifica únicamente estos valores:

Últimos cuatro números:
${fields.account || ''}

Monto:
${formattedAmount}

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

    // Attempt OpenAI Images Edit API call (passing model: 'dall-e-2')
    try {
      const response = await openai.images.edit({
        model: 'dall-e-2',
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
      console.warn('Images edit endpoint fail, attempting DALL-E image generation fallback:', editError?.message);

      // Alternative fallback using DALL-E generation
      let generatedUrl: string | undefined;
      
      try {
        const dalleResponse = await openai.images.generate({
          model: 'dall-e-3',
          prompt: `${prompt}\n\nPhotorealistic crisp high-resolution photo of a bank receipt on paper texture with realistic lighting and shadows.`,
          n: 1,
          size: '1024x1024',
          quality: 'hd',
        });
        generatedUrl = dalleResponse?.data?.[0]?.url;
      } catch (dalle3Error: any) {
        console.warn('DALL-E 3 fallback failed, trying DALL-E 2 generation:', dalle3Error?.message);
        const dalle2Response = await openai.images.generate({
          model: 'dall-e-2',
          prompt: prompt.slice(0, 950),
          n: 1,
          size: '1024x1024',
        });
        generatedUrl = dalle2Response?.data?.[0]?.url;
      }

      if (!generatedUrl) {
        throw new Error('Falló la generación con DALL-E.');
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
