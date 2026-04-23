import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

const ConfigPage = ({ selectedDeviceId }) => {
  const [config, setConfig] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchConfig = async () => {
    if (!selectedDeviceId) {
      return;
    }

    try {
      setLoading(true);
      // 使用get-config RPC获取配置
      const getConfigMessage = '<rpc><get-config><source><running/></source><filter type="subtree"><configuration/></filter></get-config></rpc>';
      const result = await axios.post(`${API_URL}/api/messages/send`, {
        connectionId: selectedDeviceId,
        message: getConfigMessage
      });
      
      // 提取配置部分
      if (result.data.response) {
        setConfig(JSON.stringify(result.data.response, null, 2));
      } else {
        setConfig('No configuration found');
      }
    } catch (error) {
      console.error('Error fetching config:', error);
      setConfig('Error fetching configuration: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDeviceId) {
      fetchConfig();
    }
  }, [selectedDeviceId]);

  if (!selectedDeviceId) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-8 bg-gray-800 rounded-2xl border border-gray-700 shadow-lg max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Select a Device</h2>
          <p className="text-gray-400 text-sm">Please connect and select a device from the sidebar to view configuration</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
            Device Configuration
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
          <div className="flex-1 min-w-[250px]">
            <div className="text-sm font-medium text-gray-300 mb-1">Selected Device</div>
            <div className="px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-gray-200">
              {selectedDeviceId}
            </div>
          </div>
          <div className="pt-6">
            <button
              onClick={fetchConfig}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2 shadow-lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Refresh</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl p-6 border border-gray-700/50 shadow-xl">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-2 h-6 rounded bg-gradient-to-b from-purple-500 to-indigo-500"></div>
          <h3 className="text-lg font-semibold text-gray-200">Running Configuration</h3>
        </div>
        <div className="flex-1 h-[calc(100%-4rem)] rounded-xl overflow-hidden border border-gray-700/50">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-3">
              <svg className="animate-spin h-10 w-10 text-purple-500" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-lg">Loading configuration...</span>
            </div>
          ) : (
            <Editor
              height="100%"
              defaultLanguage="json"
              value={config}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                readOnly: true,
                fontSize: 14,
                lineNumbers: 'on',
                automaticLayout: true,
                padding: { top: 16, bottom: 16 }
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfigPage;
