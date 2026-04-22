const express = require('express');
const router = express.Router();
const connectionManager = require('../core/ConnectionManager');

// 创建连接
router.post('/create', async (req, res) => {
  try {
    const { id, config } = req.body;
    if (!id || !config) {
      return res.status(400).json({ error: 'Connection ID and config are required' });
    }
    
    const result = await connectionManager.createConnection(id, config);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取所有连接（包含详细状态）
router.get('/', (req, res) => {
  try {
    const connections = connectionManager.getAllConnections();
    // 转换为详细状态格式，不包含敏感信息
    const connectionsWithStatus = connections.map(conn => ({
      id: conn.id,
      status: conn.status,
      heartbeatStatus: conn.heartbeatStatus || 'unknown',
      lastActivity: conn.lastActivity,
      lastHeartbeat: conn.lastHeartbeat,
      config: {
        host: conn.config.host,
        port: conn.config.port,
        username: conn.config.username
      }
    }));
    res.json(connectionsWithStatus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取单个连接
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const connection = connectionManager.getConnection(id);
    if (!connection) {
      return res.status(404).json({ error: 'Connection not found' });
    }
    res.json(connection);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 关闭连接
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await connectionManager.closeConnection(id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 检查连接状态（简单）
router.get('/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const status = connectionManager.checkConnectionStatus(id);
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取连接详细状态（包含心跳信息）
router.get('/:id/status/detail', (req, res) => {
  try {
    const { id } = req.params;
    const status = connectionManager.getConnectionStatus(id);
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 清理闲置连接
router.post('/cleanup', (req, res) => {
  try {
    const { timeout } = req.body;
    const count = connectionManager.cleanupIdleConnections(timeout);
    res.json({ message: `Cleaned up ${count} idle connections` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
