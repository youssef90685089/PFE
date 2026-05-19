@echo off
echo ============================================
echo   SIPMS Report Compiler
echo ============================================
set MIKTEX=C:\Users\LENOVO\AppData\Local\Programs\MiKTeX\miktex\bin\x64
echo Compiling (pass 1)...
"%MIKTEX%\pdflatex.exe" --interaction=nonstopmode --enable-installer main.tex
echo Compiling (pass 2 - TOC update)...
"%MIKTEX%\pdflatex.exe" --interaction=nonstopmode --enable-installer main.tex
echo.
echo ============================================
echo   Done! Opening main.pdf...
echo ============================================
start main.pdf
pause
