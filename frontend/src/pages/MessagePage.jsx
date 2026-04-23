import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

const MessagePage = ({ selectedDeviceId }) => {
  const [message, setMessage] = useState('<rpc><get-config><source><running/></source><filter type="subtree"><configuration/></filter></get-config></rpc>');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [isFormatting, setIsFormatting] = useState(false);

  // XML 格式化函数
  const formatXml = (xml) => {
    const PADDING = '  ';
    const reg = /(>)(<)(\/*)/g;
    let pad = 0;
    
    xml = xml.replace(reg, '$1\n$2$3');
    
    return xml.split('\n').map((node, index) => {
      let indent = 0;
      if (node.match(/.+<\/\w[^>]*>$/)) {
        indent = 0;
      } else if (node.match(/^<\/\w/)) {
        if (pad !== 0) {
          pad -= 1;
        }
      } else if (node.match(/^<\w([^>]*[^\/])?>.*$/)) {
        indent = 1;
      } else {
        indent = 0;
      }
      
      const padding = new Array(pad + 1).join(PADDING);
      pad += indent;
      
      return padding + node;
    }).join('\n');
  };

  const handleFormatMessage = () => {
    setIsFormatting(true);
    try {
      const formatted = formatXml(message);
      setMessage(formatted);
    } catch (error) {
      console.error('Error formatting message:', error);
    } finally {
      setIsFormatting(false);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedDeviceId) {
      alert('Please select a connected device from the sidebar');
      return;
    }

    try {
      setLoading(true);
      const result = await axios.post(`${API_URL}/api/messages/send`, {
        connectionId: selectedDeviceId,
        message
      });
      const respContent = typeof result.data.response === 'string' ? result.data.response : JSON.stringify(result.data.response, null, 2);
      setResponse(respContent);
      
      // Add to history
      setHistory(prev => [
        ...prev,
        {
          id: Date.now(),
          connectionId: selectedDeviceId,
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

  const handleSelectHistory = (item) => {
    setMessage(item.message);
  };

  if (!selectedDeviceId) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-8 bg-gray-800 rounded-2xl border border-gray-700 shadow-lg max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Select a Device</h2>
          <p className="text-gray-400 text-sm">Please connect and select a device from the sidebar to send Netconf messages</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-700">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Netconf Message Console
            </h2>
            <p className="text-gray-400 text-sm">Connected to: <span className="text-blue-400 font-medium">{selectedDeviceId}</span></p>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleFormatMessage}
              className="px-5 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center space-x-2 disabled:opacity-50"
              disabled={isFormatting}
            >
              {isFormatting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Formatting...</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                  </svg>
                  <span>Format</span>
                </>
              )}
            </button>
            <button
              onClick={handleSendMessage}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span>Send Message</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Editor Panels */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Request Panel */}
        <div className="bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-700 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              Request (RPC)
            </h3>
          </div>
          <div className="flex-1 min-h-0 rounded-xl overflow-hidden border border-gray-700">
            <Editor
              height="100%"
              defaultLanguage="xml"
              value={message}
              onChange={(value) => setMessage(value || '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                fontSize: 13,
                lineNumbers: 'on',
                renderIndentGuides: true
              }}
            />
          </div>
        </div>

        {/* Response Panel */}
        <div className="bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-700 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Response
            </h3>
          </div>
          <div className="flex-1 min-h-0 bg-gray-900 rounded-xl p-5 overflow-auto border border-gray-700 font-mono text-sm">
            {response ? (
              <pre className="text-gray-200 whitespace-pre-wrap">{response}</pre>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p>Response will appear here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* History Panel */}
      {history.length > 0 && (
        <div className="bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Recent Messages
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {history.slice(-6).reverse().map((item) => (
              <div 
                key={item.id} 
                className="p-3 bg-gray-700/50 rounded-xl border border-gray-600 hover:border-blue-500/50 transition-all cursor-pointer group"
                onClick={() => handleSelectHistory(item)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-white">{item.connectionId}</span>
                  <span className="text-xs text-gray-400">{new Date(item.timestamp).toLocaleString()}</span>
                </div>
                <div className="text-xs text-gray-400 truncate group-hover:text-gray-300 transition-colors">
                  {item.message.substring(0, 120)}...
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagePage;
