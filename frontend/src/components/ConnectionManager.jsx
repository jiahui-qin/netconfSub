import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ConnectionManager = ({ onClose }) => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newConnection, setNewConnection] = useState({
    id: '',
    host: '',
    port: '830',
    username: '',
    password: ''
  });

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

  const handleAddConnection = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3001/api/connections/create', {
        id: newConnection.id,
        config: {
          host: newConnection.host,
          port: newConnection.port,
          username: newConnection.username,
          password: newConnection.password
        }
      });
      setShowAddForm(false);
      setNewConnection({
        id: '',
        host: '',
        port: '830',
        username: '',
        password: ''
      });
      fetchConnections();
    } catch (error) {
      console.error('Error adding connection:', error);
      alert('Failed to add connection: ' + error.response.data.error);
    }
  };

  const handleDeleteConnection = async (id) => {
    if (window.confirm('Are you sure you want to delete this connection?')) {
      try {
        await axios.delete(`http://localhost:3001/api/connections/${id}`);
        fetchConnections();
      } catch (error) {
        console.error('Error deleting connection:', error);
        alert('Failed to delete connection: ' + error.response.data.error);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Manage Connections</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {showAddForm ? 'Cancel' : 'Add Connection'}
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddConnection} className="mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Connection ID</label>
                <input
                  type="text"
                  value={newConnection.id}
                  onChange={(e) => setNewConnection({ ...newConnection, id: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Host</label>
                <input
                  type="text"
                  value={newConnection.host}
                  onChange={(e) => setNewConnection({ ...newConnection, host: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Port</label>
                <input
                  type="number"
                  value={newConnection.port}
                  onChange={(e) => setNewConnection({ ...newConnection, port: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Username</label>
                <input
                  type="text"
                  value={newConnection.username}
                  onChange={(e) => setNewConnection({ ...newConnection, username: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  value={newConnection.password}
                  onChange={(e) => setNewConnection({ ...newConnection, password: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="mt-4">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md"
              >
                Save Connection
              </button>
            </div>
          </form>
        )}

        <h3 className="text-lg font-semibold mb-2">Existing Connections</h3>
        {loading ? (
          <div className="text-gray-400">Loading...</div>
        ) : connections.length === 0 ? (
          <div className="text-gray-400">No connections</div>
        ) : (
          <div className="space-y-3">
            {connections.map((connection) => (
              <div key={connection.id} className="p-3 bg-gray-700 rounded-md">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{connection.id}</div>
                    <div className="text-sm text-gray-400">
                      {connection.config.host}:{connection.config.port}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDeleteConnection(connection.id)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-md text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionManager;
