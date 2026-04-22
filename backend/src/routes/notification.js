const express = require('express');
const router = express.Router();
const connectionManager = require('../core/ConnectionManager');
const notificationManager = require('../core/NotificationManager');

// 创建订阅
router.post('/subscribe', async (req, res) => {
  try {
    const { connectionId, subscription } = req.body;
    if (!connectionId || !subscription) {
      return res.status(400).json({ error: 'Connection ID and subscription are required' });
    }
    
    const result = await connectionManager.subscribeNotification(connectionId, subscription);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 取消订阅
router.post('/unsubscribe', async (req, res) => {
  try {
    const { connectionId, subscriptionId } = req.body;
    if (!connectionId || !subscriptionId) {
      return res.status(400).json({ error: 'Connection ID and subscription ID are required' });
    }
    
    const result = await connectionManager.unsubscribeNotification(connectionId, subscriptionId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取通知历史
router.get('/history', (req, res) => {
  try {
    const { connectionId, limit } = req.query;
    const notifications = notificationManager.getNotifications(connectionId, parseInt(limit) || 50);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 清除通知历史
router.delete('/history', (req, res) => {
  try {
    const { connectionId } = req.query;
    const result = notificationManager.clearNotifications(connectionId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
