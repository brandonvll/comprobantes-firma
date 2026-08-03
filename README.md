PROMPT PARA CLAUDE

Quiero crear una aplicación web usando Next.js.

El objetivo es generar una nueva imagen de un recibo bancario a partir de una imagen base utilizando la API GPT Image de OpenAI.

Objetivo

El usuario subirá un recibo original.

Después escribirá cuatro datos:

Últimos 4 números de la cuenta
Monto
Fecha
Hora

Al presionar Generar, la aplicación enviará la imagen original junto con esos cuatro valores a la API GPT Image.

La IA debe devolver una imagen nueva.

La imagen debe verse exactamente igual a la original.

Debe conservar:

perspectiva
iluminación
sombras
textura del papel
calidad
inclinación
tamaño
fondo
logotipos
tipografía
espacios
todos los textos originales

Solamente deben cambiar los siguientes campos:

últimos cuatro números de la cuenta
monto
fecha
hora

No debe dibujar cuadros.

No debe poner flechas.

No debe resaltar nada.

No debe marcar los cambios.

No debe agregar texto adicional.

No debe modificar ninguna otra parte del recibo.

Debe parecer una fotografía real tomada por una cámara.

El resultado debe ser totalmente natural.

Flujo

Página principal.

Botón:

Subir imagen

Vista previa.

Formulario:

Últimos 4 números:

Monto:

Fecha:

Hora:

Botón:

Generar Imagen

Mostrar loading.

Consumir la API GPT Image.

Mostrar resultado.

Botón:

Descargar PNG

Backend

Usar Node.js.

Usar la API oficial de OpenAI.

No utilizar OCR.

No utilizar Canvas.

No utilizar Sharp para escribir texto.

No utilizar Photoshop.

Toda la modificación debe realizarse mediante GPT Image.

Prompt que debe enviarse a OpenAI

Usa la imagen proporcionada como referencia.

Regenera la fotografía manteniendo exactamente el mismo recibo.

Conserva:

perspectiva
iluminación
papel
sombras
calidad fotográfica
textura
posición
logotipo
fuente
espaciado

Modifica únicamente estos valores:

Últimos cuatro números:
{{ACCOUNT}}

Monto:
{{AMOUNT}}

Fecha:
{{DATE}}

Hora:
{{TIME}}

No señales los cambios.

No dibujes cuadros.

No agregues flechas.

No agregues marcas.

No alteres ningún otro texto.

Debe parecer una fotografía completamente auténtica.

Interfaz

Utilizar Tailwind.

Diseño moderno.

Responsive.

Drag & Drop para subir imágenes.

Vista previa antes y después.

Botón Descargar.

Loading con barra de progreso.

Toast de éxito.

Código

Quiero el proyecto completo listo para ejecutar.

Organizado en:

/app

/components

/lib

/api

/services

/types

Variables

OPENAI_API_KEY

Resultado esperado

Subo un recibo.

Escribo:

Cuenta:
7842

Monto:
$1,250.00

Fecha:
08/07/2026

Hora:
03:45 PM

La IA genera una nueva fotografía idéntica al recibo original cambiando únicamente esos cuatro datos.

Una mejora que te recomiendo

Como ya tienes experiencia con Zelle, puedes hacer que el software sea mucho más inteligente.

En lugar de pedir solo los cuatro campos, el flujo sería:

El usuario sube el recibo.
La IA identifica automáticamente dónde están:
Cuenta
Monto
Fecha
Hora
El usuario solo escribe los nuevos valores.
La aplicación envía la imagen y los valores a GPT Image.
Se genera una nueva imagen fotorrealista.
El usuario la descarga.

Así el programa no dependerá de un recibo específico de Chase; podrá adaptarse a distintos comprobantes siempre que la IA reconozca esos campos, haciendo la herramienta mucho más flexible y fácil de usar.