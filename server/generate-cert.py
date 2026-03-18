#!/usr/bin/env python3
"""
NeoAgroTech - Generador de certificados SSL con Python
Genera certificados SSL autofirmados usando OpenSSL
"""
import subprocess
import sys
import os
from pathlib import Path

CERT_DIR = Path(__file__).parent / 'cert'
KEY_FILE = CERT_DIR / 'server.key'
CERT_FILE = CERT_DIR / 'server.crt'

def check_openssl():
    """Verificar si OpenSSL está instalado"""
    try:
        subprocess.run(['openssl', 'version'], 
                     capture_output=True, 
                     check=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False

def generate_certificates():
    """Generar certificados SSL"""
    # Crear directorio si no existe
    CERT_DIR.mkdir(parents=True, exist_ok=True)
    
    # Crear .gitkeep
    gitkeep = CERT_DIR / '.gitkeep'
    if not gitkeep.exists():
        gitkeep.write_text('# Este archivo mantiene la carpeta cert en git\n')
    
    print("🔐 Generando certificados SSL autofirmados para NeoAgroTech...\n")
    
    # Verificar OpenSSL
    if not check_openssl():
        print("❌ Error: OpenSSL no está instalado o no está en el PATH.")
        print("\n💡 Instalación:")
        print("   Windows: https://slproweb.com/products/Win32OpenSSL.html")
        print("   O usa Git Bash que incluye OpenSSL")
        print("\n   Alternativa manual:")
        print(f"   1. openssl genrsa -out {KEY_FILE} 2048")
        print(f"   2. openssl req -new -x509 -key {KEY_FILE} -out {CERT_FILE} -days 365")
        return False
    
    # Verificar si ya existen
    if KEY_FILE.exists() and CERT_FILE.exists():
        print("⚠️  Los certificados ya existen.")
        print(f"   Ubicación: {CERT_DIR}")
        print("\n   Si deseas regenerarlos, elimina los archivos:")
        print(f"   - {KEY_FILE}")
        print(f"   - {CERT_FILE}")
        return True
    
    try:
        # Generar clave privada
        print("1. Generando clave privada (2048 bits)...")
        subprocess.run([
            'openssl', 'genrsa',
            '-out', str(KEY_FILE),
            '2048'
        ], check=True)
        
        # Generar certificado autofirmado
        print("2. Generando certificado autofirmado (válido por 365 días)...")
        subprocess.run([
            'openssl', 'req', '-new', '-x509',
            '-key', str(KEY_FILE),
            '-out', str(CERT_FILE),
            '-days', '365',
            '-subj', '/C=CL/ST=Chile/L=Santiago/O=NeoAgroTech/OU=IT/CN=localhost'
        ], check=True)
        
        print("\n✅ Certificados generados exitosamente!")
        print(f"   📁 Ubicación: {CERT_DIR}")
        print(f"   🔑 Clave privada: {KEY_FILE}")
        print(f"   📜 Certificado: {CERT_FILE}")
        print("\n⚠️  Estos son certificados autofirmados para desarrollo.")
        print("   Para producción, usa certificados de una CA confiable (Let's Encrypt, etc.)")
        print("\n🚀 Ahora puedes iniciar el servidor con:")
        print("   python server/https-server.py")
        print()
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"\n❌ Error al generar certificados: {e}")
        return False
    except Exception as e:
        print(f"\n❌ Error inesperado: {e}")
        return False

if __name__ == '__main__':
    success = generate_certificates()
    sys.exit(0 if success else 1)

