import { ReceiptTemplate } from '@/types/template';
import { formatCurrencyString } from '@/lib/utils';

export const chaseTemplate: ReceiptTemplate = {
  config: {
    id: 'chase',
    name: 'Chase',
    color: 'bg-blue-600',
  },
  fields: [
    { id: 'transaction', label: 'Transacción #', type: 'text', placeholder: 'ej. 112', defaultValue: '112' },
    { id: 'account', label: 'Cuenta (últimos 4)', type: 'text', placeholder: 'ej. 2274', defaultValue: '2274' },
    { id: 'amount', label: 'Monto del depósito', type: 'currency', placeholder: '$0.00', defaultValue: '$3,000.00' },
    { id: 'date', label: 'Fecha', type: 'date', placeholder: 'MM/DD/YYYY', defaultValue: '09/17/2026' },
    { id: 'time', label: 'Hora', type: 'time', placeholder: 'HH:MM', defaultValue: '12:40' },
    { id: 'branch', label: 'Branch', type: 'text', placeholder: 'ej. Hunters Point', defaultValue: 'Hunters Point' },
    { id: 'branchNumber', label: 'Branch #', type: 'text', placeholder: 'ej. 000748', defaultValue: '000748' },
    { id: 'session', label: 'Session #', type: 'text', placeholder: 'ej. 54', defaultValue: '54' },
    { id: 'cashier', label: 'Cajero (nombre)', type: 'text', placeholder: 'ej. Sam', defaultValue: 'Sam' },
    { id: 'cashbox', label: 'Cashbox #', type: 'text', placeholder: 'ej. 10', defaultValue: '10' },
  ],
  buildPrompt: (fields) => `
ESTRICTO: Modifica los siguientes campos en la imagen para un comprobante de Chase Bank respetando el formato, estilo, fuente, perspectiva y sombras del recibo original.
NO ALTERES el fondo, la mesa, el logo de CHASE ni el octágono azul.
NO ALTERES el texto fijo como "Deposit cash or checks", "My Transaction Summary", "JPMorgan Chase Bank, N.A.", "Member FDIC", etc.
SOLO modifica los valores dinámicos:
- Cambia "Transacción #" por: ${fields.transaction}
- Cambia los últimos 4 dígitos de cuenta (Número de cuenta que termina en) por: ${fields.account}
- Cambia el monto de "Depósito en cuenta de cheques" por: ${fields.amount}
- Cambia el monto de "Pagar en" por: ${fields.amount}
- Cambia la fecha (formato MM/DD/YYYY) por: ${fields.date}
- Cambia la hora (junto a la fecha) por: ${fields.time}
- Cambia el nombre del Branch por: ${fields.branch}, Branch ${fields.branchNumber}
- Cambia "Business Date" por: ${fields.date}
- Cambia "Session #" por: ${fields.session}
- Cambia el nombre del cajero ("Thank you - ") por: ${fields.cashier}
- Cambia "Cashbox #" por: ${fields.cashbox}
MANTÉN EL 100% DE LA FOTOGRAFÍA ORIGINAL DE REFERENCIA SIN ALTERAR EL LOGO BANCARIO NI EL FONDO DE LA MESA.
  `,
  detect: (rawText) => {
    const text = rawText.toLowerCase();
    return text.includes('chase') || text.includes('jpmorgan') || text.includes('my transaction summary');
  },
  mapFields: (extractedData: any) => {
    return {
      transaction: extractedData.transaction || '112',
      account: extractedData.account || '2274',
      amount: extractedData.amount || '$3,000.00',
      date: extractedData.date || '09/17/2026',
      time: extractedData.time || '12:40',
      branch: extractedData.branch || 'Hunters Point',
      branchNumber: extractedData.branchNumber || '000748',
      session: extractedData.session || '54',
      cashier: extractedData.cashier || 'Sam',
      cashbox: extractedData.cashbox || '10',
    };
  },
  mockSvg: (baseImageDataUrl, fields) => {
    const transaction = fields.transaction || '112';
    const account = fields.account || '2274';
    const amount = formatCurrencyString(fields.amount || '$3,000.00');
    const date = fields.date || '09/17/2026';
    const time = fields.time || '12:40';
    const branch = fields.branch || 'Hunters Point';
    const branchNumber = fields.branchNumber || '000748';
    const session = fields.session || '54';
    const cashier = fields.cashier || 'Sam';
    const cashbox = fields.cashbox || '10';
    const isDataOrPath = Boolean(baseImageDataUrl && (baseImageDataUrl.startsWith('data:') || baseImageDataUrl.startsWith('/') || baseImageDataUrl.startsWith('http')));
    const bgImage = isDataOrPath ? baseImageDataUrl : '/Chase/chase-base-receipt.png';

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="800" height="1600" viewBox="0 0 800 1600">
        <image href="${bgImage}" x="0" y="0" width="800" height="1600" preserveAspectRatio="xMidYMid meet"/>
        
        <!-- Overlay patches on top of original photo -->
        
        <!-- Transaction # patch -->
        <rect x="340" y="338" width="55" height="22" fill="#f0efe9" opacity="0.95"/>
        <text x="342" y="355" font-family="'Courier New', monospace" font-size="15" font-weight="bold" fill="#222">#${transaction}</text>

        <!-- Account last 4 patch -->
        <rect x="560" y="360" width="55" height="22" fill="#f0efe9" opacity="0.95"/>
        <text x="562" y="377" font-family="'Courier New', monospace" font-size="15" font-weight="bold" fill="#222">${account}</text>

        <!-- Deposit amount patch -->
        <rect x="500" y="382" width="120" height="22" fill="#f0efe9" opacity="0.95"/>
        <text x="502" y="399" font-family="'Courier New', monospace" font-size="15" font-weight="bold" fill="#222">${amount}</text>

        <!-- Pagar en amount patch -->
        <rect x="500" y="438" width="120" height="22" fill="#f0efe9" opacity="0.95"/>
        <text x="502" y="455" font-family="'Courier New', monospace" font-size="15" font-weight="bold" fill="#222">${amount}</text>

        <!-- Branch name patch -->
        <rect x="240" y="605" width="330" height="22" fill="#f0efe9" opacity="0.95"/>
        <text x="242" y="622" font-family="'Courier New', monospace" font-size="13" fill="#222">${branch}, Branch ${branchNumber}</text>

        <!-- Date & Time patch (under Member FDIC) -->
        <rect x="290" y="700" width="195" height="22" fill="#f0efe9" opacity="0.95"/>
        <text x="292" y="717" font-family="'Courier New', monospace" font-size="14" font-weight="bold" fill="#222">${date} ${time}</text>

        <!-- Business Date patch -->
        <rect x="300" y="740" width="170" height="22" fill="#f0efe9" opacity="0.95"/>
        <text x="302" y="757" font-family="'Courier New', monospace" font-size="14" font-weight="bold" fill="#222">${date}</text>

        <!-- Session # patch -->
        <rect x="225" y="770" width="45" height="22" fill="#f0efe9" opacity="0.95"/>
        <text x="227" y="787" font-family="'Courier New', monospace" font-size="14" font-weight="bold" fill="#222">#${session}</text>

        <!-- Cashier name patch -->
        <rect x="310" y="815" width="80" height="22" fill="#f0efe9" opacity="0.95"/>
        <text x="312" y="832" font-family="'Courier New', monospace" font-size="15" font-weight="bold" fill="#222">${cashier}</text>

        <!-- Cashbox # patch -->
        <rect x="250" y="845" width="45" height="22" fill="#f0efe9" opacity="0.95"/>
        <text x="252" y="862" font-family="'Courier New', monospace" font-size="14" font-weight="bold" fill="#222">#${cashbox}</text>
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
  }
};
