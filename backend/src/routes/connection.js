const express = require('express');
const router = express.Router();
const connectionManager = require('../core/ConnectionManager');

// 添加设备（不连接）
router.post('/add', async (req, res) => {
  try {
    const { id, config } = req.body;
    if (!id || !config) {
      return res.status(400).json({ error: 'Device ID and config are required' });
    }
    
    const result = connectionManager.addDevice(id, config);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 测试连接
router.post('/test', async (req, res) => {
  try {
    const { config } = req.body;
    if (!config) {
      return res.status(400).json({ error: 'Config is required' });
    }
    
    const result = await connectionManager.testConnection(config);
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// 连接设备
router.post('/:id/connect', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await connectionManager.connectDevice(id);
    res.json(result);
  } catch (error) {
    try {
      const errorObj = JSON.parse(error.message);
      res.status(500).json({
        error: errorObj.message,
        errorCode: errorObj.code,
        originalError: errorObj.originalError
      });
    } catch (parseError) {
      res.status(500).json({ error: error.message });
    }
  }
});

// 断开设备
router.post('/:id/disconnect', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await connectionManager.disconnectDevice(id);
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
      deviceCapabilities: conn.deviceCapabilities || [],
      connectionError: conn.connectionError,
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
    // 返回连接信息，包含设备能力
    const connectionInfo = {
      id: connection.id,
      status: connection.status,
      config: connection.config,
      lastActivity: connection.lastActivity,
      lastHeartbeat: connection.lastHeartbeat,
      heartbeatStatus: connection.heartbeatStatus,
      deviceCapabilities: connection.deviceCapabilities || [],
      connectionError: connection.connectionError
    };
    res.json(connectionInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 删除设备
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // 先断开连接
    try {
      await connectionManager.disconnectDevice(id);
    } catch (e) {
      // 忽略断开错误
    }
    // 然后从Map中删除
    connectionManager.getConnectionsMap().delete(id);
    res.json({ id, message: 'Device deleted successfully' });
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
