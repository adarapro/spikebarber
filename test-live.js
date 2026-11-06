const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function runLiveTest() {
  const screenshotsDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  // Lanzamos el navegador real visible o con viewport de móvil (iPhone 14)
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  // Emular pantalla de móvil moderna (390 x 844)
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

  console.log('1. Navegando a http://localhost:3000 ...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: path.join(screenshotsDir, '01_pantalla_inicial.png'), fullPage: false });

  console.log('2. Rellenando Bloque 1: Datos del Negocio...');
  await page.type('input[name="duenoNombre"]', 'Carlos Spike');
  await page.type('input[name="direccion"]', 'Av. Providencia 1450, Santiago');
  await page.type('input[name="instagram"]', '@spikebarber.cl');

  console.log('3. Rellenando Bloque 2: Horarios y Segundo Barbero...');
  await page.type('input[name="diasAtencion"]', 'Martes a Sábado');
  await page.type('input[name="pausaAlmuerzo"]', '14:00 a 15:00 hrs');
  await page.type('input[name="segundoBarbero"]', 'Mateo Barbero');

  console.log('4. Rellenando Bloque 3: Precios de Servicios...');
  await page.type('input[name="precioCorte"]', '$14.000');
  await page.type('input[name="precioBarba"]', '$9.000');
  await page.type('input[name="precioCombo"]', '$20.000');
  await page.type('textarea[name="otrosServicios"]', 'Cejas $3.000, Diseño tribal $5.000');

  console.log('5. Activando Pago Anticipado en Bloque 4...');
  // Click en el radio de pago anticipado 'Sí'
  await page.click('input[name="pagoAnticipado"][value="si"]');
  await page.waitForTimeout ? await page.waitForTimeout(500) : await new Promise(r => setTimeout(r, 500));
  await page.type('textarea[name="datosCuenta"]', '$5.000 abono / Banco Estado, Cuenta RUT 18.234.567-8');

  await page.screenshot({ path: path.join(screenshotsDir, '02_formulario_completado.png'), fullPage: false });

  console.log('6. Enviando formulario...');
  // Interceptar la redirección para capturar la URL de WhatsApp generada
  let targetUrl = '';
  page.on('framenavigated', (frame) => {
    targetUrl = frame.url();
  });

  await page.click('#submitBtn');

  // Esperar a que el modal aparezca y el fetch responda
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(screenshotsDir, '03_modal_exito.png'), fullPage: false });

  console.log('Prueba finalizada exitosamente.');
  await browser.close();
}

runLiveTest().catch(console.error);
