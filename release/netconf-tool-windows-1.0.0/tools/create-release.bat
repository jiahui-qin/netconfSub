@echo off
chcp 65001 >nul
echo ========================================
echo    Netconf Tool - 创建Windows发布包
echo ========================================
echo.

set VERSION=1.0.0
set RELEASE_DIR=release
set PACKAGE_NAME=netconf-tool-windows-%VERSION%

REM 清理旧的发布目录
if exist "%RELEASE_DIR%" (
    echo [信息] 清理旧发布目录...
    rmdir /s /q "%RELEASE_DIR%"
)
mkdir "%RELEASE_DIR%"

REM 步骤1: 检查依赖
echo [步骤 1/7] 检查环境...
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [错误] 未检测到Node.js
    pause
    exit /b 1
)
echo [完成] Node.js已就绪
echo.

REM 步骤2: 安装依赖
echo [步骤 2/7] 安装项目依赖...
if not exist "node_modules" call npm install
cd backend
if not exist "node_modules" call npm install
cd ..\frontend
if not exist "node_modules" call npm install
cd ..
echo [完成] 依赖已安装
echo.

REM 步骤3: 构建前端
echo [步骤 3/7] 构建前端...
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

REM 步骤4: 复制前端资源
echo [步骤 4/7] 准备打包资源...
if exist "backend\dist" rmdir /s /q "backend\dist"
xcopy /E /I /Y "frontend\dist" "backend\dist" >nul
echo [完成] 资源已就绪
echo.

REM 步骤5: 打包应用
echo [步骤 5/7] 正在打包...
cd backend
call npm run pkg:win-x64
if %ERRORLEVEL% NEQ 0 (
    echo [错误] 打包失败
    cd ..
    pause
    exit /b 1
)
cd ..
echo [完成] 打包成功
echo.

REM 步骤6: 组装发布包
echo [步骤 6/7] 组装发布包...
set PKG_PATH=%RELEASE_DIR%\%PACKAGE_NAME%
mkdir "%PKG_PATH%"

REM 复制可执行文件
if exist "dist\netconf-tool-win-x64.exe" (
    copy "dist\netconf-tool-win-x64.exe" "%PKG_PATH%\" >nul
) else if exist "dist\netconf-tool.exe" (
    copy "dist\netconf-tool.exe" "%PKG_PATH%\" >nul
)

REM 复制前端资源
xcopy /E /I /Y "backend\dist" "%PKG_PATH%\dist" >nul

REM 复制启动脚本
copy "scripts\run-package.bat" "%PKG_PATH%\" >nul

REM 复制文档
if exist "README.md" copy "README.md" "%PKG_PATH%\" >nul
if exist "docs\WINDOWS-GUIDE.md" (
    mkdir "%PKG_PATH%\docs" 2>nul
    copy "docs\WINDOWS-GUIDE.md" "%PKG_PATH%\docs\" >nul
)

REM 创建快速启动说明
echo @echo off > "%PKG_PATH%\快速开始.bat"
echo echo Netconf Tool - 快速开始 >> "%PKG_PATH%\快速开始.bat"
echo echo. >> "%PKG_PATH%\快速开始.bat"
echo echo 请按任意键启动 Netconf Tool... >> "%PKG_PATH%\快速开始.bat"
echo pause ^>nul >> "%PKG_PATH%\快速开始.bat"
echo call run-package.bat >> "%PKG_PATH%\快速开始.bat"

echo [完成] 发布包已组装
echo.

REM 步骤7: 创建压缩包
echo [步骤 7/7] 创建压缩包...
where tar >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    pushd "%RELEASE_DIR%"
    tar -czf "%PACKAGE_NAME%.zip" "%PACKAGE_NAME%"
    popd
    echo [完成] 压缩包已创建: %RELEASE_DIR%\%PACKAGE_NAME%.zip
) else (
    echo [提示] 未找到tar命令，请手动压缩 %PKG_PATH% 目录
)
echo.

echo ========================================
echo    发布包创建完成！
echo ========================================
echo.
echo 发布目录: %RELEASE_DIR%\
echo 发布包名: %PACKAGE_NAME%\
echo.
echo 发布包内容:
echo   - netconf-tool-win-x64.exe
echo   - dist\ (前端资源)
echo   - run-package.bat
echo   - 快速开始.bat
echo   - 文档文件
echo.
echo 使用方法:
echo   1. 进入 %RELEASE_DIR%\%PACKAGE_NAME%
echo   2. 双击"快速开始.bat"或"run-package.bat"
echo   3. 浏览器访问 http://localhost:3001
echo.
pause
