@echo off
title Sync dan Push TPM Dashboard ke Vercel / GitHub
cd /d "%~dp0"
echo ============================================================
echo   SINKRONISASI & PUSH TPM DASHBOARD (AbuhHafiz)
echo ============================================================
echo.
echo [1/3] Menyelaraskan dokumen PDF dan data terbaru...
if not exist "public\uploads" mkdir "public\uploads"
xcopy /E /I /Y "uploads\*" "public\uploads\" >nul 2>&1
if not exist "public\data" mkdir "public\data"
xcopy /E /I /Y "data\*" "public\data\" >nul 2>&1

echo.
echo [2/3] Memperbarui build website...
call npm.cmd run build

echo.
echo [3/3] Mengunggah pembaruan ke GitHub dan Vercel...
"C:\Program Files\Git\cmd\git.exe" add .
"C:\Program Files\Git\cmd\git.exe" commit -m "Update dashboard data & static assets for Vercel"
"C:\Program Files\Git\cmd\git.exe" push origin main

echo.
if %ERRORLEVEL% equ 0 (
    echo ============================================================
    echo   BERHASIL! Web di Vercel otomatis terupdate dalam ~15 detik.
    echo ============================================================
) else (
    echo.
    echo Gagal melakukan push. Periksa koneksi internet Anda.
)
pause
