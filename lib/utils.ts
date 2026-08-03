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

export function downloadImage(dataUrl: string, filename: string = 'comprobante-modificado.png') {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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

/**
 * Creates a photorealistic preview SVG data URL representing the modified receipt
 * when running in fallback/demo mode.
 */
export function createMockReceiptDataUrl(baseImageDataUrl: string, fields: ReceiptFields): string {
  const isDataOrPath = Boolean(baseImageDataUrl && (baseImageDataUrl.startsWith('data:') || baseImageDataUrl.startsWith('/') || baseImageDataUrl.startsWith('http')));

  if (fields.bankType === 'zelle') {
    const rawAmount = fields.amount || '$125.00';
    const amount = formatCurrencyString(rawAmount);
    const recipientName = fields.recipientName || 'Felipe Gonzalez';
    const contactInfo = fields.contactInfo || '(407) 415-4294';
    const firstName = recipientName.trim().split(' ')[0] || 'Felipe';
    const bgImage = isDataOrPath ? baseImageDataUrl : '/Zelle/WhatsApp%20Image%202026-08-02%20at%205.48.31%20PM.jpeg';

    const zelleSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="576" height="1024" viewBox="0 0 576 1024">
        <!-- 100% REAL ORIGINAL PHOTO AS BACKGROUND -->
        <image href="${bgImage}" x="0" y="0" width="576" height="1024" preserveAspectRatio="none"/>
        
        <!-- Overlay patches for modified fields on top of original photo -->
        <!-- Subtitle message patch -->
        <rect x="70" y="196" width="436" height="46" fill="#ffffff"/>
        <text x="288" y="214" font-family="system-ui, -apple-system, sans-serif" font-size="14" fill="#334155" text-anchor="middle">Estamos enviando tu dinero ahora. ${recipientName}</text>
        <text x="288" y="232" font-family="system-ui, -apple-system, sans-serif" font-size="14" fill="#334155" text-anchor="middle">Zelle lo recibirá en unos minutos.</text>
        
        <!-- Amount patch (Regular font weight) -->
        <rect x="120" y="260" width="336" height="60" fill="#ffffff"/>
        <text x="288" y="306" font-family="system-ui, -apple-system, sans-serif" font-size="36" font-weight="400" fill="#0f172a" text-anchor="middle">${amount}</text>
        
        <!-- Recipient & Registered Name patch -->
        <rect x="80" y="415" width="416" height="75" fill="#ffffff"/>
        <text x="288" y="434" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="600" fill="#0f172a" text-anchor="middle">${recipientName} Zelle</text>
        <text x="288" y="454" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="#64748b" text-anchor="middle">Registrado como ${recipientName.toUpperCase()}</text>
        <text x="288" y="472" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#475569" text-anchor="middle">${contactInfo}</text>
        
        <!-- Siri phrase patch -->
        <rect x="80" y="565" width="416" height="42" fill="#ffffff"/>
        <text x="288" y="580" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="#475569" text-anchor="middle">Agrega un acceso directo de Siri, como "Paga a ${firstName}", para</text>
        <text x="288" y="598" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="#475569" text-anchor="middle">ahorrar tiempo al enviar dinero</text>
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(zelleSvg)))}`;
  }

  if (fields.bankType === 'bofa') {
    const account = fields.account || '5441';
    const rawAmount = fields.amount || '$850.00';
    const amount = formatCurrencyString(rawAmount);
    const date = fields.date || '01/24/2026';
    const time = fields.time || '12:51 PM';
    const bgImage = isDataOrPath ? baseImageDataUrl : '/Bank%20of%20america/WhatsApp%20Image%202026-08-02%20at%206.19.16%20PM.jpeg';

    const bofaSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="576" viewBox="0 0 1024 576">
        <!-- 100% REAL ORIGINAL PHOTO AS BACKGROUND -->
        <image href="${bgImage}" x="0" y="0" width="1024" height="576" preserveAspectRatio="none"/>
        
        <!-- Overlay patches on top of original photo -->
        <!-- Date & Time patch -->
        <rect x="618" y="222" width="170" height="20" fill="#dfdfdd" opacity="0.97"/>
        <text x="620" y="236" font-family="'Courier New', monospace" font-size="13" font-weight="600" fill="#383838">${date} ${time}</text>
        
        <!-- Account patch -->
        <rect x="765" y="258" width="48" height="18" fill="#dfdfdd" opacity="0.97"/>
        <text x="766" y="271" font-family="'Courier New', monospace" font-size="13" font-weight="600" fill="#383838">${account}</text>

        <!-- Amount patches -->
        <rect x="710" y="276" width="90" height="18" fill="#dfdfdd" opacity="0.97"/>
        <text x="712" y="289" font-family="'Courier New', monospace" font-size="13" font-weight="600" fill="#383838">${amount}</text>

        <rect x="696" y="295" width="90" height="18" fill="#dfdfdd" opacity="0.97"/>
        <text x="698" y="308" font-family="'Courier New', monospace" font-size="13" font-weight="600" fill="#383838">${amount}</text>

        <!-- Transaction Posts On date patch -->
        <rect x="815" y="313" width="95" height="18" fill="#dfdfdd" opacity="0.97"/>
        <text x="816" y="326" font-family="'Courier New', monospace" font-size="13" font-weight="600" fill="#383838">${date}</text>
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(bofaSvg)))}`;
  }

  const account = fields.account || '2274';
  const rawAmount = fields.amount || '$3,000.00';
  const amount = formatCurrencyString(rawAmount);
  const date = fields.date || '07/25/2026';
  const time = fields.time || '11:02';
  const bgImage = isDataOrPath ? baseImageDataUrl : '/Chase/WhatsApp%20Image%202026-08-02%20at%205.50.22%20PM.jpeg';

  const chaseSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="1066" viewBox="0 0 800 1066">
      <!-- 100% REAL ORIGINAL PHOTO AS BACKGROUND -->
      <image href="${bgImage}" x="0" y="0" width="800" height="1066" preserveAspectRatio="none"/>
      
      <!-- Overlay patches on top of original photo -->
      <!-- Account patch -->
      <rect x="470" y="396" width="50" height="20" fill="#e8e8e6" opacity="0.97"/>
      <text x="472" y="411" font-family="'Courier New', monospace" font-size="13" font-weight="bold" fill="#222">${account}</text>

      <!-- Amount patches -->
      <rect x="430" y="413" width="95" height="20" fill="#e8e8e6" opacity="0.97"/>
      <text x="432" y="428" font-family="'Courier New', monospace" font-size="14" font-weight="bold" fill="#222">${amount}</text>

      <rect x="430" y="468" width="95" height="22" fill="#e8e8e6" opacity="0.97"/>
      <text x="432" y="484" font-family="'Courier New', monospace" font-size="15" font-weight="bold" fill="#222">${amount}</text>

      <!-- Date & Time patch -->
      <rect x="285" y="750" width="165" height="24" fill="#e8e8e6" opacity="0.97"/>
      <text x="287" y="767" font-family="'Courier New', monospace" font-size="14" font-weight="bold" fill="#222">${date} ${time}</text>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(chaseSvg)))}`;
}
