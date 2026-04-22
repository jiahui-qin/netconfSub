import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Sidebar = () => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3001/api/connections');
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

  return (
    <div className="w-64 bg-gray-800 p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">Connections</h2>
      {loading ? (
        <div className="text-gray-400">Loading...</div>
      ) : connections.length === 0 ? (
        <div className="text-gray-400">No connections</div>
      ) : (
        <ul className="space-y-2">
          {connections.map((connection) => (
            <li key={connection.id} className="p-2 rounded-md hover:bg-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{connection.id}</div>
                  <div className="text-sm text-gray-400">
                    {connection.config.host}:{connection.config.port}
                  </div>
                </div>
                <div className={`w-3 h-3 rounded-full ${getStatusColor(connection.status)}`} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Sidebar;
