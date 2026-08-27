import { ReceiptTemplate } from '@/types/template';
import { formatCurrencyString } from '@/lib/utils';

export const zelleTemplate: ReceiptTemplate = {
  config: {
    id: 'zelle',
    name: 'Zelle (Bank of America)',
    color: 'bg-purple-600',
  },
  fields: [
    { id: 'amount', label: 'Cantidad (Monto)', type: 'currency', placeholder: '$438.00', defaultValue: '$438.00' },
    { id: 'recipientName', label: 'Nombre Destinatario', type: 'text', placeholder: 'NATHALIE DIAZ', defaultValue: 'NATHALIE DIAZ' },
    { id: 'contactInfo', label: 'Teléfono o Correo', type: 'text', placeholder: '305-848-2711', defaultValue: '305-848-2711' },
    { id: 'account', label: 'Cuenta de Origen (Desde)', type: 'text', placeholder: 'Adv SafeBalance Banking - 4042', defaultValue: 'Adv SafeBalance Banking - 4042' },
    { id: 'date', label: 'Fecha', type: 'text', placeholder: 'ago 26, 2026', defaultValue: 'ago 26, 2026' },
    { id: 'confirmationNumber', label: 'Número de Confirmación', type: 'text', placeholder: 'vfwqisvbu', defaultValue: 'vfwqisvbu' },
  ],
  buildPrompt: (fields) => `
ESTRICTO: Modifica los siguientes campos en la imagen de confirmación de transferencia Zelle de Bank of America ("Su pago fue enviado") respetando el formato, fuente, alineación, color de texto y estilo original.
NO ALTERES el ícono verde de verificación (✓), los títulos "Éxito" y "Su pago fue enviado", el enlace "Imprimir o guardar", las líneas divisorias, la sección de divulgaciones legales ni el botón "HECHO".

Campos a sustituir:
- En la sección "A" (Destinatario):
  * Cambia el nombre del destinatario por: ${fields.recipientName || 'NATHALIE DIAZ'}
  * Cambia el teléfono/correo por: ${fields.contactInfo || '305-848-2711'}
  * Cambia "Inscrito como" por: Inscrito como ${fields.recipientName || 'NATHALIE DIAZ'}
  * Cambia la inicial dentro del avatar circular por la primera letra del nombre (${(fields.recipientName || 'NATHALIE DIAZ').trim().charAt(0).toUpperCase()})
- En la fila "Desde" (Cuenta de origen):
  * Cambia el texto/cuenta por: ${fields.account || 'Adv SafeBalance Banking - 4042'}
- En la fila "Cantidad":
  * Cambia el monto por: ${fields.amount || '$438.00'}
- En la fila "Fecha":
  * Cambia la fecha por: ${fields.date || 'ago 26, 2026'}
- En la fila "Número de confirmación":
  * Cambia el número de confirmación por: ${fields.confirmationNumber || 'vfwqisvbu'}

CONSERVA EL 100% DE LA FOTOGRAFÍA ORIGINAL DE REFERENCIA SIN ALTERAR ENCABEZADOS, DIVISORES, NI BOTONES INFERIORES.
  `,
  detect: (rawText) => {
    const text = rawText.toLowerCase();
    return (
      text.includes('zelle') ||
      text.includes('su pago fue enviado') ||
      text.includes('inscrito como') ||
      text.includes('número de confirmación') ||
      text.includes('numero de confirmacion') ||
      text.includes('divulgaciones legales')
    );
  },
  mapFields: (extractedData: any) => {
    return {
      amount: extractedData.amount || '$438.00',
      recipientName: extractedData.recipientName || 'NATHALIE DIAZ',
      contactInfo: extractedData.contactInfo || '305-848-2711',
      account: extractedData.account || 'Adv SafeBalance Banking - 4042',
      date: extractedData.date || 'ago 26, 2026',
      confirmationNumber: extractedData.confirmationNumber || 'vfwqisvbu',
    };
  },
  mockSvg: (baseImageDataUrl, fields) => {
    const rawAmount = fields.amount || '$438.00';
    const amount = formatCurrencyString(rawAmount);
    const recipientName = fields.recipientName || 'NATHALIE DIAZ';
    const contactInfo = fields.contactInfo || '305-848-2711';
    const account = fields.account || 'Adv SafeBalance Banking - 4042';
    const date = fields.date || 'ago 26, 2026';
    const confirmationNumber = fields.confirmationNumber || 'vfwqisvbu';
    const initialLetter = recipientName.trim().charAt(0).toUpperCase() || 'N';

    const isDataOrPath = Boolean(baseImageDataUrl && (baseImageDataUrl.startsWith('data:') || baseImageDataUrl.startsWith('/') || baseImageDataUrl.startsWith('http')));
    const bgImage = isDataOrPath ? baseImageDataUrl : '/Zelle/zelle_bofa_reference.jpeg';

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="736" height="1600" viewBox="0 0 736 1600">
        <image href="${bgImage}" x="0" y="0" width="736" height="1600" preserveAspectRatio="none"/>
        
        <!-- Recipient & Contact patch -->
        <rect x="250" y="515" width="375" height="85" fill="#ffffff"/>
        <text x="620" y="538" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="600" fill="#52525b" text-anchor="end">${recipientName}</text>
        <text x="620" y="565" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="400" fill="#71717a" text-anchor="end">${contactInfo}</text>
        <text x="620" y="590" font-family="system-ui, -apple-system, sans-serif" font-size="19" font-weight="400" fill="#71717a" text-anchor="end">Inscrito como ${recipientName.toUpperCase()}</text>
        
        <!-- Avatar patch -->
        <circle cx="672" cy="552" r="28" fill="#d1d5db"/>
        <text x="672" y="562" font-family="system-ui, -apple-system, sans-serif" font-size="30" font-weight="500" fill="#ffffff" text-anchor="middle">${initialLetter}</text>
        
        <!-- Source Account patch -->
        <rect x="300" y="640" width="410" height="75" fill="#ffffff"/>
        <text x="706" y="668" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="400" fill="#52525b" text-anchor="end">${account}</text>

        <!-- Amount patch -->
        <rect x="400" y="745" width="310" height="45" fill="#ffffff"/>
        <text x="706" y="778" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="400" fill="#52525b" text-anchor="end">${amount}</text>
        
        <!-- Date patch -->
        <rect x="400" y="825" width="310" height="45" fill="#ffffff"/>
        <text x="706" y="852" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="400" fill="#52525b" text-anchor="end">${date}</text>
        
        <!-- Confirmation Number patch -->
        <rect x="400" y="900" width="310" height="55" fill="#ffffff"/>
        <text x="706" y="934" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="400" fill="#52525b" text-anchor="end">${confirmationNumber}</text>
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
  }
};

