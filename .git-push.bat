@echo off
setlocal enabledelayedexpansion

:: ================================
:: Git push helper for Windows
:: Place this file in the project root (same folder as package.json)
:: Run by double-clicking or from PowerShell/CMD
:: ================================

:: --- EDIT THESE 3 LINES ---
set GIT_USERNAME=Jesslearns017
set GIT_EMAIL=jessie.flores002@mymdc.net
set REPO_URL=https://github.com/jesslearns017/weather.git
:: --- DO NOT EDIT BELOW THIS LINE ---

:: Move to script directory to ensure correct working dir
cd /d "%~dp0"

:: Ensure Git is available
where git >NUL 2>&1
if errorlevel 1 (
  echo Git is not installed or not on PATH.
  echo Install Git from https://git-scm.com/downloads and try again.
  pause
  exit /b 1
)

:: Configure identity (global so you don't need to do it again)
git config --global user.name "%GIT_USERNAME%"
git config --global user.email "%GIT_EMAIL%"

:: Initialize repo if needed
if not exist .git (
  echo Initializing repository...
  git init
)

:: Ensure default branch is main
git branch -M main 2>NUL

:: Add remote (or update it if already present)
for /f "tokens=*" %%i in ('git remote') do set HASREMOTE=1
if defined HASREMOTE (
  git remote set-url origin "%REPO_URL%"
) else (
  git remote add origin "%REPO_URL%"
)

:: Create initial commit if none exists
call :has_commit
if errorlevel 1 (
  echo Creating initial commit...
  git add .
  git commit -m "Initial commit"
) else (
  echo Staging changes...
  git add .
  git commit -m "Update" || echo No changes to commit.
)

:: Push to GitHub (create upstream if needed)
 git push -u origin main || git push -f -u origin main

if errorlevel 1 (
  echo.
  echo Push failed. If the remote repo has existing history and you want to OVERWRITE it,
  echo run:  git push -f -u origin main
  echo Or to MERGE histories, run:  git pull origin main --allow-unrelated-histories
  echo then: git push -u origin main
  echo.
  pause
  exit /b 1
)

echo.
echo Done! Repository is pushed to: %REPO_URL%
echo.
pause
exit /b 0

:has_commit
  git rev-parse --verify HEAD >NUL 2>&1
  if errorlevel 1 exit /b 1
  exit /b 0
