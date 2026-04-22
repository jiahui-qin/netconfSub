import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

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
    socketRef.current = io('http://localhost:3001');
    
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
      const response = await axios.get('http://localhost:3001/api/connections');
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
      const response = await axios.get('http://localhost:3001/api/notifications/history', {
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

      const result = await axios.post('http://localhost:3001/api/notifications/subscribe', {
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
      await axios.post('http://localhost:3001/api/notifications/unsubscribe', {
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
      await axios.delete('http://localhost:3001/api/notifications/history', {
        params: { connectionId: selectedConnection }
      });
      setNotifications([]);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">Notifications</h2>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Connection</label>
            <select
              value={selectedConnection}
              onChange={(e) => setSelectedConnection(e.target.value)}
              onSelect={fetchNotifications}
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
            onClick={handleSubscribe}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md"
          >
            Subscribe
          </button>
          <button
            onClick={handleClearNotifications}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Subscriptions</h3>
          {subscriptions.length === 0 ? (
            <div className="text-gray-400">No subscriptions</div>
          ) : (
            <div className="space-y-2">
              {subscriptions.map((sub) => (
                <div key={sub.id} className="p-2 bg-gray-700 rounded-md">
                  <div className="text-sm font-medium">{sub.id}</div>
                  <div className="text-xs text-gray-400 truncate">
                    {JSON.stringify(sub.subscription).substring(0, 100)}...
                  </div>
                  <button
                    onClick={() => handleUnsubscribe(sub.id)}
                    className="mt-2 px-2 py-1 bg-red-600 hover:bg-red-700 rounded-md text-xs"
                  >
                    Unsubscribe
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gray-800 rounded-lg p-4 md:col-span-2">
          <h3 className="text-lg font-semibold mb-2">Notification History</h3>
          {loading ? (
            <div className="text-gray-400">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="text-gray-400">No notifications</div>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {notifications.map((notification) => (
                <div key={Date.now() + Math.random()} className="p-3 bg-gray-700 rounded-md">
                  <div className="flex justify-between items-start">
                    <div className="text-sm font-medium">
                      {notification.connectionId} - {new Date(notification.timestamp).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-400">{notification.subscriptionId}</div>
                  </div>
                  <div className="mt-2 text-xs font-mono bg-gray-900 p-2 rounded-md overflow-auto max-h-32">
                    {JSON.stringify(notification.content, null, 2)}
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
