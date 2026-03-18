#!/usr/bin/env python3
"""
NeoAgroTech - Servidor HTTPS con Python
Servidor HTTPS simple para servir archivos estáticos
"""
import http.server
import ssl
import socketserver
import os
import sys
import json
from pathlib import Path
from urllib.parse import urlparse, parse_qs

# Configuración
PORT = 8443
HOST = 'localhost'
CERT_DIR = Path(__file__).parent / 'cert'
KEY_FILE = CERT_DIR / 'server.key'
CERT_FILE = CERT_DIR / 'server.crt'

# Directorio raíz del proyecto
ROOT_DIR = Path(__file__).parent.parent

class NeoAgroTechHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Manejador personalizado para servir archivos estáticos y API"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT_DIR), **kwargs)
    
    def end_headers(self):
        # Headers CORS
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        # Headers de seguridad
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-Frame-Options', 'DENY')
        self.send_header('X-XSS-Protection', '1; mode=block')
        self.send_header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
        super().end_headers()
    
    def do_OPTIONS(self):
        """Manejar preflight CORS"""
        self.send_response(200)
        self.end_headers()
    
    def do_GET(self):
        """Manejar peticiones GET"""
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/api/health':
            self.send_json_response({'status': 'ok'})
        else:
            super().do_GET()
    
    def do_POST(self):
        """Manejar peticiones POST para API"""
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/api/chat':
            self.handle_chat()
        elif parsed_path.path == '/api/contact':
            self.handle_contact()
        else:
            self.send_error(404, "Not Found")
    
    def send_json_response(self, data, status_code=200):
        """Enviar respuesta JSON"""
        json_data = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(json_data)))
        self.end_headers()
        self.wfile.write(json_data)
    
    def handle_chat(self):
        """Manejar peticiones del chatbot"""
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            data = json.loads(body.decode('utf-8'))
            prompt = data.get('prompt', '').lower()
            
            # Generar respuesta basada en reglas
            response = self.get_chatbot_response(prompt)
            
            self.send_json_response({'response': response})
        except Exception as e:
            print(f"Error en handle_chat: {e}")
            self.send_json_response({'error': 'Error procesando la consulta'}, 500)
    
    def get_chatbot_response(self, prompt):
        """Generar respuesta del chatbot basada en reglas"""
        prompt_lower = prompt.lower()
        
        if any(word in prompt_lower for word in ['hola', 'buenos días', 'buenas tardes', 'saludos']):
            return "¡Hola! 👋 Me alegra saludarte. ¿En qué puedo ayudarte? Puedo informarte sobre nuestros seguros de siembra, maquinaria o el retorno de inversión."
        
        elif any(word in prompt_lower for word in ['siembra', 'cultivo', 'sembrar']):
            return "Nuestros seguros de siembra ofrecen cobertura completa contra riesgos climáticos, plagas y pérdidas de producción. Además, garantizamos un retorno de inversión del 5% al 10%. ¿Te gustaría más detalles?"
        
        elif any(word in prompt_lower for word in ['maquinaria', 'equipo', 'tractor', 'maquina']):
            return "El seguro de maquinaria protege tus equipos agrícolas frente a daños, accidentes o pérdidas. Cubre tractores, cosechadoras y toda tu maquinaria. ¿Qué tipo de equipo necesitas asegurar?"
        
        elif any(word in prompt_lower for word in ['retorno', 'inversión', 'beneficio', 'ganancia', 'rendimiento']):
            return "NeoAgroTech garantiza un retorno de inversión entre el 5% y el 10% sobre lo invertido en siembras o maquinaria agrícola. Es una forma segura de proteger y hacer crecer tu inversión."
        
        elif any(word in prompt_lower for word in ['precio', 'costo', 'cotización', 'cuánto']):
            return "Para obtener una cotización personalizada, puedes completar el formulario de contacto en nuestra página o escribirme tus datos y te contactaremos pronto."
        
        elif any(word in prompt_lower for word in ['contacto', 'teléfono', 'email', 'correo']):
            return "Puedes contactarnos completando el formulario en la sección de contacto. Nuestro equipo se pondrá en contacto contigo a la brevedad."
        
        elif any(word in prompt_lower for word in ['gracias', 'muchas gracias']):
            return "¡De nada! 😊 Estoy aquí para ayudarte. Si tienes más preguntas, no dudes en consultarme."
        
        else:
            return "Entiendo tu consulta. Puedo ayudarte con información sobre seguros de siembra, maquinaria agrícola, retorno de inversión o cotizaciones. ¿Sobre qué te gustaría saber más?"
    
    def handle_contact(self):
        """Manejar peticiones del formulario de contacto"""
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            data = json.loads(body.decode('utf-8'))
            
            # Aquí podrías guardar los datos en una base de datos o enviar un email
            nombre = data.get('nombre', '')
            correo = data.get('correo', '')
            interes = data.get('interes', '')
            mensaje = data.get('mensaje', '')
            
            # Log para desarrollo (en producción, guardar en BD o enviar email)
            print(f"\n📧 Nuevo contacto recibido:")
            print(f"   Nombre: {nombre}")
            print(f"   Correo: {correo}")
            print(f"   Interés: {interes}")
            print(f"   Mensaje: {mensaje}\n")
            
            self.send_json_response({
                'message': f'¡Gracias {nombre}! Tu solicitud ha sido recibida. Te contactaremos pronto en {correo}.'
            })
        except Exception as e:
            print(f"Error en handle_contact: {e}")
            self.send_json_response({'error': 'Error procesando el formulario'}, 500)
    
    def log_message(self, format, *args):
        """Personalizar mensajes de log"""
        # No mostrar logs de archivos estáticos para mantener limpia la consola
        if not self.path.startswith('/api/'):
            print(f"[{self.log_date_time_string()}] {format % args}")

