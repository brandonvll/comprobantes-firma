import { getOpenAIClient } from '@/lib/openai';
import { GenerateReceiptRequest, GenerateReceiptResponse } from '@/types/receipt';
import { toFile } from 'openai';
import { templates } from '@/templates/registry';
import { processImageInput } from '@/lib/imageUtils';

export async function generateReceiptImage(
  request: GenerateReceiptRequest
): Promise<GenerateReceiptResponse> {
  const { image, fields, templateId } = request;
  
  const activeTemplate = templates[templateId] || templates['chase'];
  const prompt = activeTemplate.buildPrompt(fields);

  // Normalize image input (handles data URLs, relative paths like /Chase/..., and remote URLs)
  let processedImage;
  try {
    processedImage = await processImageInput(image);
  } catch (err: any) {
    console.error('Error processing input image:', err);
    return {
      success: false,
      error: `Error procesando la imagen de entrada: ${err.message}`,
    };
  }

  const openai = getOpenAIClient();

  // Check if API key is configured
  if (!openai) {
    console.warn('OPENAI_API_KEY no encontrada. Generando comprobante sintético en modo simulación.');
    const mockUrl = activeTemplate.mockSvg(processedImage.dataUrl, fields);
    return {
      success: true,
      imageUrl: mockUrl,
      promptUsed: prompt,
      isMock: true,
    };
  }

  try {
    // Create official OpenAI file with matching filename and MIME type
    const imageFile = await toFile(processedImage.buffer, processedImage.filename, {
      type: processedImage.mimeType,
    });

    const response = await openai.images.edit({
      model: 'gpt-image-2',
      image: imageFile,
      prompt: prompt,
      n: 1,
      size: '1024x1024',
    });

    // gpt-image-2 returns b64_json by default
    const b64Data = response?.data?.[0]?.b64_json;
    const urlData = response?.data?.[0]?.url;
    
    let generatedUrl: string;
    if (b64Data) {
      generatedUrl = `data:image/png;base64,${b64Data}`;
    } else if (urlData) {
      generatedUrl = urlData;
    } else {
      throw new Error('No se recibió la imagen editada por OpenAI.');
    }

    return {
      success: true,
      imageUrl: generatedUrl,
      promptUsed: prompt,
      isMock: false,
    };
  } catch (error: any) {
    console.error('Error en OpenAI images.edit:', error);
    
    // Fallback to SVG mock using normalized base64 Data URL
    const fallbackMockUrl = activeTemplate.mockSvg(processedImage.dataUrl, fields);
    return {
      success: true,
      imageUrl: fallbackMockUrl,
      promptUsed: prompt,
      isMock: true,
      error: `OpenAI API: ${error.message || 'Error desconocido'}. Se muestra resultado simulado.`,
    };
  }
}
