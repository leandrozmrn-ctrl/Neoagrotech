#!/bin/bash

echo "========================================"
echo "NeoAgroTech - Iniciando servidor HTTPS"
echo "========================================"
echo ""

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js no está instalado."
    echo "Por favor instala Node.js desde https://nodejs.org"
    exit 1
fi

# Verificar si existen los certificados
if [ ! -f "server/cert/server.key" ] || [ ! -f "server/cert/server.crt" ]; then
    echo "[INFO] Generando certificados SSL..."
    npm run generate-cert
    if [ $? -ne 0 ]; then
        echo "[ERROR] No se pudieron generar los certificados."
        echo "Asegúrate de tener OpenSSL instalado."
        exit 1
    fi
fi

# Iniciar el servidor
echo "[INFO] Iniciando servidor HTTPS..."
echo ""
npm start

