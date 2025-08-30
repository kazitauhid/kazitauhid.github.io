@echo off
REM === One-click deploy for kazitauhid.github.io ===
REM Runs from the folder this file lives in
cd /d "%~dp0"

REM Require Git
git --version >NUL 2>&1 || (echo Please install Git for Windows first: https://git-scm.com/download/win & pause & exit /b)

REM One-time init if needed
if not exist .git (
  echo [init] Creating local repo...
  git init
  git branch -M main
)

REM Ensure remote is set (edit the URL if your username/repo is different)
git remote get-url origin >NUL 2>&1
if errorlevel 1 (
  echo [init] Linking to GitHub remote...
  git remote add origin https://github.com/kazitauhid/kazitauhid.github.io.git
)

REM Get latest from GitHub to avoid diverging histories
echo [sync] Pulling latest from origin/main...
git pull --rebase --autostash origin main || git pull origin main --allow-unrelated-histories

REM Stage + commit everything
set msg=%*
if "%msg%"=="" set msg=site: auto deploy %date% %time%
echo [commit] %msg%
git add -A
git commit -m "%msg%" || echo [commit] Nothing new to commit.

REM Push to GitHub (this publishes the site)
echo [push] Publishing to GitHub...
git push origin main

echo [done] Deployed. GitHub Pages will rebuild automatically after this push.
pause
