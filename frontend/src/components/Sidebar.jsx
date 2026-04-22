import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

// 根据环境确定API地址
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const Sidebar = () => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // 初始化Socket.IO连接
    const newSocket = io(API_URL);
    setSocket(newSocket);

    // 监听连接状态更新
    newSocket.on('connectionStatusUpdate', (statuses) => {
      setConnections(statuses);
    });

    // 初始获取连接列表
    fetchConnections();

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/connections`);
      setConnections(response.data);
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
        return 'bg-green-500';
      case 'disconnected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getHeartbeatColor = (heartbeatStatus) => {
    switch (heartbeatStatus) {
      case 'ok':
        return 'bg-blue-400';
      case 'error':
        return 'bg-orange-500';
      default:
        return 'bg-gray-400';
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleTimeString();
  };

  return (
    <div className="w-72 bg-gradient-to-b from-gray-800 to-gray-900 p-5 overflow-y-auto border-r border-gray-700">
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-1">
          <div className="w-5 h-5 text-blue-400">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
              <path d="M8 14c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2v-3H8v3zm-3-2h2v-4H5v4zm10-4v4h2v-4h-2z"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white">Device Connections</h2>
        </div>
        <p className="text-xs text-gray-400">Real-time status monitoring</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-400">Loading...</span>
        </div>
      ) : connections.length === 0 ? (
        <div className="bg-gray-700/50 rounded-xl p-6 text-center border border-gray-600">
          <div className="w-12 h-12 mx-auto mb-3 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <p className="text-gray-400 text-sm">No devices connected</p>
          <p className="text-gray-500 text-xs mt-1">Add a connection to get started</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {connections.map((connection) => (
            <li 
              key={connection.id} 
              className="bg-gray-700/70 rounded-xl p-4 border border-gray-600 hover:border-blue-500/50 transition-all duration-200 hover:shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-white text-base mb-1">{connection.id}</div>
                  <div className="text-sm text-gray-300 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    {connection.config.host}:{connection.config.port}
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-2">
                  {/* 主状态指示器 */}
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs text-gray-400">Status</span>
                    <div className={`w-3.5 h-3.5 rounded-full ${getStatusColor(connection.status)} shadow-sm`} />
                  </div>
                  
                  {/* 心跳状态指示器 */}
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs text-gray-400">Heartbeat</span>
                    <div className={`w-3.5 h-3.5 rounded-full ${getHeartbeatColor(connection.heartbeatStatus)} shadow-sm`} />
                  </div>
                </div>
              </div>
              
              {/* 时间信息 */}
              <div className="mt-3 pt-3 border-t border-gray-600 flex justify-between text-xs text-gray-400">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Last HB: {formatDateTime(connection.lastHeartbeat)}
                </div>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {connection.config.username}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Sidebar;
