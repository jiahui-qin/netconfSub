import { useState } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import MessagePage from './pages/MessagePage';
import NotificationPage from './pages/NotificationPage';
import ConfigPage from './pages/ConfigPage';
import ConnectionManager from './components/ConnectionManager';

function App() {
  const [activeTab, setActiveTab] = useState('messages');
  const [showConnectionManager, setShowConnectionManager] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);

  const renderActivePage = () => {
    switch (activeTab) {
      case 'messages':
        return <MessagePage selectedDeviceId={selectedDeviceId} />;
      case 'notifications':
        return <NotificationPage selectedDeviceId={selectedDeviceId} />;
      case 'config':
        return <ConfigPage selectedDeviceId={selectedDeviceId} />;
      default:
        return <MessagePage selectedDeviceId={selectedDeviceId} />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        setShowConnectionManager={setShowConnectionManager}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          selectedDeviceId={selectedDeviceId}
          onSelectDevice={setSelectedDeviceId}
        />
        <div className="flex-1 p-4 overflow-auto main-content">
          <div className="fade-in">
            {renderActivePage()}
          </div>
        </div>
      </div>
      {showConnectionManager && (
        <ConnectionManager onClose={() => setShowConnectionManager(false)} />
      )}
    </div>
  );
}

export default App;
