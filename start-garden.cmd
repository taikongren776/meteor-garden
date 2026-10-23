@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
  echo 请先安装 Node.js 22.12 或更新版本，然后重新运行。
  pause
  exit /b 1
)
if not exist node_modules\vite (
  echo 正在安装项目依赖，首次启动需要网络连接...
  call npm.cmd ci --registry=https://registry.npmjs.org
  if errorlevel 1 (
    pause
    exit /b 1
  )
)
echo 流星花园正在启动，请保持此窗口打开。按 Ctrl+C 结束。
call npm.cmd run dev -- --open
