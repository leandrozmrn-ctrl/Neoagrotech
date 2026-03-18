// NeoAgroTech - Generador de certificados SSL autofirmados
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const certDir = path.join(__dirname, 'cert');
const keyPath = path.join(certDir, 'server.key');
const certPath = path.join(certDir, 'server.crt');

// Crear directorio de certificados si no existe
if (!fs.existsSync(certDir)) {
  fs.mkdirSync(certDir, { recursive: true });
  // Crear archivo .gitkeep para mantener la carpeta en git
  fs.writeFileSync(path.join(certDir, '.gitkeep'), '');
}

console.log('🔐 Generando certificados SSL autofirmados para NeoAgroTech...\n');

// Verificar si OpenSSL está disponible
function checkOpenSSL() {
  try {
    execSync('openssl version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

if (!checkOpenSSL()) {
  console.error('❌ Error: OpenSSL no está instalado o no está en el PATH.');
  console.log('\n💡 Instalación:');
  console.log('   Windows: https://slproweb.com/products/Win32OpenSSL.html');
  console.log('   macOS: brew install openssl');
  console.log('   Linux: sudo apt-get install openssl (Ubuntu/Debian)');
  console.log('\n   O usa Git Bash que incluye OpenSSL.');
  process.exit(1);
}

try {
  // Verificar si los certificados ya existen
  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    console.log('⚠️  Los certificados ya existen.');
    console.log('   Si deseas regenerarlos, elimina los archivos en:');
    console.log(`   ${certDir}\n`);
    console.log('✅ Usando certificados existentes.');
    console.log('   Para regenerarlos, elimina los archivos y ejecuta este script nuevamente.\n');
  } else {
    generateCertificates();
  }
} catch (error) {
  console.error('\n❌ Error inesperado:', error.message);
  process.exit(1);
}

function generateCertificates() {
  try {
    // Generar clave privada
    console.log('1. Generando clave privada (2048 bits)...');
    const keyCommand = process.platform === 'win32' 
      ? `openssl genrsa -out "${keyPath}" 2048`
      : `openssl genrsa -out "${keyPath}" 2048`;
    
    execSync(keyCommand, { stdio: 'inherit' });

    // Generar certificado autofirmado
    console.log('2. Generando certificado autofirmado (válido por 365 días)...');
    const certCommand = `openssl req -new -x509 -key "${keyPath}" -out "${certPath}" -days 365 -subj "/C=CL/ST=Chile/L=Santiago/O=NeoAgroTech/OU=IT/CN=localhost"`;
    
    execSync(certCommand, { stdio: 'inherit' });

    console.log('\n✅ Certificados generados exitosamente!');
    console.log(`   📁 Ubicación: ${certDir}`);
    console.log(`   🔑 Clave privada: ${keyPath}`);
    console.log(`   📜 Certificado: ${certPath}`);
    console.log('\n⚠️  Estos son certificados autofirmados para desarrollo.');
    console.log('   Para producción, usa certificados de una CA confiable (Let\'s Encrypt, etc.)');
    console.log('\n🚀 Ahora puedes iniciar el servidor con: npm start\n');
  } catch (error) {
    console.error('\n❌ Error al generar certificados:', error.message);
    console.log('\n💡 Alternativa: Usa OpenSSL manualmente:');
    console.log(`   1. openssl genrsa -out "${keyPath}" 2048`);
    console.log(`   2. openssl req -new -x509 -key "${keyPath}" -out "${certPath}" -days 365`);
    console.log('\n   O instala OpenSSL desde:');
    console.log('   https://slproweb.com/products/Win32OpenSSL.html (Windows)');
    process.exit(1);
  }
}

