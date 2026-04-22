# Netconf Tool

一个现代化的Netconf设备管理工具，支持多连接管理、实时心跳监控、通知订阅、消息发送和配置管理。

## ✨ 功能特性

- 📡 **多连接管理** - 同时管理多个Netconf设备连接
- 💓 **心跳监控** - 实时监控设备连接状态，自动检测连接健康
- 💬 **Netconf消息** - 发送和接收Netconf XML消息，支持历史记录
- 🔔 **实时通知** - 订阅和接收设备通知
- ⚙️ **配置管理** - 查看和管理设备配置
- 🎨 **现代化界面** - 响应式设计，深色主题，流畅动画
- 📦 **开箱即用** - 支持打包成独立可执行文件
- 🐳 **Docker支持** - 一键部署容器化应用
- 🪟 **Windows优化** - 专为Windows平台提供启动脚本和打包工具

## 🛠️ 技术栈

### 后端
- Node.js
- Express.js
- netconf-client
- Socket.io (实时通信)

### 前端
- React 19
- Vite
- Tailwind CSS 3
- Monaco Editor (代码编辑器)
- Socket.io-client

## 🚀 快速开始

### Windows用户快速开始

Windows用户可以使用项目提供的自动化脚本快速启动：

1. **进入 scripts 目录**
2. **双击运行 `start-windows.bat`**
3. **等待自动安装依赖和构建**
4. **浏览器访问 http://localhost:3001**

> 💡 更多Windows使用详情请查看：[Windows使用指南](./docs/WINDOWS-GUIDE.md)

### 前置条件

确保你的系统已安装：
- Node.js (v18+ 推荐)
- npm (v9+)

### 开发模式启动

#### 1. 安装所有依赖

```bash
npm run install:all
```

#### 2. 构建前端

```bash
npm run build
```

#### 3. 启动应用

```bash
npm start
```

应用将在 `http://localhost:3001` 启动。

### 传统分步启动

#### 后端启动

```bash
cd backend
npm install
npm start
```

#### 前端开发模式

```bash
cd frontend
npm install
npm run dev
```

前端服务将在 `http://localhost:5173` 启动。

## 📦 打包部署

### Windows平台打包（推荐）

Windows用户可以使用自动化脚本一键打包：

```cmd
# 进入 scripts 目录
cd scripts

# 双击运行 create-release.bat
# 或在命令行执行
create-release.bat
```

这将自动完成以下步骤：
- 检查环境和依赖
- 构建前端
- 打包成exe文件
- 组装完整的发布包
- 创建压缩包（如支持）

发布包将生成在 `release/` 目录中。

### 打包成可执行文件

#### 安装打包依赖

```bash
cd backend
npm install
```

#### 构建前端并打包

```bash
# 在项目根目录
npm run package
```

或者针对特定平台：

```bash
# Windows
npm run package:win

# Linux
npm run package:linux

# macOS
npm run package:mac
```

打包后的文件将生成在 `dist/` 目录下。

#### 使用打包后的应用

1. 进入 `dist/` 目录
2. 确保 `dist/` 文件夹下有 `dist/` 子文件夹（包含前端构建文件）
3. 运行对应的可执行文件：
   - Windows: `netconf-tool.exe`
   - Linux: `./netconf-tool`
   - macOS: `./netconf-tool`

> 💡 **Windows用户特别说明：** 建议使用 `scripts/` 目录下的 `create-release.bat` 脚本来创建完整的发布包，这样会包含启动脚本和文档，使用更方便。

### Docker部署

#### 构建Docker镜像

```bash
npm run docker:build
```

或者手动构建：

```bash
docker build -t netconf-tool .
```

#### 运行Docker容器

```bash
npm run docker:run
```

或者手动运行：

```bash
docker run -d -p 3001:3001 --name netconf-tool netconf-tool
```

#### 使用Docker Compose

```bash
docker-compose up -d
```

