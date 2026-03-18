@echo off
echo ========================================
echo NeoAgroTech - Iniciando servidor HTTP
echo (Servidor simple sin HTTPS)
echo ========================================
echo.

REM Verificar si Python está instalado
py --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python no esta instalado.
    echo Por favor instala Python desde https://www.python.org
    pause
    exit /b 1
)

REM Iniciar el servidor HTTP simple
echo [INFO] Iniciando servidor HTTP...
echo.
py server\simple-server.py

pause


