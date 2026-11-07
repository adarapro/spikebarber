const fastify = require('fastify')({ logger: true });
const path = require('path');
const fs = require('fs');

// Archivos estáticos (Frontend móvil)
fastify.register(require('@fastify/static'), {
  root: path.join(__dirname, 'public'),
  prefix: '/',
});

fastify.register(require('@fastify/formbody'));

// Ruta de comprobación de salud (Health check para Coolify)
fastify.get('/health', async (request, reply) => {
  return { status: 'ok', client: 'Spike Barber', agency: 'Adara Digital' };
});

// Panel administrativo para ver las respuestas recibidas
fastify.get('/admin', async (request, reply) => {
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const files = fs.readdirSync(dataDir)
    .filter(f => f.endsWith('.json'))
    .sort()
    .reverse();

  const submissions = files.map(filename => {
    const content = fs.readFileSync(path.join(dataDir, filename), 'utf-8');
    return {
      filename,
      data: JSON.parse(content)
    };
  });

  reply.type('text/html');
  return `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Panel de Respuestas | Adara Digital</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>body { font-family: 'Plus Jakarta Sans', sans-serif; }</style>
  </head>
  <body class="bg-[#0b0f19] text-white min-h-screen p-4 md:p-8">
    <div class="max-w-4xl mx-auto space-y-6">
      <header class="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 class="text-2xl font-extrabold text-white">Adara Digital · Panel de Levantamiento</h1>
          <p class="text-xs text-amber-400 font-semibold">Cliente: Spike Barber (C-2026-002)</p>
        </div>
        <span class="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs px-3 py-1 rounded-full font-bold">
          ${submissions.length} Respuestas Recibidas
        </span>
      </header>

      ${submissions.length === 0 ? `
        <div class="bg-[#131c2e] border border-slate-800 p-8 rounded-2xl text-center text-slate-400">
          Aún no se han recibido envíos desde la web.
        </div>
      ` : submissions.map(sub => `
        <div class="bg-[#131c2e] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div class="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div class="flex items-center space-x-2">
              <span class="w-3 h-3 rounded-full bg-emerald-400"></span>
              <span class="font-bold text-white text-base">${sub.data.duenoNombre || 'Sin nombre'}</span>
            </div>
            <span class="text-xs text-slate-400 font-mono">${sub.filename}</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div class="bg-[#0a0f1d] p-3.5 rounded-xl border border-slate-800 space-y-1">
              <span class="text-amber-400 font-bold uppercase tracking-wide block">Negocio y Contacto</span>
              <p><strong class="text-slate-300">Dirección:</strong> ${sub.data.direccion || '-'}</p>
              <p><strong class="text-slate-300">Instagram:</strong> ${sub.data.instagram || '-'}</p>
              <p><strong class="text-slate-300">Atención:</strong> ${sub.data.diasAtencion || '-'} (${sub.data.horaApertura || '-'} a ${sub.data.horaCierre || '-'})</p>
            </div>

            <div class="bg-[#0a0f1d] p-3.5 rounded-xl border border-slate-800 space-y-1">
              <span class="text-amber-400 font-bold uppercase tracking-wide block">Barberos y Citas</span>
              <p><strong class="text-slate-300">Barbero 1:</strong> ${sub.data.barbero1 || '-'}</p>
              <p><strong class="text-slate-300">Barbero 2:</strong> ${sub.data.barbero2 || '-'}</p>
              <p><strong class="text-slate-300">Reparto turnos:</strong> ${sub.data.eleccionBarbero || '-'}</p>
              <p><strong class="text-slate-300">Sin cita previa:</strong> ${sub.data.manejoWalkin || '-'}</p>
            </div>

            <div class="bg-[#0a0f1d] p-3.5 rounded-xl border border-slate-800 space-y-1">
              <span class="text-amber-400 font-bold uppercase tracking-wide block">Precios y Tiempos</span>
              <p><strong class="text-slate-300">Corte:</strong> ${sub.data.precioCorte || '-'} (${sub.data.tiempoCorte || '-'})</p>
              <p><strong class="text-slate-300">Barba:</strong> ${sub.data.precioBarba || '-'} (${sub.data.tiempoBarba || '-'})</p>
              <p><strong class="text-slate-300">Combo:</strong> ${sub.data.precioCombo || '-'} (${sub.data.tiempoCombo || '-'})</p>
              <p><strong class="text-slate-300">Otros:</strong> ${sub.data.otrosServicios || '-'}</p>
            </div>

            <div class="bg-[#0a0f1d] p-3.5 rounded-xl border border-slate-800 space-y-1">
              <span class="text-amber-400 font-bold uppercase tracking-wide block">Reservas y Anticipo</span>
              <p><strong class="text-slate-300">¿Pide abono?:</strong> ${sub.data.pagoAnticipado === 'si' ? 'Sí' : 'No'}</p>
              ${sub.data.datosCuenta ? `<p><strong class="text-slate-300">Cuenta:</strong> ${sub.data.datosCuenta}</p>` : ''}
              <p><strong class="text-slate-300">Cancelación:</strong> ${sub.data.tiempoCancelacion || '-'}</p>
            </div>
          </div>

          ${sub.data.notasAdicionales ? `
            <div class="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl text-xs">
              <span class="font-bold text-amber-400 block mb-1">Notas Adicionales del Cliente:</span>
              <p class="text-slate-200">${sub.data.notasAdicionales}</p>
            </div>
          ` : ''}

          <div class="flex justify-end pt-2">
            <a href="/api/download/${sub.filename}" download class="text-xs bg-slate-800 hover:bg-slate-700 text-amber-400 px-3 py-1.5 rounded-lg border border-slate-700 transition font-medium">
              Descargar JSON ⬇️
            </a>
          </div>
        </div>
      `).join('')}
    </div>
  </body>
  </html>
  `;
});

// Descargar archivo JSON individual
fastify.get('/api/download/:file', async (request, reply) => {
  const filePath = path.join(__dirname, 'data', path.basename(request.params.file));
  if (!fs.existsSync(filePath)) {
    return reply.status(404).send({ error: 'Archivo no encontrado' });
  }
  return reply.send(fs.readFileSync(filePath));
});

// Endpoint JSON para consultar todas las respuestas
fastify.get('/api/submissions', async (request, reply) => {
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) return [];
  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));
  return files.map(filename => JSON.parse(fs.readFileSync(path.join(dataDir, filename), 'utf-8')));
});

// Endpoint para recibir las respuestas del barbero
fastify.post('/api/submit', async (request, reply) => {
  const data = request.body;
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `spike-barber-${timestamp}.json`;
  const filePath = path.join(__dirname, 'data', filename);

  // Guardar en la carpeta data
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');

  fastify.log.info(`Respuestas guardadas en: ${filePath}`);

  return {
    success: true,
    message: 'Respuestas guardadas exitosamente',
    file: filename
  };
});

// Iniciar servidor
const start = async () => {
  try {
    const port = process.env.PORT || 3000;
    await fastify.listen({ port: Number(port), host: '0.0.0.0' });
    console.log(`🚀 Servidor de Onboarding Spike Barber corriendo en el puerto ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
