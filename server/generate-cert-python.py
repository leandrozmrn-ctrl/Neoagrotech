#!/usr/bin/env python3
"""
NeoAgroTech - Generador de certificados SSL usando Python puro
Genera certificados SSL sin necesidad de OpenSSL externo
"""
import sys
from datetime import datetime, timedelta
from pathlib import Path

try:
    from cryptography import x509
    from cryptography.x509.oid import NameOID
    from cryptography.hazmat.primitives import hashes, serialization
    from cryptography.hazmat.primitives.asymmetric import rsa
    from cryptography.hazmat.backends import default_backend
    CRYPTO_AVAILABLE = True
except ImportError:
    CRYPTO_AVAILABLE = False

CERT_DIR = Path(__file__).parent / 'cert'
KEY_FILE = CERT_DIR / 'server.key'
CERT_FILE = CERT_DIR / 'server.crt'

def generate_certificates_python():
    """Generar certificados usando cryptography de Python"""
    if not CRYPTO_AVAILABLE:
        print("❌ Error: La biblioteca 'cryptography' no está instalada.")
        print("\n💡 Instalación:")
        print("   pip install cryptography")
        print("   O:")
        print("   py -m pip install cryptography")
        return False
    
    # Crear directorio si no existe
    CERT_DIR.mkdir(parents=True, exist_ok=True)
    
    # Verificar si ya existen
    if KEY_FILE.exists() and CERT_FILE.exists():
        print("⚠️  Los certificados ya existen.")
        print(f"   Ubicación: {CERT_DIR}")
        return True
    
    print("🔐 Generando certificados SSL autofirmados para NeoAgroTech...\n")
    
    try:
        # Generar clave privada
        print("1. Generando clave privada (2048 bits)...")
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048,
            backend=default_backend()
        )
        
        # Guardar clave privada
        key_pem = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption()
        )
        KEY_FILE.write_bytes(key_pem)
        
        # Crear certificado
        print("2. Generando certificado autofirmado (válido por 365 días)...")
        subject = issuer = x509.Name([
            x509.NameAttribute(NameOID.COUNTRY_NAME, "CL"),
            x509.NameAttribute(NameOID.STATE_OR_PROVINCE_NAME, "Chile"),
            x509.NameAttribute(NameOID.LOCALITY_NAME, "Santiago"),
            x509.NameAttribute(NameOID.ORGANIZATION_NAME, "NeoAgroTech"),
            x509.NameAttribute(NameOID.ORGANIZATIONAL_UNIT_NAME, "IT"),
            x509.NameAttribute(NameOID.COMMON_NAME, "localhost"),
        ])
        
        cert = x509.CertificateBuilder().subject_name(
            subject
        ).issuer_name(
            issuer
        ).public_key(
            private_key.public_key()
        ).serial_number(
            x509.random_serial_number()
        ).not_valid_before(
            datetime.now()
        ).not_valid_after(
            datetime.now() + timedelta(days=365)
        ).add_extension(
            x509.SubjectAlternativeName([
                x509.DNSName("localhost"),
                x509.DNSName("127.0.0.1"),
            ]),
            critical=False,
        ).sign(private_key, hashes.SHA256(), default_backend())
        
        # Guardar certificado
        cert_pem = cert.public_bytes(serialization.Encoding.PEM)
        CERT_FILE.write_bytes(cert_pem)
        
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
        
    except Exception as e:
        print(f"\n❌ Error al generar certificados: {e}")
        return False

if __name__ == '__main__':
    success = generate_certificates_python()
    sys.exit(0 if success else 1)

