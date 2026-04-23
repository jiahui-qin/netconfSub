import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

// 根据环境确定API地址
const API_URL = import.meta.env.VITE_API_URL || '';

const Sidebar = ({ selectedDeviceId, onSelectDevice }) => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [connectingId, setConnectingId] = useState(null);

  useEffect(() => {
    // 初始化Socket.IO连接
    const newSocket = io(window.location.origin);
    setSocket(newSocket);

    // 监听连接状态更新
    newSocket.on('connectionStatusUpdate', (statuses) => {
      setDevices(statuses);
    });

    // 初始获取连接列表
    fetchDevices();

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/connections`);
      setDevices(response.data);
    } catch (error) {
      console.error('Error fetching devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (deviceId) => {
    try {
      setConnectingId(deviceId);
      await axios.post(`${API_URL}/api/connections/${deviceId}/connect`);
      // 刷新设备列表
      fetchDevices();
    } catch (error) {
      console.error('Error connecting to device:', error);
      alert('Failed to connect: ' + (error.response?.data?.error || error.message));
    } finally {
      setConnectingId(null);
    }
  };

  const handleDisconnect = async (deviceId) => {
    try {
      await axios.post(`${API_URL}/api/connections/${deviceId}/disconnect`);
      // 如果当前选择的设备被断开，取消选择
      if (selectedDeviceId === deviceId) {
        onSelectDevice(null);
      }
      // 刷新设备列表
      fetchDevices();
    } catch (error) {
      console.error('Error disconnecting from device:', error);
      alert('Failed to disconnect: ' + (error.response?.data?.error || error.message));
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
          <h2 className="text-xl font-bold text-white">Devices</h2>
        </div>
        <p className="text-xs text-gray-400">Click to select for operations</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-400">Loading...</span>
        </div>
      ) : devices.length === 0 ? (
        <div className="bg-gray-700/50 rounded-xl p-6 text-center border border-gray-600">
          <div className="w-12 h-12 mx-auto mb-3 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <p className="text-gray-400 text-sm">No devices yet</p>
          <p className="text-gray-500 text-xs mt-1">Add a device to get started</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {devices.map((device) => (
            <li 
              key={device.id} 
              className={`bg-gray-700/50 rounded-xl p-4 border transition-all duration-200 hover:shadow-lg cursor-pointer ${
                selectedDeviceId === device.id 
                  ? 'border-blue-500 bg-gray-700/80' 
                  : 'border-gray-600 hover:border-blue-500/50'
              }`}
              onClick={() => {
                if (device.status === 'connected') {
                  onSelectDevice(selectedDeviceId === device.id ? null : device.id);
                }
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-white text-base">{device.id}</h3>
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(device.status)} shadow-sm`}></div>
                  </div>
                  <div className="text-sm text-gray-300 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    {device.config.host}:{device.config.port}
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-2">
                  {/* 连接/断开按钮 */}
                  {device.status === 'disconnected' ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConnect(device.id);
                      }}
                      disabled={connectingId === device.id}
                      className="px-3 py-1.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-xs font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                    >
                      {connectingId === device.id ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                          <span>Connecting...</span>
                        </>
                      ) : (
                        <span>Connect</span>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDisconnect(device.id);
                      }}
                      className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-xs font-medium rounded-lg transition-all flex items-center space-x-1"
                    >
                      <span>Disconnect</span>
                    </button>
                  )}
                  
                  {/* 心跳状态指示器 */}
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-gray-400">Heartbeat</span>
                    <div className={`w-3.5 h-3.5 rounded-full ${getHeartbeatColor(device.heartbeatStatus)} shadow-sm`}></div>
                  </div>
                </div>
              </div>
              
              {/* 时间信息 */}
              <div className="mt-3 pt-3 border-t border-gray-600 flex justify-between text-xs text-gray-400">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 a9 9 0 0118 0z" />
                  </svg>
                  Last HB: {formatDateTime(device.lastHeartbeat)}
                </div>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 a3 3 0 016 0zm6 3a2 2 0 11-4 0 a2 2 0 014 0zM7 10a2 2 0 11-4 0 a2 2 0 014 0z" />
                  </svg>
                  {device.config.username}
                </div>
              </div>
              
              {/* 选中状态提示 */}
              {selectedDeviceId === device.id && (
                <div className="mt-2 pt-2 border-t border-blue-500/30 text-blue-400 text-xs flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 00-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                  </svg>
                  Selected for operations
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Sidebar;
