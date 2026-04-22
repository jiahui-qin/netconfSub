@echo off
chcp 65001 >nul
echo ========================================
echo    Netconf Tool - Windows启动脚本
echo ========================================
echo.

REM 检查Node.js是否安装
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [错误] 未检测到Node.js，请先安装Node.js
    echo 下载地址: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [信息] 检测到Node.js
node --version
echo.

REM 检查是否在正确目录
if not exist "backend\index.js" (
    echo [错误] 找不到 backend\index.js
    echo 请确保在项目根目录运行此脚本
    echo.
    pause
    exit /b 1
)

REM 检查前端是否已构建
if not exist "frontend\dist\index.html" (
    echo [警告] 前端未构建，正在构建...
    echo.
    cd frontend
    call npm install
    call npm run build
    cd ..
    if %ERRORLEVEL% NEQ 0 (
        echo [错误] 前端构建失败
        echo.
        pause
        exit /b 1
    )
    echo.
)

REM 检查后端依赖
if not exist "backend\node_modules" (
    echo [信息] 正在安装后端依赖...
    cd backend
    call npm install
    cd ..
    echo.
)

echo ========================================
echo    正在启动 Netconf Tool...
echo ========================================
echo.
echo [提示] 应用将在 http://localhost:3001 启动
echo [提示] 按 Ctrl+C 停止服务
echo.

REM 复制前端构建文件到后端目录（如果需要）
if not exist "backend\dist\index.html" (
    echo [信息] 准备前端资源...
    xcopy /E /I /Y "frontend\dist" "backend\dist" >nul
)

REM 启动后端
cd backend
node index.js

echo.
echo ========================================
echo    服务已停止
echo ========================================
echo.
pause
