import React from 'react';

const Navbar = ({ activeTab, setActiveTab, setShowConnectionManager }) => {
  return (
    <nav className="bg-gray-800 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-bold text-blue-400">Netconf Tool</h1>
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('messages')}
            className={`px-4 py-2 rounded-md ${activeTab === 'messages' ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'}`}
          >
            Messages
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-2 rounded-md ${activeTab === 'notifications' ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'}`}
          >
            Notifications
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`px-4 py-2 rounded-md ${activeTab === 'config' ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'}`}
          >
            Config
          </button>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setShowConnectionManager(true)}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Manage Connections
        </button>
        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
          <span className="text-sm">U</span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