## 📖 使用说明

### 1. 访问应用

打开浏览器访问 `http://localhost:3001`

### 2. 管理连接

- 点击右上角的 `Manage Connections` 按钮
- 添加新的Netconf设备连接（主机、端口、用户名、密码）
- 查看连接的实时状态和心跳信息
- 绿色表示连接正常，红色表示连接断开

### 3. 发送Netconf消息

- 在 `Messages` 标签页中选择一个连接
- 编辑或输入Netconf XML消息
- 点击 `Send Message` 发送
- 查看响应和历史消息记录

### 4. 订阅通知

- 在 `Notifications` 标签页中选择一个连接
- 点击 `Subscribe` 创建通知订阅
- 实时接收设备推送的通知

### 5. 查看配置

- 在 `Config` 标签页中选择一个连接
- 点击 `Refresh` 获取设备配置
- 在编辑器中查看格式化的配置信息

## 🏗️ 项目结构

```
netconf_tool/
├── backend/
│   ├── src/
│   │   ├── core/
│   │   │   ├── ConnectionManager.js      # 连接管理和心跳
│   │   │   ├── MessageHandler.js         # 消息处理
│   │   │   └── NotificationManager.js    # 通知管理
│   │   └── routes/
│   │       ├── connection.js             # 连接API
│   │       ├── message.js                # 消息API
│   │       └── notification.js           # 通知API
│   ├── index.js                          # 后端入口
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── ConnectionManager.jsx
│   │   ├── pages/
│   │   │   ├── MessagePage.jsx
│   │   │   ├── NotificationPage.jsx
│   │   │   └── ConfigPage.jsx
│   │   └── App.jsx
│   └── package.json
├── dist/                                 # 打包输出目录
├── Dockerfile                            # Docker配置
├── docker-compose.yml                    # Docker Compose配置
├── package.json                          # 根目录配置
└── README.md
```

## 🔌 API接口

### 连接管理
- `POST /api/connections/create` - 创建连接
- `GET /api/connections` - 获取所有连接
- `GET /api/connections/:id` - 获取连接信息
- `GET /api/connections/:id/status/detail` - 获取详细连接状态
- `DELETE /api/connections/:id` - 删除连接
- `POST /api/connections/cleanup` - 清理闲置连接

### 消息处理
- `POST /api/messages/send` - 发送Netconf消息
- `GET /api/messages/history` - 获取消息历史
- `DELETE /api/messages/history` - 清理消息历史
- `POST /api/messages/validate` - 验证消息格式
- `POST /api/messages/format` - 格式化消息

### 通知管理
- `POST /api/notifications/subscribe` - 创建订阅
- `POST /api/notifications/unsubscribe` - 取消订阅
- `GET /api/notifications/history` - 获取通知历史
- `DELETE /api/notifications/history` - 清理通知历史

### 系统
- `GET /health` - 健康检查

## 💓 心跳机制

- 默认心跳间隔：30秒
- 通过发送简单的Netconf请求检测连接健康
- 实时更新连接状态（通过Socket.io广播）
- 支持查看最后心跳时间

## 🎨 界面预览

- **深色主题** - 护眼的深色设计
- **渐变色彩** - 现代的渐变配色方案
- **响应式布局** - 适配各种屏幕尺寸
- **流畅动画** - 平滑的过渡和交互反馈
- **实时更新** - WebSocket实时推送状态变化

## 📝 开发说明

### 前端开发

```bash
cd frontend
npm run dev
```

### 构建前端

```bash
cd frontend
npm run build
```

### 代码规范

```bash
cd frontend
npm run lint
```

## ⚠️ 注意事项

- 确保目标设备已启用Netconf服务
- 确保网络连接通畅且防火墙允许相应端口
- 妥善保管设备凭据，避免泄露
- 生产环境建议修改默认端口和添加身份验证
- 心跳间隔可根据网络状况调整

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可证

MIT License
