import { ReceiptTemplate } from '@/types/template';
import { formatCurrencyString } from '@/lib/utils';

export const bofaTemplate: ReceiptTemplate = {
  config: {
    id: 'bofa',
    name: 'Bank of America',
    color: 'bg-red-600',
  },
  fields: [
    { id: 'account', label: 'Cuenta (últimos 4)', type: 'text', placeholder: 'ej. 5441', defaultValue: '5441' },
    { id: 'amount', label: 'Monto Total', type: 'currency', placeholder: '$0.00', defaultValue: '$850.00' },
    { id: 'date', label: 'Fecha', type: 'date', placeholder: 'MM/DD/YYYY', defaultValue: '01/24/2026' },
    { id: 'time', label: 'Hora', type: 'time', placeholder: 'HH:MM AM/PM', defaultValue: '12:51 PM' },
  ],
  buildPrompt: (fields) => `
ESTRICTO: Modifica los siguientes campos en la imagen para un comprobante de Bank of America respetando el formato, estilo, fuente, perspectiva y sombras. 
NO ALTERES el fondo, las letras rojas, el papel ni los textos legales.
- Cambia la terminación de la cuenta por: ${fields.account}
- Cambia el Trans Total y Chk Amt por: ${fields.amount}
- Cambia la fecha de transacción por: ${fields.date}
- Cambia la hora por: ${fields.time}
MANTÉN EL 100% DE LA FOTOGRAFÍA ORIGINAL DE REFERENCIA SIN ALTERAR EL LOGO BANCARIO NI EL FONDO DE LA MESA.
  `,
  detect: (rawText) => {
    const text = rawText.toLowerCase();
    return text.includes('bank of america') || text.includes('client receipt');
  },
  mapFields: (extractedData: any) => {
    return {
      account: extractedData.account || '5441',
      amount: extractedData.amount || '$850.00',
      date: extractedData.date || '01/24/2026',
      time: extractedData.time || '12:51 PM',
    };
  },
  mockSvg: (baseImageDataUrl, fields) => {
    const account = fields.account || '5441';
    const amount = formatCurrencyString(fields.amount || '$850.00');
    const date = fields.date || '01/24/2026';
    const time = fields.time || '12:51 PM';
    const isDataOrPath = Boolean(baseImageDataUrl && (baseImageDataUrl.startsWith('data:') || baseImageDataUrl.startsWith('/') || baseImageDataUrl.startsWith('http')));
    const bgImage = isDataOrPath ? baseImageDataUrl : '/Bank%20of%20america/WhatsApp%20Image%202026-08-02%20at%206.19.16%20PM.jpeg';

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="576" viewBox="0 0 1024 576">
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
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
  }
};
