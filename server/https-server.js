// NeoAgroTech - Servidor HTTPS
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8443;
const HOST = process.env.HOST || 'localhost';

// Verificar que existan los certificados
const keyPath = path.join(__dirname, 'cert', 'server.key');
const certPath = path.join(__dirname, 'cert', 'server.crt');

if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
  console.error('❌ Error: No se encontraron los certificados SSL.');
  console.log('💡 Ejecuta: npm run generate-cert');
  process.exit(1);
}

// Rutas de los certificados SSL
let options;
try {
  options = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath)
  };
} catch (error) {
  console.error('❌ Error al leer los certificados:', error.message);
  process.exit(1);
}

// Directorio raíz del proyecto
const rootDir = path.join(__dirname, '..');

// Mapeo de tipos MIME
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject'
};

// Función para obtener el tipo MIME
function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return mimeTypes[ext] || 'application/octet-stream';
}

// Función para servir archivos estáticos
function serveFile(filePath, res) {
  // Normalizar la ruta y prevenir directory traversal
  let safePath = path.normalize(filePath).replace(/^(\.\.[\/\\])+/, '');
  
  // Si es la raíz, servir index.html
  if (safePath === '/' || safePath === '\\') {
    safePath = '/index.html';
  }
  
  const fullPath = path.join(rootDir, safePath);
  
  // Verificar que el archivo esté dentro del directorio raíz
  if (!fullPath.startsWith(rootDir)) {
    res.writeHead(403, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>403 - Acceso denegado</h1>');
    return;
  }
  
  // Prevenir acceso a archivos del servidor y node_modules
  if (safePath.includes('/server/') || safePath.includes('\\server\\') || 
      safePath.includes('/node_modules/') || safePath.includes('\\node_modules\\')) {
    res.writeHead(403, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>403 - Acceso denegado</h1>');
    return;
  }

  fs.readFile(fullPath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Si no existe, intentar servir index.html como fallback
        if (safePath !== '/index.html') {
          const indexPath = path.join(rootDir, 'index.html');
          fs.readFile(indexPath, (err2, indexData) => {
            if (err2) {
              res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
              res.end('<h1>404 - Archivo no encontrado</h1>');
            } else {
              res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
              res.end(indexData);
            }
          });
        } else {
          res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end('<h1>404 - Archivo no encontrado</h1>');
        }
      } else {
        res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>500 - Error del servidor</h1>');
      }
      return;
    }

    const contentType = getContentType(fullPath);
    res.writeHead(200, { 
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600'
    });
    res.end(data);
  });
}

// Crear servidor HTTPS
const server = https.createServer(options, (req, res) => {
  // Headers de seguridad
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  // CORS headers (ajustar según necesidades)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Solo permitir GET y POST
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>405 - Método no permitido</h1>');
    return;
  }

  serveFile(req.url, res);
});

// Manejo de errores del servidor
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Error: El puerto ${PORT} ya está en uso.`);
    console.log(`💡 Intenta usar otro puerto: PORT=3000 npm start`);
  } else {
    console.error('❌ Error del servidor:', err);
  }
  process.exit(1);
});

// Iniciar servidor
server.listen(PORT, HOST, () => {
  console.log('='.repeat(60));
  console.log('🌾 NeoAgroTech - Servidor HTTPS');
  console.log('='.repeat(60));
  console.log(`✅ Servidor corriendo en: https://${HOST}:${PORT}`);
  console.log(`✅ O también: https://127.0.0.1:${PORT}`);
  console.log('='.repeat(60));
  console.log('⚠️  Nota: El certificado es autofirmado.');
  console.log('   Tu navegador mostrará una advertencia de seguridad.');
  console.log('   Haz clic en "Avanzado" y luego "Continuar" para acceder.');
  console.log('='.repeat(60));
  console.log('📝 Presiona Ctrl+C para detener el servidor');
  console.log('='.repeat(60));
});

