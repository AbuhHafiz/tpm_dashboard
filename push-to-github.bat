@echo off
title Push TPM Dashboard ke GitHub
cd /d "%~dp0"
echo ============================================================
echo   MENGUNGGAH TPM DASHBOARD KE GITHUB (AbuhHafiz)
echo ============================================================
echo.
echo Melakukan push ke main...
"C:\Program Files\Git\cmd\git.exe" push -u origin main
echo.
if %ERRORLEVEL% equ 0 (
    echo ============================================================
    echo   BERHASIL! Proyek telah terunggah ke GitHub.
    echo ============================================================
) else (
    echo.
    echo Gagal melakukan push. Periksa otorisasi GitHub Anda.
)
pause
