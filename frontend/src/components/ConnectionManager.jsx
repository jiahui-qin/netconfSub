import React, { useState, useEffect } from 'react';
import axios from 'axios';

// 根据环境确定API地址
const API_URL = import.meta.env.VITE_API_URL || '';

const ConnectionManager = ({ onClose }) => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDevice, setNewDevice] = useState({
    id: '',
    host: '',
    port: '830',
    username: '',
    password: ''
  });
  const [adding, setAdding] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/connections`);
      if (Array.isArray(response.data)) {
        setDevices(response.data);
      } else {
        console.error('Invalid devices format:', response.data);
        setDevices([]);
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
      // 即使出错也保持设备列表为空数组，避免页面异常
      setDevices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    if (!newDevice.host || !newDevice.port || !newDevice.username || !newDevice.password) {
      alert('Please fill in all connection details');
      return;
    }
    
    try {
      setTesting(true);
      setTestResult(null);
      const response = await axios.post(`${API_URL}/api/connections/test`, {
        config: {
          host: newDevice.host,
          port: newDevice.port,
          username: newDevice.username,
          password: newDevice.password
        }
      });
      setTestResult({ success: true, message: response.data.message });
    } catch (error) {
      console.error('Test connection failed:', error);
      setTestResult({ 
        success: false, 
        message: error.response?.data?.message || error.message 
      });
    } finally {
      setTesting(false);
    }
  };

  const handleAddDevice = async (e) => {
    e.preventDefault();
    try {
      setAdding(true);
      console.log('Adding device:', newDevice);
      const response = await axios.post(`${API_URL}/api/connections/add`, {
        id: newDevice.id,
        config: {
          host: newDevice.host,
          port: newDevice.port,
          username: newDevice.username,
          password: newDevice.password
        }
      });
      console.log('Add device response:', response.data);
      setShowAddForm(false);
      setNewDevice({
        id: '',
        host: '',
        port: '830',
        username: '',
        password: ''
      });
      setTestResult(null);
      // 直接刷新设备列表，不需要延迟
      console.log('Refreshing devices...');
      await fetchDevices();
    } catch (error) {
      console.error('Error adding device:', error);
      alert('Failed to add device: ' + (error.response?.data?.error || error.message));
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteDevice = async (id) => {
    if (window.confirm('Are you sure you want to delete this device?')) {
      try {
        await axios.delete(`${API_URL}/api/connections/${id}`);
        fetchDevices();
      } catch (error) {
        console.error('Error deleting device:', error);
        alert('Failed to delete device: ' + (error.response?.data?.error || error.message));
      }
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

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden border border-gray-700">
        {/* 头部 */}
        <div className="bg-gray-800 px-6 py-4 border-b border-gray-700 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Manage Devices</h2>
              <p className="text-sm text-gray-400">Add and manage your netconf devices</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          {/* 添加设备按钮 */}
          <div className="mb-6">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className={`w-full sm:w-auto px-5 py-3 rounded-xl font-medium flex items-center justify-center space-x-2 transition-all ${
                showAddForm 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>{showAddForm ? 'Cancel Adding' : 'Add New Device'}</span>
            </button>
          </div>

          {/* 添加设备表单 */}
          {showAddForm && (
            <div className="mb-8 bg-gray-700/50 rounded-2xl p-6 border border-gray-600">
              <h3 className="text-lg font-semibold text-white mb-4">Add Device Configuration</h3>
              <form onSubmit={handleAddDevice} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Device Name (ID)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1 1 0 013 10V4a1 1 0 011-1z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        value={newDevice.id}
                        onChange={(e) => setNewDevice({ ...newDevice, id: e.target.value })}
                        placeholder="e.g., router-main"
                        required
                        className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Host Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9 3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        value={newDevice.host}
                        onChange={(e) => setNewDevice({ ...newDevice, host: e.target.value })}
                        placeholder="192.168.1.1"
                        required
                        className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Port</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <input
                        type="number"
                        value={newDevice.port}
                        onChange={(e) => setNewDevice({ ...newDevice, port: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0a4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        value={newDevice.username}
                        onChange={(e) => setNewDevice({ ...newDevice, username: e.target.value })}
                        placeholder="admin"
                        required
                        className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <input
                        type="password"
                        value={newDevice.password}
                        onChange={(e) => setNewDevice({ ...newDevice, password: e.target.value })}
                        placeholder="••••••••"
                        required
                        className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>
                <div className="pt-4 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={testing}
                    className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {testing && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                    <span>{testing ? 'Testing...' : 'Test Connection'}</span>
                  </button>
                  <button
                    type="submit"
                    disabled={adding}
                    className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {adding && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                    <span>{adding ? 'Adding...' : 'Add Device'}</span>
                  </button>
                </div>
                {testResult && (
                  <div className={`mt-4 p-4 rounded-xl ${
                    testResult.success 
                      ? 'bg-green-500/20 border border-green-500/50 text-green-300' 
                      : 'bg-red-500/20 border border-red-500/50 text-red-300'
                  }`}>
                    <div className="flex items-center space-x-2">
                      {testResult.success ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                          <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 00-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                          <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
                        </svg>
                      )}
                      <span className="font-medium">{testResult.message}</span>
                    </div>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* 现有设备列表 */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Devices
            </h3>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-3 border-blue-500"></div>
                <span className="ml-3 text-gray-400">Loading devices...</span>
              </div>
            ) : devices.length === 0 ? (
              <div className="text-center py-12 bg-gray-700/30 rounded-xl border border-gray-600">
                <div className="w-16 h-16 mx-auto mb-4 text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <p className="text-gray-400 text-lg mb-1">No devices yet</p>
                <p className="text-gray-500 text-sm">Click "Add New Device" to add your first device</p>
              </div>
            ) : (
              <div className="space-y-3">
                {devices.map((device) => (
                  <div 
                    key={device.id} 
                    className="bg-gray-700/50 rounded-xl p-5 border border-gray-600 hover:border-blue-500/30 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold text-white text-lg">{device.id}</h4>
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(device.status)}`}></div>
                        </div>
                        <div className="text-gray-300 flex items-center text-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9 3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                          </svg>
                          {device.config.host}:{device.config.port}
                        </div>
                        <div className="text-gray-400 text-sm mt-1 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0a4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {device.config.username}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteDevice(device.id)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete device"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionManager;
