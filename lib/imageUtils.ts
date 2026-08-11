import fs from 'fs';
import path from 'path';

export interface ProcessedImage {
  buffer: Buffer;
  mimeType: string;
  filename: string;
  dataUrl: string;
}

/**
 * Normalizes any image input (data URL, relative path, or http URL) into
 * a valid Buffer, correct MIME type, extension filename, and base64 data URL.
 */
export async function processImageInput(imageInput: string): Promise<ProcessedImage> {
  if (!imageInput) {
    throw new Error('La imagen de entrada está vacía.');
  }

  // 1. Handle Base64 Data URL (e.g. data:image/jpeg;base64,...)
  if (imageInput.startsWith('data:')) {
    const matches = imageInput.match(/^data:(image\/(jpeg|jpg|png|webp));base64,/i);
    let mimeType = 'image/jpeg';
    let ext = 'jpg';

    if (matches && matches[1]) {
      const rawMime = matches[1].toLowerCase();
      if (rawMime.includes('png')) {
        mimeType = 'image/png';
        ext = 'png';
      } else if (rawMime.includes('webp')) {
        mimeType = 'image/webp';
        ext = 'webp';
      } else {
        mimeType = 'image/jpeg';
        ext = 'jpg';
      }
    }

    const base64Data = imageInput.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    return {
      buffer,
      mimeType,
      filename: `receipt.${ext}`,
      dataUrl: imageInput,
    };
  }

  // 2. Handle Relative Path or Local File (e.g. /Chase/WhatsApp%20Image...)
  if (imageInput.startsWith('/') || !imageInput.startsWith('http')) {
    const cleanPath = decodeURIComponent(imageInput.split('?')[0]);
    
    // Try resolving in public folder first
    let filePath = path.join(process.cwd(), 'public', cleanPath);
    if (!fs.existsSync(filePath)) {
      filePath = path.join(process.cwd(), cleanPath);
    }

    if (fs.existsSync(filePath)) {
      const buffer = fs.readFileSync(filePath);
      const fileExt = path.extname(filePath).toLowerCase().replace('.', '') || 'jpg';
      let mimeType = 'image/jpeg';
      let ext = 'jpg';

      if (fileExt === 'png') {
        mimeType = 'image/png';
        ext = 'png';
      } else if (fileExt === 'webp') {
        mimeType = 'image/webp';
        ext = 'webp';
      }

      const dataUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;
      return {
        buffer,
        mimeType,
        filename: `receipt.${ext}`,
        dataUrl,
      };
    }
  }

  // 3. Handle Remote HTTP/HTTPS URL
  if (imageInput.startsWith('http')) {
    const res = await fetch(imageInput);
    if (!res.ok) {
      throw new Error(`No se pudo descargar la imagen desde URL: ${res.statusText}`);
    }
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    let mimeType = 'image/jpeg';
    let ext = 'jpg';

    if (contentType.includes('png')) {
      mimeType = 'image/png';
      ext = 'png';
    } else if (contentType.includes('webp')) {
      mimeType = 'image/webp';
      ext = 'webp';
    }

    const dataUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;
    return {
      buffer,
      mimeType,
      filename: `receipt.${ext}`,
      dataUrl,
    };
  }

  throw new Error('Formato de imagen no soportado.');
}
