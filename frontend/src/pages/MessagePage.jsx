import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';

const MessagePage = () => {
  const [connections, setConnections] = useState([]);
  const [selectedConnection, setSelectedConnection] = useState('');
  const [message, setMessage] = useState('<rpc><get-config><source><running/></source><filter type="subtree"><configuration/></filter></get-config></rpc>');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/connections');
      setConnections(response.data);
      if (response.data.length > 0) {
        setSelectedConnection(response.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedConnection) {
      alert('Please select a connection');
      return;
    }

    try {
      setLoading(true);
      const result = await axios.post('http://localhost:3001/api/messages/send', {
        connectionId: selectedConnection,
        message
      });
      setResponse(JSON.stringify(result.data.response, null, 2));
      
      // Add to history
      setHistory(prev => [
        ...prev,
        {
          id: Date.now(),
          connectionId: selectedConnection,
          message,
          response: result.data.response,
          timestamp: new Date()
        }
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
      setResponse('Error: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleFormatMessage = async () => {
    try {
      const result = await axios.post('http://localhost:3001/api/messages/format', {
        message
      });
      setMessage(result.data.formatted);
    } catch (error) {
      console.error('Error formatting message:', error);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">Send Netconf Message</h2>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Connection</label>
            <select
              value={selectedConnection}
              onChange={(e) => setSelectedConnection(e.target.value)}
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
          <div className="flex space-x-2">
            <button
              onClick={handleFormatMessage}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md"
            >
              Format
            </button>
            <button
              onClick={handleSendMessage}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 h-full flex flex-col">
          <h3 className="text-lg font-semibold mb-2">Request</h3>
          <div className="flex-1">
            <Editor
              height="100%"
              defaultLanguage="xml"
              value={message}
              onChange={(value) => setMessage(value || '')}
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on'
              }}
            />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 h-full flex flex-col">
          <h3 className="text-lg font-semibold mb-2">Response</h3>
          <div className="flex-1 bg-gray-900 rounded-md p-4 overflow-auto font-mono text-sm">
            {response || 'Response will appear here'}
          </div>
        </div>
      </div>

      {history.length > 0 && (
        <div className="mt-4 bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">History</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {history.slice(-5).map((item) => (
              <div key={item.id} className="p-2 bg-gray-700 rounded-md">
                <div className="text-sm font-medium">{item.connectionId} - {new Date(item.timestamp).toLocaleString()}</div>
                <div className="text-xs text-gray-400 truncate">{item.message.substring(0, 100)}...</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagePage;
