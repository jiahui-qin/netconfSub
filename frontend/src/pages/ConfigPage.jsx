import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';

const ConfigPage = () => {
  const [connections, setConnections] = useState([]);
  const [selectedConnection, setSelectedConnection] = useState('');
  const [config, setConfig] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/connections');
      setConnections(response.data);
      if (response.data.length > 0) {
        setSelectedConnection(response.data[0].id);
        fetchConfig(response.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };

  const fetchConfig = async (connectionId) => {
    try {
      setLoading(true);
      // 使用get-config RPC获取配置
      const getConfigMessage = '<rpc><get-config><source><running/></source><filter type="subtree"><configuration/></filter></get-config></rpc>';
      const result = await axios.post('http://localhost:3001/api/messages/send', {
        connectionId,
        message: getConfigMessage
      });
      
      // 提取配置部分
      if (result.data.response && result.data.response.result) {
        const configXml = result.data.response.result.configuration;
        setConfig(configXml ? JSON.stringify(configXml, null, 2) : 'No configuration found');
      } else {
        setConfig('Failed to parse configuration');
      }
    } catch (error) {
      console.error('Error fetching config:', error);
      setConfig('Error fetching configuration: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectionChange = (connectionId) => {
    setSelectedConnection(connectionId);
    if (connectionId) {
      fetchConfig(connectionId);
    } else {
      setConfig('');
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">Device Configuration</h2>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Connection</label>
            <select
              value={selectedConnection}
              onChange={(e) => handleConnectionChange(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a connection</option>
              {connections.map((conn) => (
                <option key={conn.id} value={conn.id}>
                  {conn.id} ({conn.config.host}:{conn.config.port})
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => fetchConfig(selectedConnection)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md"
            disabled={!selectedConnection || loading}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="flex-1 bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">Running Configuration</h3>
        <div className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center h-full text-gray-400">Loading...</div>
          ) : (
            <Editor
              height="100%"
              defaultLanguage="json"
              value={config}
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                readOnly: true
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfigPage;
