@echo off
cd /d "%~dp0"
if exist "dist\SwissDriver_Lab.html" goto open
where node >nul 2>nul
if errorlevel 1 (
 echo Le ZIP Edition contient deja le jeu dans dist. Sinon, Node.js est necessaire pour le construire.
 pause
 exit /b 1
)
node scripts\build.cjs
if errorlevel 1 (pause & exit /b 1)
:open
start "" "dist\SwissDriver_Lab.html"
