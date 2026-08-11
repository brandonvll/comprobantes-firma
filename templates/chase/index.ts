import { ReceiptTemplate } from '@/types/template';
import { formatCurrencyString } from '@/lib/utils';

export const chaseTemplate: ReceiptTemplate = {
  config: {
    id: 'chase',
    name: 'Chase',
    color: 'bg-blue-600',
  },
  fields: [
    { id: 'account', label: 'Cuenta (últimos 4)', type: 'text', placeholder: 'ej. 2274', defaultValue: '2274' },
    { id: 'amount', label: 'Monto a depositar', type: 'currency', placeholder: '$0.00', defaultValue: '$3,000.00' },
    { id: 'date', label: 'Fecha', type: 'date', placeholder: 'MM/DD/YYYY', defaultValue: '07/25/2026' },
    { id: 'time', label: 'Hora', type: 'time', placeholder: 'HH:MM AM/PM', defaultValue: '11:02' },
  ],
  buildPrompt: (fields) => `
ESTRICTO: Modifica los siguientes campos en la imagen para un comprobante de Chase ATM respetando el formato, estilo, fuente, perspectiva y sombras. 
NO ALTERES el fondo ni el logo de CHASE ni el octágono.
- Cambia la terminación de cuenta por: ${fields.account}
- Cambia el monto a depositar (Retiro y Depósito) por: ${fields.amount}
- Cambia el Pagar en por: ${fields.amount}
- Cambia la fecha por: ${fields.date}
- Cambia la hora (junto a la fecha) por: ${fields.time}
MANTÉN EL 100% DE LA FOTOGRAFÍA ORIGINAL DE REFERENCIA SIN ALTERAR EL LOGO BANCARIO NI EL FONDO DE LA MESA.
  `,
  detect: (rawText) => {
    const text = rawText.toLowerCase();
    return text.includes('chase') || text.includes('jpmorgan') || text.includes('my transaction summary');
  },
  mapFields: (extractedData: any) => {
    return {
      account: extractedData.account || '2274',
      amount: extractedData.amount || '$3,000.00',
      date: extractedData.date || '07/25/2026',
      time: extractedData.time || '11:02',
    };
  },
  mockSvg: (baseImageDataUrl, fields) => {
    const account = fields.account || '2274';
    const amount = formatCurrencyString(fields.amount || '$3,000.00');
    const date = fields.date || '07/25/2026';
    const time = fields.time || '11:02';
    const isDataOrPath = Boolean(baseImageDataUrl && (baseImageDataUrl.startsWith('data:') || baseImageDataUrl.startsWith('/') || baseImageDataUrl.startsWith('http')));
    const bgImage = isDataOrPath ? baseImageDataUrl : '/Chase/WhatsApp%20Image%202026-08-02%20at%205.50.22%20PM.jpeg';

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="800" height="1066" viewBox="0 0 800 1066">
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
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
  }
};
