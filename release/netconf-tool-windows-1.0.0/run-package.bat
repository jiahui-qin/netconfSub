@echo off
chcp 65001 >nul
title Netconf Tool

echo ========================================
echo    Netconf Tool
echo ========================================
echo.

REM 检查可执行文件是否存在
if exist "netconf-tool-win.exe" (
    set EXECUTABLE=netconf-tool-win.exe
) else if exist "netconf-tool.exe" (
    set EXECUTABLE=netconf-tool.exe
) else (
    echo [错误] 找不到可执行文件
    echo.
    echo 请确保以下文件存在:
    echo   - netconf-tool-win.exe 或 netconf-tool.exe
    echo   - dist\ 目录（包含前端资源）
    echo.
    pause
    exit /b 1
)

REM 检查dist目录是否存在
if not exist "dist\index.html" (
    echo [警告] 找不到前端资源文件
    echo.
    echo 请确保 dist\ 目录存在并包含前端文件
    echo.
    pause
)

echo [信息] 启动中...
echo [信息] 可执行文件: %EXECUTABLE%
echo.
echo ========================================
echo [提示] 应用将在 http://localhost:3001 启动
echo [提示] 按 Ctrl+C 停止服务
echo [提示] 首次运行可能需要防火墙授权
echo ========================================
echo.

REM 启动应用
"%EXECUTABLE%"

echo.
echo ========================================
echo    服务已停止
echo ========================================
echo.
pause
