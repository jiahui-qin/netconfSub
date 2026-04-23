const { Netconf } = require('netconf-client');
const { firstValueFrom } = require('rxjs');

class ConnectionManager {
  constructor() {
    this.connections = new Map();
    this.heartbeatIntervals = new Map();
    this.heartbeatIntervalMs = 30000; // 默认30秒心跳
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

      // 测试连接并获取设备能力
      const result = await firstValueFrom(netconf.getData('/'));
      
      // 解析设备能力
      let deviceCapabilities = [];
      try {
        // 尝试从响应中提取设备能力
        // 注意：这里需要根据实际的netconf-client库返回格式进行调整
        if (result && typeof result === 'object') {
          // 检查是否有能力信息
          if (result.capabilities) {
            deviceCapabilities = result.capabilities;
          } else if (result.data && result.data.capabilities) {
            deviceCapabilities = result.data.capabilities;
          } else if (result.rpc && result.rpc.capabilities) {
            deviceCapabilities = result.rpc.capabilities;
          }
        }
      } catch (capError) {
        console.error('Error parsing device capabilities:', capError);
      }

      // 存储连接
      const connection = {
        id,
        config,
        netconf,
        status: 'connected',
        lastActivity: new Date(),
        lastHeartbeat: null,
        heartbeatStatus: 'ok',
        deviceCapabilities: deviceCapabilities,
        connectionError: null
      };
      
      this.connections.set(id, connection);

      // 启动心跳
      this.startHeartbeat(id);

      return {
        id,
        status: 'connected',
        message: 'Connection created successfully',
        deviceCapabilities: deviceCapabilities
      };
    } catch (error) {
      console.error(`Connection failed for ${id}:`, error);
      
      // 构建详细的错误信息
      let errorMessage = error.message;
      let errorCode = 'CONNECTION_ERROR';
      
      if (error.message.includes('timeout')) {
        errorCode = 'CONNECTION_TIMEOUT';
        errorMessage = `Connection timeout: Unable to reach device at ${config.host}:${config.port}`;
      } else if (error.message.includes('authentication')) {
        errorCode = 'AUTHENTICATION_FAILED';
        errorMessage = 'Authentication failed: Invalid username or password';
      } else if (error.message.includes('connection refused')) {
        errorCode = 'CONNECTION_REFUSED';
        errorMessage = `Connection refused: No Netconf service running at ${config.host}:${config.port}`;
      } else if (error.message.includes('no route to host')) {
        errorCode = 'NO_ROUTE_TO_HOST';
        errorMessage = `No route to host: Unable to reach ${config.host}`;
      }
      
      throw new Error(JSON.stringify({
        code: errorCode,
        message: errorMessage,
        originalError: error.message
      }));
    }
  }

  // 启动心跳
  startHeartbeat(id) {
    if (this.heartbeatIntervals.has(id)) {
      this.stopHeartbeat(id);
    }

    const interval = setInterval(async () => {
      await this.checkHeartbeat(id);
    }, this.heartbeatIntervalMs);

    this.heartbeatIntervals.set(id, interval);
  }

  // 停止心跳
  stopHeartbeat(id) {
    if (this.heartbeatIntervals.has(id)) {
      clearInterval(this.heartbeatIntervals.get(id));
      this.heartbeatIntervals.delete(id);
    }
  }

  // 检查心跳
  async checkHeartbeat(id) {
    const connection = this.connections.get(id);
    if (!connection) {
      this.stopHeartbeat(id);
      return;
    }

    try {
      // 发送一个简单的请求来检查连接状态
      await firstValueFrom(connection.netconf.getData('/'));
      connection.lastHeartbeat = new Date();
      connection.heartbeatStatus = 'ok';
      connection.status = 'connected';
    } catch (error) {
      console.error(`Heartbeat failed for ${id}:`, error.message);
      connection.heartbeatStatus = 'error';
      connection.status = 'disconnected';
    }
  }

  // 获取连接状态详情
  getConnectionStatus(id) {
    const connection = this.connections.get(id);
    if (!connection) {
      return { status: 'not_found' };
    }

    return {
      id,
      status: connection.status,
      heartbeatStatus: connection.heartbeatStatus,
      lastActivity: connection.lastActivity,
      lastHeartbeat: connection.lastHeartbeat,
      deviceCapabilities: connection.deviceCapabilities || [],
      connectionError: connection.connectionError,
      config: {
        host: connection.config.host,
        port: connection.config.port,
        username: connection.config.username
      }
    };
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
      // 停止心跳
      this.stopHeartbeat(id);
      await firstValueFrom(connection.netconf.close());
      this.connections.delete(id);
      return {
        id,
        status: 'disconnected',
        message: 'Connection closed successfully'
      };
    } catch (error) {
      // 即使关闭失败也停止心跳和清理连接
      this.stopHeartbeat(id);
      this.connections.delete(id);
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
