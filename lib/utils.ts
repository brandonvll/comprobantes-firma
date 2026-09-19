import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ReceiptFields } from '@/types/receipt';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Converts a data URL (base64 or remote URL) to a Blob.
 */
async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  if (dataUrl.startsWith('data:')) {
    const res = await fetch(dataUrl);
    return res.blob();
  }
  // Remote URL
  const res = await fetch(dataUrl);
  return res.blob();
}

/**
 * Detects if the browser is iOS Safari (iPhone/iPad).
 */
function isIOSSafari(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  return isIOS;
}

/**
 * Downloads an image with full iOS/Safari compatibility.
 * On iOS Safari, <a download> doesn't work — we use the Web Share API
 * to let the user save directly to Photos or Files app.
 * Falls back to opening in a new tab if Web Share isn't available.
 */
export async function downloadImage(dataUrl: string, filename: string = 'comprobante-modificado.png') {
  try {
    const blob = await dataUrlToBlob(dataUrl);
    const file = new File([blob], filename, { type: blob.type || 'image/png' });

    // iOS: Use Web Share API which allows saving to Photos/Files
    if (isIOSSafari() && navigator.share) {
      try {
        await navigator.share({
          files: [file],
          title: filename,
        });
        return; // Success via share
      } catch (shareErr: any) {
        // User cancelled or share failed — fall through to blob URL approach
        if (shareErr.name === 'AbortError') return; // User cancelled intentionally
      }
    }

    // Desktop & Android: Standard blob download
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    // Cleanup after a short delay
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    }, 300);
  } catch (err) {
    // Last resort fallback: open in new tab so user can long-press to save
    console.error('Download failed, opening in new tab:', err);
    const blob = await dataUrlToBlob(dataUrl);
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, '_blank');
  }
}

export function formatCurrencyString(val: string): string {
  if (!val) return val;
  // Strip non-digits except decimal point
  const cleanNum = val.replace(/[^0-9.]/g, '');
  if (!cleanNum) return val;

  const parts = cleanNum.split('.');
  const integerPart = parts[0];
  let decimalPart = parts.length > 1 ? parts.slice(1).join('') : null;

  if (integerPart) {
    const formattedInt = Number(integerPart).toLocaleString('en-US');
    const formattedDec = decimalPart !== null ? decimalPart.padEnd(2, '0').slice(0, 2) : '00';
    return `$${formattedInt}.${formattedDec}`;
  }
  return val;
}
