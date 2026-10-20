import { ReceiptTemplate } from '@/types/template';
import { formatCurrencyString } from '@/lib/utils';

export const chase2Template: ReceiptTemplate = {
  config: {
    id: 'chase2',
    name: 'Chase 2',
    color: 'bg-blue-600',
  },
  fields: [
    { id: 'account', label: 'Cuenta (últimos 4)', type: 'text', placeholder: 'ej. 2274', defaultValue: '2274' },
    { id: 'amount', label: 'Monto del depósito', type: 'currency', placeholder: '$0.00', defaultValue: '$2,900.00' },
    { id: 'date', label: 'Fecha', type: 'date', placeholder: 'MM/DD/YYYY', defaultValue: '10/20/2026' },
    { id: 'time', label: 'Hora', type: 'time', placeholder: 'HH:MM', defaultValue: '09:53' },
  ],
  buildPrompt: (fields) => `
ESTRICTO: Modifica los siguientes campos en la imagen para un comprobante de Chase Bank respetando el formato, estilo, fuente, perspectiva y sombras del recibo original.
NO ALTERES el fondo, la mesa, el logo de CHASE ni el octágono azul.
NO ALTERES el texto fijo como "Deposit cash or checks", "My Transaction Summary", "JPMorgan Chase Bank, N.A.", "Member FDIC", "Lacey, Branch 740066", "Session #", "Further review may result in delayed availability of this deposit", ni el número de transacción.
SOLO modifica los valores dinámicos:
- Cambia los últimos 4 dígitos de cuenta (Account Number Ending In) por: ${fields.account}
- Cambia el monto de "Checking Deposit" por: ${fields.amount}
- Cambia la fecha (formato MM/DD/YYYY) en todas las apariciones por: ${fields.date}
- Cambia la hora (junto a la fecha) por: ${fields.time}
MANTÉN EL 100% DE LA FOTOGRAFÍA ORIGINAL DE REFERENCIA SIN ALTERAR EL LOGO BANCARIO NI EL FONDO DE LA MESA.
  `,
  detect: (rawText) => {
    const text = rawText.toLowerCase();
    return (text.includes('chase') || text.includes('jpmorgan') || text.includes('my transaction summary')) && text.includes('lacey');
  },
  mapFields: (extractedData: any) => {
    return {
      account: extractedData.account || '2274',
      amount: extractedData.amount || '$2,900.00',
      date: extractedData.date || '10/20/2026',
      time: extractedData.time || '09:53',
    };
  },
  mockSvg: (baseImageDataUrl, fields) => {
    const account = fields.account || '2274';
    const amount = formatCurrencyString(fields.amount || '$2,900.00');
    const date = fields.date || '10/20/2026';
    const time = fields.time || '09:53';
    const isDataOrPath = Boolean(baseImageDataUrl && (baseImageDataUrl.startsWith('data:') || baseImageDataUrl.startsWith('/') || baseImageDataUrl.startsWith('http')));
    const bgImage = isDataOrPath ? baseImageDataUrl : '/Chase/chase-base-receipt-2.jpeg';

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="800" height="1600" viewBox="0 0 800 1600">
        <image href="${bgImage}" x="0" y="0" width="800" height="1600" preserveAspectRatio="xMidYMid meet"/>
        
        <!-- Overlay patches on top of original photo -->

        <!-- Account last 4 patch -->
        <rect x="560" y="530" width="55" height="22" fill="#f0efe9" opacity="0.95"/>
        <text x="562" y="547" font-family="'Courier New', monospace" font-size="15" font-weight="bold" fill="#222">${account}</text>

        <!-- Deposit amount patch -->
        <rect x="500" y="555" width="120" height="22" fill="#f0efe9" opacity="0.95"/>
        <text x="502" y="572" font-family="'Courier New', monospace" font-size="15" font-weight="bold" fill="#222">${amount}</text>

        <!-- Date & Time patch (under Member FDIC) -->
        <rect x="290" y="890" width="195" height="22" fill="#f0efe9" opacity="0.95"/>
        <text x="292" y="907" font-family="'Courier New', monospace" font-size="14" font-weight="bold" fill="#222">${date} ${time}</text>

        <!-- Business Date patch -->
        <rect x="300" y="930" width="170" height="22" fill="#f0efe9" opacity="0.95"/>
        <text x="302" y="947" font-family="'Courier New', monospace" font-size="14" font-weight="bold" fill="#222">${date}</text>
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
  }
};
