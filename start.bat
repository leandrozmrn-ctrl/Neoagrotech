@echo off
echo ========================================
echo NeoAgroTech - Iniciando servidor HTTPS
echo ========================================
echo.

REM Verificar si Node.js está instalado
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js no esta instalado.
    echo Por favor instala Node.js desde https://nodejs.org
    pause
    exit /b 1
)

REM Verificar si existen los certificados
if not exist "server\cert\server.key" (
    echo [INFO] Generando certificados SSL...
    call npm run generate-cert
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] No se pudieron generar los certificados.
        echo Asegurate de tener OpenSSL instalado.
        pause
        exit /b 1
    )
)

REM Iniciar el servidor
echo [INFO] Iniciando servidor HTTPS...
echo.
call npm start

pause

