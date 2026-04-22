# Netconf本地工具

一个现代化的Netconf本地工具，支持多连接管理、实时通知订阅、Netconf消息发送和接收、设备配置管理。

## 功能特性

- 📡 **多连接管理** - 同时管理多个Netconf设备连接
- 💬 **Netconf消息** - 发送和接收Netconf XML消息
- 🔔 **实时通知** - 订阅和接收设备通知
- ⚙️ **配置管理** - 查看和管理设备配置
- 🎨 **现代化界面** - 响应式设计，深色主题

## 技术栈

### 后端
- Node.js
- Express.js
- netconf-client
- Socket.io
- Axios

### 前端
- React 19
- Vite
- Tailwind CSS 3
- Monaco Editor
- Socket.io-client

## 本地启动

### 前置条件

确保你的系统已安装：
- Node.js (v16+ 推荐)
- npm (v7+)

### 启动步骤

#### 1. 安装后端依赖

```bash
cd backend
npm install
```

#### 2. 启动后端服务

```bash
cd backend
node index.js
```

后端服务将在 `http://localhost:3001` 启动。

#### 3. 安装前端依赖

```bash
cd frontend
npm install
```

#### 4. 启动前端服务

```bash
cd frontend
npm run dev
```

前端服务将在 `http://localhost:5173` 启动。

### 使用说明

1. 访问 `http://localhost:5173`
2. 点击 `Manage Connections` 添加Netconf设备连接
3. 在 `Messages` 标签页发送Netconf XML消息
4. 在 `Notifications` 标签页创建通知订阅
5. 在 `Config` 标签页查看设备配置

## 项目结构

```
netconf_tool/
├── backend/
│   ├── src/
│   │   ├── core/
│   │   │   ├── ConnectionManager.js      # 连接管理
│   │   │   ├── MessageHandler.js         # 消息处理
│   │   │   └── NotificationManager.js    # 通知管理
│   │   └── routes/
│   │       ├── connection.js             # 连接API
│   │       ├── message.js                # 消息API
│   │       └── notification.js           # 通知API
│   ├── index.js                          # 后端入口
│   ├── package.json
│   └── package-lock.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── Sidebar.jsx
    │   │   └── ConnectionManager.jsx
    │   ├── pages/
    │   │   ├── MessagePage.jsx
    │   │   ├── NotificationPage.jsx
    │   │   └── ConfigPage.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    ├── postcss.config.js
    └── vite.config.js
```

## API接口

### 连接管理
- `POST /api/connections/create` - 创建连接
- `GET /api/connections` - 获取所有连接
- `GET /api/connections/:id` - 获取连接信息
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

## 开发说明

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

### 预览构建结果

```bash
cd frontend
npm run preview
```

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request！

## 注意事项

- 确保目标设备已启用Netconf服务
- 确保网络连接通畅
- 妥善管理设备凭据
