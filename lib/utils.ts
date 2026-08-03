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

  if (fields.bankType === 'bofa') {
    const account = fields.account || '5441';
    const rawAmount = fields.amount || '$850.00';
    const amount = formatCurrencyString(rawAmount);
    const date = fields.date || '01/24/2026';
    const time = fields.time || '12:51 PM';

    const bofaSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="800" height="480" viewBox="0 0 800 480">
        <defs>
          <filter id="paper-shadow">
            <feDropShadow dx="2" dy="4" stdDeviation="6" flood-opacity="0.3"/>
          </filter>
        </defs>
        <!-- Dark wood background -->
        <rect width="800" height="480" fill="#2b231f"/>
        
        <!-- White horizontal paper sheet -->
        <g transform="translate(40, 30) rotate(-0.5, 360, 210)" filter="url(#paper-shadow)">
          <rect width="720" height="420" fill="#fcfcfc" rx="2"/>
          
          <!-- Header -->
          <!-- Bank of America Logo -->
          <text x="40" y="45" font-family="'Helvetica Neue', Arial, sans-serif" font-size="20" font-weight="bold" fill="#002d72" letter-spacing="1">BANK OF AMERICA</text>
          <!-- Red flag symbol -->
          <g transform="translate(255, 27)">
            <polygon points="0,0 12,0 8,16 0,16" fill="#d4001a"/>
            <polygon points="12,0 24,0 20,16 9,16" fill="#d4001a"/>
            <polygon points="24,0 34,0 30,16 19,16" fill="#d4001a"/>
          </g>
          <!-- Client Receipt right aligned -->
          <text x="680" y="45" font-family="'Helvetica Neue', Arial, sans-serif" font-size="16" fill="#1e293b" text-anchor="end">Client Receipt</text>
          
          <!-- Divider line -->
          <line x1="40" y1="60" x2="680" y2="60" stroke="#000000" stroke-width="1.5"/>
          
          <!-- Left side thank you & disclosures -->
          <text x="40" y="85" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#1e293b">Thank you for banking with us today.</text>
          
          <text x="40" y="110" font-family="Arial, sans-serif" font-size="9" fill="#475569">To help protect you and us from losses if a check(s) is returned unpaid, all deposits are subject to a hold review at any time. It's important you know</text>
          <text x="40" y="122" font-family="Arial, sans-serif" font-size="9" fill="#475569">that deposit holds can result in a reduction of your available balance. For more information, please refer to your Deposit Agreement &amp; Disclosures at</text>
          <text x="40" y="134" font-family="Arial, sans-serif" font-size="9" fill="#475569">bankofamerica.com/deposits/resources/deposit-agreements.go.deposit.</text>
          
          <text x="40" y="158" font-family="Arial, sans-serif" font-size="9" fill="#475569">Please save this receipt until you see the transaction completed on</text>
          <text x="40" y="170" font-family="Arial, sans-serif" font-size="9" fill="#475569">your statement. Transactions are credited subject to verification,</text>
          <text x="40" y="182" font-family="Arial, sans-serif" font-size="9" fill="#475569">collection, and the terms of your account. Keep in mind,</text>
          <text x="40" y="194" font-family="Arial, sans-serif" font-size="9" fill="#475569">transactions made in a financial center on non-business days</text>
          <text x="40" y="206" font-family="Arial, sans-serif" font-size="9" fill="#475569">(Saturday, Sunday, and bank holidays) aren't processed until the</text>
          <text x="40" y="218" font-family="Arial, sans-serif" font-size="9" fill="#475569">next business day we're open.</text>
          
          <text x="40" y="244" font-family="Arial, sans-serif" font-size="9.5" font-weight="bold" fill="#1e293b">Visit bankofamerica.com to learn more about how you can</text>
          <text x="40" y="256" font-family="Arial, sans-serif" font-size="9.5" font-weight="bold" fill="#1e293b">receive money fast through electronic payment methods like</text>
          <text x="40" y="268" font-family="Arial, sans-serif" font-size="9.5" font-weight="bold" fill="#1e293b">direct deposit, Zelle®, ACH, and wires.</text>
          
          <text x="40" y="296" font-family="Arial, sans-serif" font-size="8" fill="#64748b">Zelle® and the Zelle related marks are wholly owned by Early Warning Services,</text>
          <text x="40" y="306" font-family="Arial, sans-serif" font-size="8" fill="#64748b">LLC and used herein under license. Terms and conditions apply.</text>
          
          <text x="40" y="326" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#334155">Member FDIC</text>
          <text x="40" y="340" font-family="Arial, sans-serif" font-size="9" fill="#64748b">95-14-2005B 07-2024</text>
          
          <!-- Right side transaction printout (dot matrix / thermal printer text) -->
          <g font-family="'Courier New', monospace" font-size="12" font-weight="600" fill="#383838">
            <text x="410" y="170">${date} ${time} Assoc: 771</text>
            <text x="410" y="188">NC Center: 0050900 Seq#: 067</text>
            <text x="410" y="206">Trans:Deposit Acct#: *********${account}</text>
            <text x="410" y="224">Trans Total: ${amount}</text>
            
            <text x="410" y="254">Chk Amt: ${amount}</text>
            <text x="410" y="272">Transaction Posts On: ${date}</text>
          </g>
        </g>
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(bofaSvg)))}`;
  }

  const account = fields.account || '2274';
  const rawAmount = fields.amount || '$3,000.00';
  const amount = formatCurrencyString(rawAmount);
  const date = fields.date || '07/25/2026';
  const time = fields.time || '11:02 AM';

  const chaseSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="750" viewBox="0 0 400 750">
      <rect width="400" height="750" fill="#1e293b"/>
      
      <!-- Vertical thermal paper strip -->
      <g transform="translate(30, 20)">
        <rect width="340" height="710" fill="#f8fafc" rx="4"/>
        
        <!-- Chase Logo -->
        <text x="170" y="55" font-family="'Helvetica Neue', Arial, sans-serif" font-size="22" font-weight="extrabold" fill="#00529b" text-anchor="middle" letter-spacing="2">CHASE</text>
        <rect x="235" y="38" width="18" height="18" fill="#00529b"/>
        
        <text x="170" y="85" font-family="'Courier New', monospace" font-size="10" fill="#64748b" text-anchor="middle">Deposit cash or checks</text>
        <text x="170" y="98" font-family="'Courier New', monospace" font-size="10" fill="#64748b" text-anchor="middle">at most Chase ATMs.</text>
        
        <text x="170" y="125" font-family="'Courier New', monospace" font-size="12" font-weight="bold" fill="#334155" text-anchor="middle">My Transaction Summary</text>
        <line x1="20" y1="135" x2="320" y2="135" stroke="#94a3b8" stroke-dasharray="3,3" stroke-width="1"/>
        
        <!-- Transaction details -->
        <text x="25" y="165" font-family="'Courier New', monospace" font-size="12" fill="#1e293b">Transacción #31</text>
        <text x="25" y="183" font-family="'Courier New', monospace" font-size="12" fill="#475569">Número de cuenta que termina en: ${account}</text>
        <text x="25" y="201" font-family="'Courier New', monospace" font-size="12" fill="#475569">Depósito en cuenta</text>
        <text x="315" y="201" font-family="'Courier New', monospace" font-size="14" font-weight="bold" fill="#0f172a" text-anchor="end">${amount}</text>
        
        <line x1="20" y1="230" x2="320" y2="230" stroke="#cbd5e1" stroke-dasharray="3,3" stroke-width="1"/>
        
        <text x="25" y="260" font-family="'Courier New', monospace" font-size="13" font-weight="bold" fill="#1e293b">Pagar en</text>
        <text x="315" y="260" font-family="'Courier New', monospace" font-size="16" font-weight="bold" fill="#0f172a" text-anchor="end">${amount}</text>
        
        <line x1="20" y1="290" x2="320" y2="290" stroke="#94a3b8" stroke-dasharray="3,3" stroke-width="1"/>
        
        <!-- Bottom info -->
        <text x="170" y="340" font-family="'Courier New', monospace" font-size="11" fill="#64748b" text-anchor="middle">JPMorgan Chase Bank, N.A.</text>
        <text x="170" y="358" font-family="'Courier New', monospace" font-size="11" fill="#64748b" text-anchor="middle">Member FDIC, Equal Housing Lender</text>
        <text x="170" y="380" font-family="'Courier New', monospace" font-size="12" font-weight="bold" fill="#334155" text-anchor="middle">Please keep your receipt</text>
        
        <text x="170" y="415" font-family="'Courier New', monospace" font-size="14" font-weight="bold" fill="#0f172a" text-anchor="middle">${date} ${time}</text>
      </g>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(chaseSvg)))}`;
}
