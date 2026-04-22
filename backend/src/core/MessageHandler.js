const connectionManager = require('./ConnectionManager');

class MessageHandler {
  constructor() {
    this.messageHistory = [];
  }

  // 发送Netconf消息
  async sendMessage(connectionId, message) {
    try {
      const result = await connectionManager.executeRPC(connectionId, message);
      
      const messageData = {
        id: `msg_${Date.now()}`,
        connectionId,
        direction: 'outgoing',
        message,
        timestamp: new Date()
      };

      const responseData = {
        id: `msg_${Date.now()}_response`,
        connectionId,
        direction: 'incoming',
        message: result, 
        timestamp: new Date(),
        relatedMessageId: messageData.id
      };

      // 存储消息历史
      this.messageHistory.push(messageData);
      this.messageHistory.push(responseData);

      // 限制历史消息数量
      if (this.messageHistory.length > 1000) {
        this.messageHistory = this.messageHistory.slice(-1000);
      }

      return {
        success: true,
        messageId: messageData.id,
        response: result
      };
    } catch (error) {
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }

  // 获取消息历史
  getMessageHistory(connectionId, limit = 100) {
    let history = this.messageHistory;
    
    if (connectionId) {
      history = history.filter(msg => msg.connectionId === connectionId);
    }
    
    return history.slice(-limit);
  }

  // 清除消息历史
  clearMessageHistory(connectionId) {
    if (connectionId) {
      this.messageHistory = this.messageHistory.filter(msg => msg.connectionId !== connectionId);
    } else {
      this.messageHistory = [];
    }
    
    return { message: 'Message history cleared successfully' };
  }

  // 验证Netconf消息格式
  validateMessage(message) {
    try {
      // 简单的XML格式验证
      if (!message || typeof message !== 'string') {
        return { valid: false, error: 'Message must be a non-empty string' };
      }

      // 检查是否包含基本的XML结构
      if (!message.includes('<rpc') || !message.includes('</rpc>')) {
        return { valid: false, error: 'Message must contain valid RPC structure' };
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  // 格式化Netconf消息
  formatMessage(message) {
    try {
      // 简单的XML格式化
      let formatted = message
        .replace(/></g, '>\n<')
        .replace(/<rpc/g, '\n<rpc')
        .replace(/<\/rpc>/g, '</rpc>\n');
      
      // 添加缩进
      let indentLevel = 0;
      const lines = formatted.split('\n');
      const indentedLines = [];
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;
        
        if (trimmedLine.startsWith('</')) {
          indentLevel--;
        }
        
        indentedLines.push('  '.repeat(indentLevel) + trimmedLine);
        
        if (!trimmedLine.startsWith('</') && !trimmedLine.endsWith('/>')) {
          indentLevel++;
        }
      }
      
      return indentedLines.join('\n');
    } catch (error) {
      return message; // 如果格式化失败，返回原始消息
    }
  }
}

// 导出单例
module.exports = new MessageHandler();
