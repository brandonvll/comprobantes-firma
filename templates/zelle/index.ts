import { ReceiptTemplate } from '@/types/template';
import { formatCurrencyString } from '@/lib/utils';

export const zelleTemplate: ReceiptTemplate = {
  config: {
    id: 'zelle',
    name: 'Zelle',
    color: 'bg-purple-600',
  },
  fields: [
    { id: 'amount', label: 'Monto Enviado', type: 'currency', placeholder: '$0.00', defaultValue: '$125.00' },
    { id: 'recipientName', label: 'Nombre Registrado', type: 'text', placeholder: 'Nombre del destinatario', defaultValue: 'Felipe Gonzalez' },
    { id: 'contactInfo', label: 'Teléfono o Correo', type: 'text', placeholder: '(555) 555-5555', defaultValue: '(407) 415-4294' },
  ],
  buildPrompt: (fields) => `
ESTRICTO: Modifica los siguientes campos en la imagen para una confirmación de Zelle respetando el formato, estilo, fuente, perspectiva y sombras. 
NO ALTERES el logo, el botón de "Listo" ni el botón de "Añadir a Siri" (manten el logo azul colorido de Siri intacto). 
No cambies la fecha ni agregues horas si no estaban.
- Cambia el texto secundario "Estamos enviando tu dinero ahora." para que contenga: ${fields.recipientName}
- Cambia el Monto enviado (grande en el centro) por: ${fields.amount}
- Cambia el nombre en el avatar y debajo del monto por: ${fields.recipientName} Zelle
- Cambia "Registrado como" por: ${String(fields.recipientName).toUpperCase()}
- Cambia el teléfono o correo debajo por: ${fields.contactInfo}
- En el cuadro gris inferior (Siri), cambia el nombre en "Paga a [Nombre]" usando el primer nombre de: ${fields.recipientName}
MANTÉN EL 100% DE LA FOTOGRAFÍA ORIGINAL DE REFERENCIA SIN ALTERAR EL LOGO NI LOS BOTONES INFERIORES.
  `,
  detect: (rawText) => {
    const text = rawText.toLowerCase();
    return text.includes('zelle') || text.includes('estamos enviando tu dinero');
  },
  mapFields: (extractedData: any) => {
    return {
      amount: extractedData.amount || '$125.00',
      recipientName: extractedData.recipientName || 'Felipe Gonzalez',
      contactInfo: extractedData.contactInfo || '(407) 415-4294',
    };
  },
  mockSvg: (baseImageDataUrl, fields) => {
    const rawAmount = fields.amount || '$125.00';
    const amount = formatCurrencyString(rawAmount);
    const recipientName = fields.recipientName || 'Felipe Gonzalez';
    const contactInfo = fields.contactInfo || '(407) 415-4294';
    const firstName = recipientName.trim().split(' ')[0] || 'Felipe';
    const isDataOrPath = Boolean(baseImageDataUrl && (baseImageDataUrl.startsWith('data:') || baseImageDataUrl.startsWith('/') || baseImageDataUrl.startsWith('http')));
    const bgImage = isDataOrPath ? baseImageDataUrl : '/Zelle/WhatsApp%20Image%202026-08-02%20at%205.48.31%20PM.jpeg';

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="576" height="1024" viewBox="0 0 576 1024">
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
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
  }
};
