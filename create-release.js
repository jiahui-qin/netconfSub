const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('   Netconf Tool - 创建发布包');
console.log('========================================');
console.log();

const VERSION = '1.0.0';
const RELEASE_DIR = 'release';
const PACKAGE_NAME = `netconf-tool-windows-${VERSION}`;
const WORKSPACE_DIR = '/workspace';

// 清理旧的发布目录
const releasePath = path.join(WORKSPACE_DIR, RELEASE_DIR);
if (fs.existsSync(releasePath)) {
    console.log('[信息] 清理旧发布目录...');
    const files = fs.readdirSync(releasePath);
    files.forEach(file => {
        const filePath = path.join(releasePath, file);
        if (fs.lstatSync(filePath).isDirectory()) {
            fs.rmSync(filePath, { recursive: true, force: true });
        } else {
            fs.unlinkSync(filePath);
        }
    });
} else {
    fs.mkdirSync(releasePath, { recursive: true });
}

console.log('[完成] 目录已准备');
console.log();

// 创建发布包目录
const pkgPath = path.join(releasePath, PACKAGE_NAME);
fs.mkdirSync(pkgPath, { recursive: true });

// 复制前端资源
console.log('[步骤 1/6] 复制前端资源...');
const frontendDist = path.join(WORKSPACE_DIR, 'backend', 'dist');
const pkgDist = path.join(pkgPath, 'dist');
fs.mkdirSync(pkgDist, { recursive: true });
copyDirectory(frontendDist, pkgDist);
console.log('[完成] 前端资源已复制');
console.log();

// 复制启动脚本
console.log('[步骤 2/6] 复制启动脚本...');
const runPackageScript = path.join(WORKSPACE_DIR, 'scripts', 'run-package.bat');
fs.copyFileSync(runPackageScript, path.join(pkgPath, 'run-package.bat'));
console.log('[完成] 启动脚本已复制');
console.log();

// 复制文档
console.log('[步骤 3/6] 复制文档...');
fs.copyFileSync(path.join(WORKSPACE_DIR, 'README.md'), path.join(pkgPath, 'README.md'));
const docsDir = path.join(pkgPath, 'docs');
fs.mkdirSync(docsDir, { recursive: true });
fs.copyFileSync(path.join(WORKSPACE_DIR, 'docs', 'WINDOWS-GUIDE.md'), path.join(docsDir, 'WINDOWS-GUIDE.md'));
console.log('[完成] 文档已复制');
console.log();

// 创建快速启动脚本
console.log('[步骤 4/6] 创建快速启动脚本...');
const quickStartScript = `@echo off
echo Netconf Tool - 快速开始
echo.
echo 请按任意键启动 Netconf Tool...
pause >nul
call run-package.bat
`;
fs.writeFileSync(path.join(pkgPath, '快速开始.bat'), quickStartScript);
console.log('[完成] 快速启动脚本已创建');
console.log();

// 创建说明文件
console.log('[步骤 5/6] 创建使用说明...');
const readmeText = `Netconf Tool - Windows发布包
=========================

注意: 此发布包尚未包含 exe 文件。

请在 Windows 环境下运行以下命令生成 exe 文件:
  cd backend
  npm run pkg:win

或者使用 scripts/create-release.bat 脚本。

开发模式启动: 双击 快速开始.bat (需要先在Windows环境安装Node.js)

文件说明:
- dist/: 前端资源文件
- README.md: 项目主文档
- docs/WINDOWS-GUIDE.md: Windows使用指南
- run-package.bat: 标准启动脚本
- 快速开始.bat: 快速启动脚本

发布包创建时间: ${new Date().toLocaleString()}
`;
fs.writeFileSync(path.join(pkgPath, '使用说明.txt'), readmeText);
console.log('[完成] 使用说明已创建');
console.log();

// 检查是否需要复制 scripts 目录
console.log('[步骤 6/6] 复制工具脚本...');
const pkgScripts = path.join(pkgPath, 'tools');
fs.mkdirSync(pkgScripts, { recursive: true });
const scriptsDir = path.join(WORKSPACE_DIR, 'scripts');
const scripts = ['create-release.bat', 'package-windows.bat', 'start-windows.bat', 'start-windows.ps1'];
scripts.forEach(script => {
    const src = path.join(scriptsDir, script);
    if (fs.existsSync(src)) {
        fs.copyFileSync(src, path.join(pkgScripts, script));
    }
});
console.log('[完成] 工具脚本已复制');
console.log();

console.log('========================================');
console.log('   发布包创建完成！');
console.log('========================================');
console.log();
console.log('发布目录:', RELEASE_DIR);
console.log('发布包名:', PACKAGE_NAME);
console.log();
console.log('发布包内容:');
console.log('  - dist/ (前端资源)');
console.log('  - tools/ (打包工具脚本)');
console.log('  - run-package.bat');
console.log('  - 快速开始.bat');
console.log('  - README.md');
console.log('  - docs/WINDOWS-GUIDE.md');
console.log('  - 使用说明.txt');
console.log();
console.log('下一步:');
console.log('  1. 将此发布包复制到 Windows 机器');
console.log('  2. 在 Windows 上进入 tools/ 目录');
console.log('  3. 双击运行 create-release.bat');
console.log('  4. 或者手动运行: cd backend && npm run pkg:win');
console.log();
console.log('开发模式:');
console.log('  1. 确保已安装 Node.js');
console.log('  2. 双击"快速开始.bat"');
console.log('  3. 浏览器访问 http://localhost:3001');
console.log();

function copyDirectory(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (entry.isDirectory()) {
            copyDirectory(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}
