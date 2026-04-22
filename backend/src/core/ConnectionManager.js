const { Netconf } = require('netconf-client');
const { firstValueFrom } = require('rxjs');

class ConnectionManager {
  constructor() {
    this.connections = new Map();
  }

  // 创建新连接
  async createConnection(id, config) {
    try {
      const { host, port, username, password } = config;
      
      const netconf = new Netconf({
        host,
        port: parseInt(port) || 830,
        user: username,
        pass: password
      });

      // 测试连接
      await firstValueFrom(netconf.getData('/'));

      // 存储连接
      this.connections.set(id, {
        id,
        config,
        netconf,
        status: 'connected',
        lastActivity: new Date()
      });

      return {
        id,
        status: 'connected',
        message: 'Connection created successfully'
      };
    } catch (error) {
      throw new Error(`Failed to create connection: ${error.message}`);
    }
  }

  // 获取连接
  getConnection(id) {
    return this.connections.get(id);
  }

  // 获取所有连接
  getAllConnections() {
    return Array.from(this.connections.values());
  }

  // 关闭连接
  async closeConnection(id) {
    const connection = this.connections.get(id);
    if (!connection) {
      throw new Error('Connection not found');
    }

    try {
      await firstValueFrom(connection.netconf.close());
      this.connections.delete(id);
      return {
        id,
        status: 'disconnected',
        message: 'Connection closed successfully'
      };
    } catch (error) {
      throw new Error(`Failed to close connection: ${error.message}`);
    }
  }

  // 执行RPC命令
  async executeRPC(id, rpc) {
    const connection = this.connections.get(id);
    if (!connection) {
      throw new Error('Connection not found');
    }

    try {
      connection.lastActivity = new Date();
      const result = await firstValueFrom(connection.netconf.rpc(rpc));
      return result;
    } catch (error) {
      throw new Error(`Failed to execute RPC: ${error.message}`);
    }
  }

  // 订阅通知
  async subscribeNotification(id, subscription) {
    const connection = this.connections.get(id);
    if (!connection) {
      throw new Error('Connection not found');
    }

    try {
      const subscriptionStream = connection.netconf.subscribe(subscription);
      
      // 存储订阅
      if (!connection.subscriptions) {
        connection.subscriptions = new Map();
      }
      
      const subId = `sub_${Date.now()}`;
      connection.subscriptions.set(subId, {
        id: subId,
        subscription,
        stream: subscriptionStream
      });

      return {
        subscriptionId: subId,
        message: 'Subscription created successfully'
      };
    } catch (error) {
      throw new Error(`Failed to create subscription: ${error.message}`);
    }
  }

  // 取消订阅
  async unsubscribeNotification(id, subscriptionId) {
    const connection = this.connections.get(id);
    if (!connection || !connection.subscriptions) {
      throw new Error('Connection or subscription not found');
    }

    const subscription = connection.subscriptions.get(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    try {
      // 取消订阅
      subscription.stream.unsubscribe();
      connection.subscriptions.delete(subscriptionId);

      return {
        subscriptionId,
        message: 'Subscription cancelled successfully'
      };
    } catch (error) {
      throw new Error(`Failed to cancel subscription: ${error.message}`);
    }
  }

  // 检查连接状态
  checkConnectionStatus(id) {
    const connection = this.connections.get(id);
    if (!connection) {
      return { status: 'not_found' };
    }

    return {
      status: connection.status,
      lastActivity: connection.lastActivity
    };
  }

  // 清理闲置连接
  cleanupIdleConnections(timeout = 3600000) { // 默认1小时
    const now = new Date();
    const toDelete = [];

    for (const [id, connection] of this.connections.entries()) {
      if (now - connection.lastActivity > timeout) {
        toDelete.push(id);
      }
    }

    toDelete.forEach(id => {
      const connection = this.connections.get(id);
      if (connection) {
        try {
          firstValueFrom(connection.netconf.close());
        } catch (error) {
          console.error(`Error closing idle connection ${id}:`, error);
        }
        this.connections.delete(id);
      }
    });

    return toDelete.length;
  }
}

// 导出单例
module.exports = new ConnectionManager();