def check_certificates():
    """Verificar que existan los certificados SSL"""
    if not KEY_FILE.exists() or not CERT_FILE.exists():
        print("=" * 60)
        print("❌ Error: No se encontraron los certificados SSL.")
        print("=" * 60)
        print("\n💡 Opciones:")
        print("   1. Ejecuta: npm run generate-cert (si tienes Node.js)")
        print("   2. O genera los certificados manualmente con OpenSSL:")
        print(f"      openssl genrsa -out {KEY_FILE} 2048")
        print(f"      openssl req -new -x509 -key {KEY_FILE} -out {CERT_FILE} -days 365")
        print("\n   3. O ejecuta el generador de certificados en Python:")
        print("      python server/generate-cert.py")
        print("=" * 60)
        return False
    return True

def main():
    """Función principal"""
    print("=" * 60)
    print("🌾 NeoAgroTech - Servidor HTTPS (Python)")
    print("=" * 60)
    
    # Verificar certificados
    if not check_certificates():
        sys.exit(1)
    
    # Cambiar al directorio raíz
    os.chdir(ROOT_DIR)
    
    # Crear el servidor
    try:
        with socketserver.TCPServer((HOST, PORT), NeoAgroTechHTTPRequestHandler) as httpd:
            # Configurar SSL
            context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
            context.load_cert_chain(certfile=str(CERT_FILE), keyfile=str(KEY_FILE))
            httpd.socket = context.wrap_socket(httpd.socket, server_side=True)
            
            # Mostrar información
            print(f"\n✅ Servidor HTTPS iniciado exitosamente!")
            print(f"   🌐 URL: https://{HOST}:{PORT}")
            print(f"   🌐 URL alternativa: https://127.0.0.1:{PORT}")
            print("=" * 60)
            print("⚠️  Nota: El certificado es autofirmado.")
            print("   Tu navegador mostrará una advertencia de seguridad.")
            print("   Haz clic en 'Avanzado' y luego 'Continuar' para acceder.")
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
            print("   o cambia el puerto en el archivo server/https-server.py")
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

