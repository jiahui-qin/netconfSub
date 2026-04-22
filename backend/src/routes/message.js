const express = require('express');
const router = express.Router();
const messageHandler = require('../core/MessageHandler');

// 发送消息
router.post('/send', async (req, res) => {
  try {
    const { connectionId, message } = req.body;
    if (!connectionId || !message) {
      return res.status(400).json({ error: 'Connection ID and message are required' });
    }
    
    const result = await messageHandler.sendMessage(connectionId, message);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取消息历史
router.get('/history', (req, res) => {
  try {
    const { connectionId, limit } = req.query;
    const history = messageHandler.getMessageHistory(connectionId, parseInt(limit) || 100);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 清除消息历史
router.delete('/history', (req, res) => {
  try {
    const { connectionId } = req.query;
    const result = messageHandler.clearMessageHistory(connectionId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 验证消息格式
router.post('/validate', (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const result = messageHandler.validateMessage(message);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 格式化消息
router.post('/format', (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const formatted = messageHandler.formatMessage(message);
    res.json({ formatted });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
