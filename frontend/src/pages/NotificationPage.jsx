import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const NotificationPage = () => {
  const [connections, setConnections] = useState([]);
  const [selectedConnection, setSelectedConnection] = useState('');
  const [subscriptions, setSubscriptions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    fetchConnections();
    
    // Initialize WebSocket connection
    socketRef.current = io(API_URL);
    
    socketRef.current.on('notification', (data) => {
      setNotifications(prev => [data, ...prev]);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const fetchConnections = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/connections`);
      setConnections(response.data);
      if (response.data.length > 0) {
        setSelectedConnection(response.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/notifications/history`, {
        params: { connectionId: selectedConnection }
      });
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!selectedConnection) {
      alert('Please select a connection');
      return;
    }

    try {
      const subscription = {
        filter: '<filter type="subtree"><configuration/></filter>',
        stream: 'NETCONF',
        startTime: new Date().toISOString()
      };

      const result = await axios.post(`${API_URL}/api/notifications/subscribe`, {
        connectionId: selectedConnection,
        subscription
      });

      setSubscriptions(prev => [...prev, {
        id: result.data.subscriptionId,
        connectionId: selectedConnection,
        subscription
      }]);

      alert('Subscription created successfully');
    } catch (error) {
      console.error('Error creating subscription:', error);
      alert('Failed to create subscription: ' + error.response.data.error);
    }
  };

  const handleUnsubscribe = async (subscriptionId) => {
    try {
      await axios.post(`${API_URL}/api/notifications/unsubscribe`, {
        connectionId: selectedConnection,
        subscriptionId
      });

      setSubscriptions(prev => prev.filter(sub => sub.id !== subscriptionId));
      alert('Subscription cancelled successfully');
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert('Failed to cancel subscription: ' + error.response.data.error);
    }
  };

  const handleClearNotifications = async () => {
    try {
      await axios.delete(`${API_URL}/api/notifications/history`, {
        params: { connectionId: selectedConnection }
      });
      setNotifications([]);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            Notifications
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
          <div className="flex-1 min-w-[250px]">
            <label className="block text-sm font-medium mb-2 text-gray-300">Connection</label>
            <select
              value={selectedConnection}
              onChange={(e) => {
                setSelectedConnection(e.target.value);
                fetchNotifications();
              }}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-200"
            >
              <option value="">Select a connection</option>
              {connections.map((conn) => (
                <option key={conn.id} value={conn.id}>
                  {conn.id} ({conn.config.host}:{conn.config.port})
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-6">
            <button
              onClick={handleSubscribe}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center space-x-2 shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Subscribe</span>
            </button>
            <button
              onClick={handleClearNotifications}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center space-x-2 shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Clear</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl p-6 border border-gray-700/50 shadow-xl">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-2 h-6 rounded bg-gradient-to-b from-green-500 to-emerald-500"></div>
            <h3 className="text-lg font-semibold text-gray-200">Subscriptions</h3>
          </div>
          {subscriptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-400 space-y-2">
              <svg className="w-12 h-12 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>No subscriptions yet</span>
            </div>
          ) : (
            <div className="space-y-3 max-h-[calc(100%-4rem)] overflow-y-auto">
              {subscriptions.map((sub) => (
                <div key={sub.id} className="p-4 bg-gray-900/50 rounded-xl border border-gray-700/50 hover:border-green-500/50 transition-all duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-green-400">ID: {sub.id}</div>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  </div>
                  <div className="text-xs text-gray-400 mb-3 truncate">
                    {JSON.stringify(sub.subscription).substring(0, 80)}...
                  </div>
                  <button
                    onClick={() => handleUnsubscribe(sub.id)}
                    className="w-full px-3 py-2 bg-gradient-to-r from-red-600/80 to-rose-600/80 hover:from-red-600 hover:to-rose-600 rounded-lg text-xs font-medium transition-all duration-200 flex items-center justify-center space-x-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Unsubscribe</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl p-6 lg:col-span-2 border border-gray-700/50 shadow-xl">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-2 h-6 rounded bg-gradient-to-b from-green-500 to-emerald-500"></div>
            <h3 className="text-lg font-semibold text-gray-200">Notification History</h3>
            {notifications.length > 0 && (
              <span className="ml-auto px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                {notifications.length} notifications
              </span>
            )}
          </div>
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400 space-y-3">
              <svg className="animate-spin h-10 w-10 text-green-500" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-lg">Loading notifications...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400 space-y-2">
              <svg className="w-16 h-16 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="text-lg">No notifications yet</span>
              <span className="text-sm opacity-75">Subscriptions will appear here</span>
            </div>
          ) : (
            <div className="space-y-3 max-h-[calc(100%-4rem)] overflow-y-auto pr-2">
              {notifications.map((notification, index) => (
                <div 
                  key={index} 
                  className="p-4 bg-gray-900/50 rounded-xl border border-gray-700/50 hover:border-green-500/30 transition-all duration-200 slide-in"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-200">{notification.connectionId}</div>
                        <div className="text-xs text-gray-400">{new Date(notification.timestamp).toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded-lg">
                      {notification.subscriptionId}
                    </div>
                  </div>
                  <div className="text-xs font-mono bg-gray-900 p-3 rounded-lg overflow-auto max-h-40 text-gray-300 border border-gray-700/50">
                    <pre>{JSON.stringify(notification.content, null, 2)}</pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;
