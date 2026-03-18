#!/usr/bin/env python3
"""
NeoAgroTech - Servidor HTTP Simple (sin HTTPS)
Servidor HTTP simple para desarrollo cuando no hay certificados SSL
"""
import http.server
import socketserver
import os
import sys
from pathlib import Path

# Configuración
PORT = 8080
HOST = 'localhost'

# Directorio raíz del proyecto
ROOT_DIR = Path(__file__).parent.parent

class NeoAgroTechHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Manejador personalizado para servir archivos estáticos"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT_DIR), **kwargs)
    
    def end_headers(self):
        # Headers de seguridad
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-Frame-Options', 'DENY')
        super().end_headers()
    
    def log_message(self, format, *args):
        """Personalizar mensajes de log"""
        print(f"[{self.log_date_time_string()}] {format % args}")

def main():
    """Función principal"""
    print("=" * 60)
    print("🌾 NeoAgroTech - Servidor HTTP Simple")
    print("=" * 60)
    
    # Cambiar al directorio raíz
    os.chdir(ROOT_DIR)
    
    # Crear el servidor
    try:
        with socketserver.TCPServer((HOST, PORT), NeoAgroTechHTTPRequestHandler) as httpd:
            # Mostrar información
            print(f"\n✅ Servidor HTTP iniciado exitosamente!")
            print(f"   🌐 URL: http://{HOST}:{PORT}")
            print(f"   🌐 URL alternativa: http://127.0.0.1:{PORT}")
            print("=" * 60)
            print("⚠️  Nota: Este es un servidor HTTP (no HTTPS).")
            print("   Para HTTPS, genera los certificados SSL primero.")
            print("=" * 60)
            print("📝 Presiona Ctrl+C para detener el servidor")
            print("=" * 60)
            print()
            
            # Iniciar servidor
            httpd.serve_forever()
            
    except OSError as e:
        if e.errno == 10048 or e.errno == 98:  # Puerto en uso
            print(f"\n❌ Error: El puerto {PORT} ya está en uso.")
            print("💡 Cierra la aplicación que está usando ese puerto")
        else:
            print(f"\n❌ Error al iniciar el servidor: {e}")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n\n🛑 Servidor detenido por el usuario.")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Error inesperado: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()


