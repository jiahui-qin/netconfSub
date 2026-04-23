const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// 加载环境变量
dotenv.config();

// 创建Express应用
const app = express();
const server = http.createServer(app);

// 配置CORS
app.use(cors());
app.use(express.json());

// 确定静态文件路径（支持开发环境和打包环境）
const getStaticPath = () => {
  // 检查是否在pkg打包环境中
  if (process.pkg) {
    // 优先检查可执行文件同目录下的dist文件夹
    const pkgPath1 = path.join(path.dirname(process.execPath), 'dist');
    if (fs.existsSync(pkgPath1)) {
      return pkgPath1;
    }
    // 检查是否是snapshot内的资源
    try {
      const snapshotPath = path.join(__dirname, 'dist');
      if (fs.existsSync(snapshotPath)) {
        return snapshotPath;
      }
    } catch (e) {
      // 忽略snapshot错误
    }
    // 最后返回默认路径
    return path.join(path.dirname(process.execPath), 'dist');
  }
  
  // 开发环境路径
  const devPath1 = path.join(__dirname, '../frontend/dist');
  if (fs.existsSync(devPath1)) {
    return devPath1;
  }
  
  // 检查后端目录下的dist
  const devPath2 = path.join(__dirname, 'dist');
  if (fs.existsSync(devPath2)) {
    return devPath2;
  }
  
  // 返回默认路径
  return path.join(__dirname, 'dist');
};

const staticPath = getStaticPath();
console.log('Serving static files from:', staticPath);

// 创建Socket.io服务器
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// 导入路由
const connectionRoutes = require('./src/routes/connection');
const messageRoutes = require('./src/routes/message');
const notificationRoutes = require('./src/routes/notification');
const connectionManager = require('./src/core/ConnectionManager');

// 使用路由
app.use('/api/connections', connectionRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);

// 静态文件服务（用于生产环境提供前端）
if (fs.existsSync(staticPath)) {
  app.use(express.static(staticPath));
}

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 所有非API请求都返回前端页面
app.use((req, res, next) => {
  // 如果是API请求，继续处理
  if (req.path.startsWith('/api/')) {
    return next();
  }
  
  // 否则返回前端页面
  const indexPath = path.join(staticPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.json({ 
      message: 'Netconf Tool API Server',
      status: 'running',
      frontend: 'not found - please build the frontend first'
    });
  }
});

// 定期广播连接状态
const broadcastConnectionStatus = () => {
  const connections = connectionManager.getAllConnections();
  const statuses = connections.map(conn => ({
    id: conn.id,
    status: conn.status,
    heartbeatStatus: conn.heartbeatStatus || 'unknown',
    lastActivity: conn.lastActivity,
    lastHeartbeat: conn.lastHeartbeat
  }));
  io.emit('connectionStatusUpdate', statuses);
};

// 每5秒广播一次连接状态
setInterval(broadcastConnectionStatus, 5000);

// 监听Socket连接
io.on('connection', (socket) => {
  console.log('New client connected');
  
  // 立即发送当前连接状态
  broadcastConnectionStatus();
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// 导出io实例供其他模块使用
module.exports.io = io;

// 启动服务器
const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} to access the app`);
});
