@echo off
chcp 65001 >nul
echo ========================================
echo    Netconf Tool - Windows打包脚本
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
if not exist "backend\package.json" (
    echo [错误] 找不到 backend\package.json
    echo 请确保在项目根目录运行此脚本
    echo.
    pause
    exit /b 1
)

REM 步骤1: 安装依赖
echo [步骤 1/5] 检查并安装依赖...
if not exist "node_modules" (
    call npm install
)
cd backend
if not exist "node_modules" (
    call npm install
)
cd ..
cd frontend
if not exist "node_modules" (
    call npm install
)
cd ..
echo [完成] 依赖已就绪
echo.

REM 步骤2: 构建前端
echo [步骤 2/5] 构建前端...
cd frontend
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [错误] 前端构建失败
    cd ..
    pause
    exit /b 1
)
cd ..
echo [完成] 前端构建成功
echo.

REM 步骤3: 复制前端文件到后端
echo [步骤 3/5] 准备打包资源...
if exist "backend\dist" (
    rmdir /s /q "backend\dist"
)
xcopy /E /I /Y "frontend\dist" "backend\dist" >nul
echo [完成] 资源已就绪
echo.

REM 步骤4: 打包
echo [步骤 4/5] 正在打包Windows版本...
cd backend
call npm run pkg:win
if %ERRORLEVEL% NEQ 0 (
    echo [错误] 打包失败
    cd ..
    pause
    exit /b 1
)
cd ..
echo [完成] 打包成功
echo.

REM 步骤5: 准备发布包
echo [步骤 5/5] 准备发布包...
if not exist "dist" mkdir dist
if not exist "dist\dist" mkdir dist\dist

REM 复制可执行文件
for %%f in (dist\netconf-tool*.exe) do (
    if exist "%%f" (
        copy "%%f" "dist\" >nul
        echo [信息] 已复制 %%~nxf
    )
)

REM 复制前端资源
xcopy /E /I /Y "backend\dist" "dist\dist" >nul

REM 复制启动脚本
if exist "scripts\run-package.bat" (
    copy "scripts\run-package.bat" "dist\" >nul
)

echo.
echo ========================================
echo    打包完成！
echo ========================================
echo.
echo 输出目录: dist\
echo.
echo 发布包包含:
echo   - netconf-tool-win.exe (可执行文件)
echo   - dist\ (前端资源目录)
echo.
echo 使用方法:
echo   1. 进入 dist 目录
echo   2. 双击运行 netconf-tool-win.exe
echo   3. 浏览器访问 http://localhost:3001
echo.
pause
