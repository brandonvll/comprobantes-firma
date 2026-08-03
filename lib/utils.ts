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
  if (fields.bankType === 'zelle') {
    const rawAmount = fields.amount || '$125.00';
    const amount = formatCurrencyString(rawAmount);
    const recipientName = fields.recipientName || 'Felipe Gonzalez';
    const contactInfo = fields.contactInfo || '(407) 415-4294';
    const initial = recipientName.charAt(0).toUpperCase() || 'F';

    const zelleSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="700" viewBox="0 0 400 700">
        <rect width="400" height="700" fill="#f8fafc"/>
        
        <!-- Header -->
        <text x="200" y="45" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="600" fill="#0f172a" text-anchor="middle">Confirmación</text>
        
        <!-- Green Checkmark Circle -->
        <circle cx="200" cy="110" r="28" fill="#16a34a"/>
        <path d="M188 110 L196 118 L212 102" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        
        <!-- Subtitle message -->
        <text x="200" y="165" font-family="system-ui, -apple-system, sans-serif" font-size="14" fill="#334155" text-anchor="middle">Estamos enviando tu dinero ahora. ${recipientName}</text>
        <text x="200" y="185" font-family="system-ui, -apple-system, sans-serif" font-size="14" fill="#334155" text-anchor="middle">Zelle lo recibirá en unos minutos.</text>
        
        <!-- Amount (Regular weight, not bold) -->
        <text x="200" y="245" font-family="system-ui, -apple-system, sans-serif" font-size="34" font-weight="400" fill="#0f172a" text-anchor="middle">${amount}</text>
        
        <!-- Avatar Circle -->
        <circle cx="200" cy="305" r="24" fill="#64748b"/>
        <text x="200" y="312" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="bold" fill="#ffffff" text-anchor="middle">${initial}</text>
        <!-- Zelle mini logo badge -->
        <circle cx="218" cy="320" r="8" fill="#7414ca"/>
        <text x="200" y="312" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="bold" fill="#ffffff" text-anchor="middle">${initial}</text>
        <!-- Zelle mini logo badge -->
        <circle cx="218" cy="320" r="8" fill="#7414ca"/>
        <text x="218" y="324" font-family="sans-serif" font-size="9" font-weight="bold" fill="#ffffff" text-anchor="middle">z</text>
        
        <!-- Recipient & Registered Name -->
        <text x="200" y="360" font-family="system-ui, -apple-system, sans-serif" font-size="17" font-weight="600" fill="#0f172a" text-anchor="middle">${recipientName} Zelle</text>
        <text x="200" y="382" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="#64748b" text-anchor="middle">Registrado como ${recipientName.toUpperCase()}</text>
        <text x="200" y="400" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#475569" text-anchor="middle">${contactInfo}</text>
        
        <!-- Siri section -->
        <text x="200" y="470" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="#475569" text-anchor="middle">Agrega un acceso directo de Siri, como "Paga a ${recipientName.split(' ')[0]}", para</text>
        <text x="200" y="488" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="#475569" text-anchor="middle">ahorrar tiempo al enviar dinero</text>
        
        <!-- Siri Button -->
        <rect x="100" y="510" width="200" height="40" rx="6" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
        <text x="200" y="535" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="bold" fill="#0f172a" text-anchor="middle">Añadir a Siri</text>
        
        <!-- Bottom Button -->
        <rect x="25" y="620" width="350" height="46" rx="8" fill="#0264d8"/>
        <text x="200" y="648" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="600" fill="#ffffff" text-anchor="middle">Listo</text>
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(zelleSvg)))}`;
  }

  const account = fields.account || '7842';
  const amount = fields.amount || '$1,250.00';
  const date = fields.date || '08/07/2026';
  const time = fields.time || '03:45 PM';

  const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="900" viewBox="0 0 600 900">
      <defs>
        <filter id="paper-texture">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" result="noise"/>
          <feDiffuseLighting in="noise" lighting-color="#fff" surfaceScale="2" result="light">
            <feDistantLight azimuth="60" elevation="50" />
          </feDiffuseLighting>
          <feBlend mode="multiply" in="SourceGraphic" in2="light" result="blend"/>
        </filter>
        <linearGradient id="vignette" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fdfbf7" />
          <stop offset="100%" stop-color="#e2ded4" />
        </linearGradient>
      </defs>
      
      <!-- Receipt Background with shadow & texture -->
      <rect width="600" height="900" fill="#1e293b"/>
      <rect x="50" y="40" width="500" height="820" rx="4" fill="url(#vignette)" filter="url(#paper-texture)"/>
      <rect x="50" y="40" width="500" height="820" rx="4" fill="none" stroke="#d1d5db" stroke-width="1"/>
      
      <!-- Bank Header Logo Mock -->
      <g transform="translate(240, 80)">
        <rect x="0" y="0" width="120" height="35" rx="6" fill="#00529b"/>
        <text x="60" y="24" font-family="'Courier New', monospace" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">BANK COMPROBANTE</text>
      </g>
      
      <!-- Receipt Info Text -->
      <text x="300" y="150" font-family="'Courier New', monospace" font-size="14" fill="#64748b" text-anchor="middle">COMPROBANTE DE TRANSACCION DEBITO</text>
      <line x1="90" y1="175" x2="510" y2="175" stroke="#94a3b8" stroke-dasharray="4,4" stroke-width="1.5"/>
      
      <!-- Details -->
      <text x="90" y="230" font-family="'Courier New', monospace" font-size="16" font-weight="bold" fill="#334155">ESTADO:</text>
      <text x="510" y="230" font-family="'Courier New', monospace" font-size="16" font-weight="bold" fill="#16a34a" text-anchor="end">EXITOSO / APROBADO</text>
      
      <!-- Modified Fields -->
      <text x="90" y="290" font-family="'Courier New', monospace" font-size="16" fill="#475569">CUENTA DESTINO:</text>
      <text x="510" y="290" font-family="'Courier New', monospace" font-size="18" font-weight="bold" fill="#0f172a" text-anchor="end">**** ${account}</text>
      
      <text x="90" y="360" font-family="'Courier New', monospace" font-size="16" fill="#475569">MONTO TOTAL:</text>
      <text x="510" y="360" font-family="'Courier New', monospace" font-size="22" font-weight="bold" fill="#0f172a" text-anchor="end">${amount}</text>
      
      <text x="90" y="430" font-family="'Courier New', monospace" font-size="16" fill="#475569">FECHA:</text>
      <text x="510" y="430" font-family="'Courier New', monospace" font-size="16" font-weight="bold" fill="#0f172a" text-anchor="end">${date}</text>
      
      <text x="90" y="500" font-family="'Courier New', monospace" font-size="16" fill="#475569">HORA:</text>
      <text x="510" y="500" font-family="'Courier New', monospace" font-size="16" font-weight="bold" fill="#0f172a" text-anchor="end">${time}</text>
      
      <line x1="90" y1="540" x2="510" y2="540" stroke="#94a3b8" stroke-dasharray="4,4" stroke-width="1.5"/>
      
      <!-- Reference & Security -->
      <text x="90" y="590" font-family="'Courier New', monospace" font-size="14" fill="#64748b">NO. REFERENCIA:</text>
      <text x="510" y="590" font-family="'Courier New', monospace" font-size="14" fill="#334155" text-anchor="end">REF-984201948271</text>
      
      <text x="90" y="640" font-family="'Courier New', monospace" font-size="14" fill="#64748b">TIPO DE OPERACION:</text>
      <text x="510" y="640" font-family="'Courier New', monospace" font-size="14" fill="#334155" text-anchor="end">TRANSFERENCIA INTERBANCARIA</text>
      
      <line x1="90" y1="680" x2="510" y2="680" stroke="#cbd5e1" stroke-width="1"/>
      
      <!-- Barcode simulation -->
      <g transform="translate(150, 720)">
        <rect x="0" y="0" width="300" height="40" fill="#000" fill-opacity="0.85"/>
        <rect x="10" y="0" width="8" height="40" fill="#fff"/>
        <rect x="25" y="0" width="14" height="40" fill="#fff"/>
        <rect x="45" y="0" width="6" height="40" fill="#fff"/>
        <rect x="65" y="0" width="18" height="40" fill="#fff"/>
        <rect x="95" y="0" width="10" height="40" fill="#fff"/>
        <rect x="115" y="0" width="6" height="40" fill="#fff"/>
        <rect x="135" y="0" width="22" height="40" fill="#fff"/>
        <rect x="170" y="0" width="8" height="40" fill="#fff"/>
        <rect x="190" y="0" width="15" height="40" fill="#fff"/>
        <rect x="220" y="0" width="6" height="40" fill="#fff"/>
        <rect x="240" y="0" width="18" height="40" fill="#fff"/>
        <rect x="270" y="0" width="10" height="40" fill="#fff"/>
      </g>
      <text x="300" y="785" font-family="'Courier New', monospace" font-size="12" fill="#64748b" text-anchor="middle">* GPT IMAGE AI SYNTHESIZED *</text>
      <text x="300" y="820" font-family="'Courier New', monospace" font-size="11" fill="#94a3b8" text-anchor="middle">Conserva textura, iluminación y perspectiva original</text>
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgContent)))}`;
}
