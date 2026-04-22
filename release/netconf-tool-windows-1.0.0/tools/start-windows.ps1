# Netconf Tool - PowerShell启动脚本
#Requires -Version 5.1

param(
    [switch]$Help
)

if ($Help) {
    Write-Host "Netconf Tool - PowerShell启动脚本"
    Write-Host ""
    Write-Host "用法: .\start-windows.ps1"
    Write-Host ""
    Write-Host "说明: 自动检查环境并启动Netconf Tool"
    exit 0
}

# 设置输出编码
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Netconf Tool - PowerShell启动脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查Node.js是否安装
try {
    $nodeVersion = node --version 2>&1
    if ($LASTEXITCODE -ne 0) { throw "未找到Node.js" }
    Write-Host "[信息] 检测到Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[错误] 未检测到Node.js，请先安装Node.js" -ForegroundColor Red
    Write-Host "下载地址: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "按Enter键退出"
    exit 1
}

Write-Host ""

# 检查是否在正确目录
if (-not (Test-Path "backend\index.js")) {
    Write-Host "[错误] 找不到 backend\index.js" -ForegroundColor Red
    Write-Host "请确保在项目根目录运行此脚本" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "按Enter键退出"
    exit 1
}

# 检查前端是否已构建
if (-not (Test-Path "frontend\dist\index.html")) {
    Write-Host "[警告] 前端未构建，正在构建..." -ForegroundColor Yellow
    Write-Host ""
    Push-Location frontend
    try {
        npm install
        if ($LASTEXITCODE -ne 0) { throw "npm install 失败" }
        npm run build
        if ($LASTEXITCODE -ne 0) { throw "前端构建失败" }
    } catch {
        Write-Host "[错误] $_" -ForegroundColor Red
        Write-Host ""
        Read-Host "按Enter键退出"
        Pop-Location
        exit 1
    }
    Pop-Location
    Write-Host ""
}

# 检查后端依赖
if (-not (Test-Path "backend\node_modules")) {
    Write-Host "[信息] 正在安装后端依赖..." -ForegroundColor Green
    Push-Location backend
    npm install
    Pop-Location
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   正在启动 Netconf Tool..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[提示] 应用将在 http://localhost:3001 启动" -ForegroundColor Yellow
Write-Host "[提示] 按 Ctrl+C 停止服务" -ForegroundColor Yellow
Write-Host ""

# 复制前端构建文件到后端目录（如果需要）
if (-not (Test-Path "backend\dist\index.html")) {
    Write-Host "[信息] 准备前端资源..." -ForegroundColor Green
    Copy-Item -Path "frontend\dist" -Destination "backend\dist" -Recurse -Force
}

# 启动后端
Push-Location backend
node index.js
Pop-Location

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   服务已停止" -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Read-Host "按Enter键退出"
