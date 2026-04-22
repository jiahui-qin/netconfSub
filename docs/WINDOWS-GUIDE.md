# Netconf Tool - Windows使用指南

## 📋 目录
- [快速开始](#快速开始)
- [开发模式](#开发模式)
- [打包成可执行文件](#打包成可执行文件)
- [使用打包后的应用](#使用打包后的应用)
- [常见问题](#常见问题)

---

## 🚀 快速开始

### 方式一：使用启动脚本（推荐新手）

项目提供了两个Windows启动脚本：

1. **批处理脚本** ([start-windows.bat](../scripts/start-windows.bat))
   - 双击即可运行
   - 适合所有Windows用户

2. **PowerShell脚本** ([start-windows.ps1](../scripts/start-windows.ps1))
   - 彩色输出，更友好
   - 需要PowerShell 5.1+

**使用步骤：**
```
1. 下载或克隆项目
2. 进入 scripts 目录
3. 双击 start-windows.bat
4. 等待自动安装依赖和构建
5. 浏览器访问 http://localhost:3001
```

---

## 💻 开发模式

### 前置要求
- Windows 10/11
- Node.js 18+ (下载: https://nodejs.org/)
- npm (随Node.js一起安装)

### 手动启动步骤

1. **安装所有依赖**
   ```cmd
   cd netconf-tool
   npm install
   cd backend
   npm install
   cd ../frontend
   npm install
   cd ..
   ```

2. **构建前端**
   ```cmd
   cd frontend
   npm run build
   cd ..
   ```

3. **启动应用**
   ```cmd
   cd backend
   npm start
   ```

4. **访问应用**
   
   打开浏览器访问：http://localhost:3001

---

## 📦 打包成可执行文件

### 使用自动化打包脚本（推荐）

项目提供了Windows自动化打包脚本：[package-windows.bat](../scripts/package-windows.bat)

**打包步骤：**
```cmd
1. 进入 scripts 目录
2. 双击 package-windows.bat
3. 等待打包完成
4. 打包结果在 dist 目录
```

### 手动打包步骤

1. **安装pkg工具（如果还没安装）**
   ```cmd
   npm install -g pkg
   ```

2. **构建前端**
   ```cmd
   cd frontend
   npm run build
   cd ..
   ```

3. **复制前端文件到后端**
   ```cmd
   xcopy /E /I /Y frontend\dist backend\dist
   ```

4. **打包Windows版本**
   ```cmd
   cd backend
   npm run pkg:win
   ```

5. **准备发布包**
   ```cmd
   # 创建发布目录结构
   mkdir dist-package
   cd dist-package
   
   # 复制可执行文件
   copy ..\dist\netconf-tool*.exe .
   
   # 复制前端资源
   xcopy /E /I /Y ..\backend\dist dist
   
   # 复制启动脚本
   copy ..\scripts\run-package.bat .
   ```

---

## 🎯 使用打包后的应用

### 发布包结构
```
dist-package/
├── netconf-tool-win-x64.exe    # 主程序
├── dist/                        # 前端资源目录
│   ├── index.html
│   └── assets/
└── run-package.bat              # 启动脚本（可选）
```

### 启动方式

1. **使用启动脚本（推荐）**
   ```
   双击 run-package.bat
   ```

2. **直接运行exe**
   ```
   双击 netconf-tool-win-x64.exe
   ```

3. **命令行运行**
   ```cmd
   netconf-tool-win-x64.exe
   ```

### 使用步骤

1. **解压或复制发布包到目标位置**
   
2. **双击运行**
   - 首次运行可能会有防火墙提示，选择"允许访问"
   
3. **访问应用**
   
   打开浏览器访问：http://localhost:3001

4. **停止应用**
   
   在命令行窗口按 `Ctrl+C`

---

## 🔧 常见问题

### Q: 双击脚本没有反应？
A: 请确保已安装Node.js，可在命令行运行 `node --version` 检查。

### Q: 提示端口被占用？
A: 可以修改后端配置使用其他端口，或关闭占用3001端口的程序。

### Q: 打包后前端页面显示404？
A: 请确保 `dist` 文件夹与 exe 文件在同一目录下，且 `dist/index.html` 存在。

### Q: 防火墙阻止访问？
A: 首次运行时Windows防火墙会提示，请选择"允许访问"或手动在防火墙中添加规则。

### Q: 如何修改默认端口？
A: 可以设置环境变量 `PORT`，例如：
```cmd
set PORT=8080
netconf-tool-win-x64.exe
```

### Q: 如何让应用后台运行？
A: 可以使用 `start /B` 命令：
```cmd
start /B netconf-tool-win-x64.exe
```

### Q: 打包后的文件太大？
A: pkg打包会包含Node.js运行时，所以文件较大（约100MB+），这是正常的。

### Q: 支持Windows 7吗？
A: 建议使用Windows 10/11，因为Node.js 18+已不再支持Windows 7。

---

## 📞 获取帮助

如遇到问题，请：
1. 查看控制台错误信息
2. 检查Node.js版本
3. 确认依赖安装完整
4. 查看项目主README文档

---

## 📝 更新日志

### v1.0.0
- 初始版本
- 支持Windows打包
- 提供启动脚本
