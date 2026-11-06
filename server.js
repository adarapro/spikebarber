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
