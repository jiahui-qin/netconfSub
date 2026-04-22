const connectionManager = require('./ConnectionManager');
const io = require('../../index').io;

class NotificationManager {
  constructor() {
    this.notifications = [];
  }

  // 开始监听通知
  startListening() {
    // 定期检查所有连接的订阅
    setInterval(() => {
      this.checkSubscriptions();
    }, 5000); // 每5秒检查一次
  }

  // 检查所有订阅
  checkSubscriptions() {
    const connections = connectionManager.getAllConnections();
    
    connections.forEach(connection => {
      if (connection.subscriptions) {
        connection.subscriptions.forEach((subscription, subId) => {
          this.setupNotificationListener(connection.id, subId, subscription);
        });
      }
    });
  }

  // 设置通知监听器
  setupNotificationListener(connectionId, subscriptionId, subscription) {
    // 确保只设置一次监听器
    if (!subscription.listening) {
      subscription.listening = true;
      
      subscription.stream.subscribe(
        (notification) => {
          this.handleNotification(connectionId, subscriptionId, notification);
        },
        (error) => {
          console.error(`Error in subscription ${subscriptionId}:`, error);
          subscription.listening = false;
        },
        () => {
          console.log(`Subscription ${subscriptionId} completed`);
          subscription.listening = false;
        }
      );
    }
  }

  // 处理接收到的通知
  handleNotification(connectionId, subscriptionId, notification) {
    const notificationData = {
      connectionId,
      subscriptionId,
      timestamp: new Date(),
      content: notification
    };

    // 存储通知
    this.notifications.push(notificationData);
    
    // 限制通知存储数量
    if (this.notifications.length > 1000) {
      this.notifications = this.notifications.slice(-1000);
    }

    // 通过WebSocket推送通知
    io.emit('notification', notificationData);
  }

  // 获取通知历史
  getNotifications(connectionId, limit = 50) {
    let notifications = this.notifications;
    
    if (connectionId) {
      notifications = notifications.filter(n => n.connectionId === connectionId);
    }
    
    return notifications.slice(-limit);
  }

  // 清除通知历史
  clearNotifications(connectionId) {
    if (connectionId) {
      this.notifications = this.notifications.filter(n => n.connectionId !== connectionId);
    } else {
      this.notifications = [];
    }
    
    return { message: 'Notifications cleared successfully' };
  }
}

// 导出单例
const notificationManager = new NotificationManager();
notificationManager.startListening();

module.exports = notificationManager;
