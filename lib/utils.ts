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
          <text x="40" y="45" font-family="'Helvetica Neue', Arial, sans-serif" font-size="19" font-weight="bold" fill="#002d72" letter-spacing="1">BANK OF AMERICA</text>
          
          <!-- Authentic Bank of America Red Flag Symbol -->
          <g transform="translate(252, 28)">
            <!-- Top slants -->
            <polygon points="0,0 9,0 5,7 0,7" fill="#d4001a"/>
            <polygon points="12,0 21,0 17,7 12,7" fill="#d4001a"/>
            <polygon points="24,0 33,0 29,7 24,7" fill="#d4001a"/>
            <!-- Bottom slants -->
            <polygon points="3,9 12,9 8,16 3,16" fill="#d4001a"/>
            <polygon points="15,9 24,9 20,16 15,16" fill="#d4001a"/>
            <polygon points="27,9 36,9 32,16 27,16" fill="#d4001a"/>
          </g>
          
          <!-- Client Receipt centered in header -->
          <text x="510" y="45" font-family="'Helvetica Neue', Arial, sans-serif" font-size="16" fill="#1e293b" text-anchor="middle">Client Receipt</text>
          
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
  const time = fields.time || '11:02';

  const chaseSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="500" height="920" viewBox="0 0 500 920">
      <defs>
        <filter id="receipt-shadow">
          <feDropShadow dx="3" dy="5" stdDeviation="7" flood-opacity="0.35"/>
        </filter>
      </defs>

      <!-- Wood background table surface -->
      <rect width="500" height="920" fill="#2b231f"/>

      <!-- Vertical thermal paper strip with realistic curl/shadow -->
      <g transform="translate(60, 25) rotate(-0.3, 190, 430)" filter="url(#receipt-shadow)">
        <rect width="380" height="870" fill="#fdfdfd" rx="2"/>

        <!-- Top paper subtle jagged edge line -->
        <path d="M 0 0 Q 95 -4 190 0 T 380 0 L 380 870 L 0 870 Z" fill="#fdfdfd"/>

        <!-- Header Chase Logo (Bold text + Octagon Symbol) -->
        <g transform="translate(100, 40)">
          <text x="0" y="24" font-family="'Helvetica Neue', Arial, sans-serif" font-size="28" font-weight="900" fill="#18181b" letter-spacing="2">CHASE</text>
          <!-- Chase Octagon symbol -->
          <g transform="translate(132, 2)">
            <polygon points="0,0 12,0 12,5 5,12 0,12" fill="#18181b"/>
            <polygon points="16,0 28,0 28,12 23,12 23,5" fill="#18181b"/>
            <polygon points="28,16 28,28 16,28 16,23 23,23" fill="#18181b"/>
            <polygon points="12,28 0,28 0,16 5,16 5,23" fill="#18181b"/>
          </g>
        </g>

        <!-- Thermal Printed Body Text -->
        <g font-family="'Courier New', monospace" font-size="12" fill="#262626" letter-spacing="0">
          <!-- ATM Header subtitle -->
          <text x="190" y="95" text-anchor="middle">Deposit cash or checks</text>
          <text x="190" y="110" text-anchor="middle">at most Chase ATMs.</text>
          <text x="190" y="125" text-anchor="middle">An image of your check can</text>
          <text x="190" y="140" text-anchor="middle">be printed on your receipt.</text>

          <!-- Section title -->
          <text x="190" y="172" font-weight="bold" text-anchor="middle">My Transaction Summary</text>
          <text x="30" y="187">*********************************************</text>

          <!-- Transacción #31 -->
          <text x="35" y="215">Transacción #31</text>
          <text x="35" y="233">Número de cuenta que termina en:    5091</text>
          <text x="35" y="251">Retiro de cuenta</text>
          <text x="345" y="251" text-anchor="end" font-weight="bold">${amount}</text>
          <text x="35" y="269">de cheques</text>

          <!-- Dotted Divider -->
          <text x="30" y="295">.............................................</text>

          <!-- Transacción #32 -->
          <text x="35" y="323">Transacción #32</text>
          <text x="35" y="341">Número de cuenta que termina en:    ${account}</text>
          <text x="35" y="359">Depósito en cuenta</text>
          <text x="345" y="359" text-anchor="end" font-weight="bold">${amount}</text>
          <text x="35" y="377">de cheques</text>

          <!-- Pagar en -->
          <text x="35" y="415" font-weight="bold">Pagar en</text>
          <text x="345" y="415" text-anchor="end" font-weight="bold">${amount}</text>

          <!-- Revision notice -->
          <text x="35" y="450">Es posible que una revisión adicional</text>
          <text x="35" y="468">resulte en una demora en la</text>
          <text x="35" y="486">disponibilidad de este depósito</text>

          <!-- Dotted Divider -->
          <text x="30" y="512">.............................................</text>

          <!-- Branch & Support -->
          <text x="190" y="540" text-anchor="middle">JPMorgan Chase Bank, N.A.</text>
          <text x="190" y="558" text-anchor="middle">Hunters Point, Branch 000748</text>
          <text x="190" y="576" text-anchor="middle">1-800-935-9935</text>
          <text x="190" y="594" text-anchor="middle">Your satisfaction matters. Share your</text>
          <text x="190" y="612" text-anchor="middle">feedback at: chase.com/sendusfeedback</text>

          <!-- Member info -->
          <text x="190" y="648" text-anchor="middle">Member FDIC, Equal Housing Lender</text>
          <text x="190" y="666" font-weight="bold" text-anchor="middle">Please keep your receipt</text>
          <text x="190" y="688" font-size="14" font-weight="bold" text-anchor="middle">${date} ${time}</text>

          <!-- Business Date & Teller notes -->
          <text x="35" y="730">Business Date 07/27/2026</text>
          <text x="35" y="748">Session #14</text>

          <text x="35" y="790">Thank you - Sam</text>
          <text x="35" y="808">Cashbox #10</text>
        </g>
      </g>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(chaseSvg)))}`;
}
