import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Inbox from './pages/Inbox';
import Classify from './pages/Classify';
import Settings from './pages/Settings';
import { AnimatePresence, motion } from 'framer-motion';

function App() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [starredIds, setStarredIds] = useState([]);
  const [localUnread, setLocalUnread] = useState({});

  const toggleStar = (id) => {
    setStarredIds(prev => 
      prev.includes(id) ? prev.filter(starId => starId !== id) : [...prev, id]
    );
  };
  
  const renderContent = () => {
    switch (activeTab) {
      case 'Overview':
        return <Dashboard key="dashboard" localUnread={localUnread} />;
      case 'Inbox':
      case 'Complaint':
      case 'Request':
      case 'Feedback':
      case 'Spam':
      case 'Starred':
        return <Inbox key="inbox" folder={activeTab} starredIds={starredIds} toggleStar={toggleStar} localUnread={localUnread} setLocalUnread={setLocalUnread} />;
      case 'Classify New':
        return <Classify key="classify" />;
      case 'Settings':
        return <Settings key="settings" />;
      default:
        return <Dashboard key="dashboard" />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-gray-50 dark:bg-background overflow-hidden premium-gradient">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 h-screen overflow-y-auto custom-scrollbar relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="p-8 pb-16"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
