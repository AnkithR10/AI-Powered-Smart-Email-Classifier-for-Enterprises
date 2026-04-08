import React from 'react';
import { 
  LayoutDashboard, 
  Inbox, 
  AlertCircle, 
  FileText, 
  MessageSquare, 
  ShieldAlert, 
  Search, 
  Settings,
  Mail,
  Star
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const menuItems = [
  { id: 'Overview', icon: LayoutDashboard, label: 'Overview' },
  { id: 'Inbox', icon: Inbox, label: 'Inbox' },
  { id: 'Starred', icon: Star, label: 'Starred', color: 'text-yellow-400' },
  { id: 'Complaint', icon: AlertCircle, label: 'Complaints', color: 'text-red-400' },
  { id: 'Request', icon: FileText, label: 'Requests', color: 'text-blue-400' },
  { id: 'Feedback', icon: MessageSquare, label: 'Feedback', color: 'text-green-400' },
  { id: 'Spam', icon: ShieldAlert, label: 'Spam', color: 'text-slate-400' },
  { id: 'Classify New', icon: Search, label: 'Classify New' },
];

export default function Sidebar({ activeTab, setActiveTab }) {
  return (
    <aside className="w-72 h-screen glass border-r-0 flex flex-col p-6 z-20">
      <div className="flex items-center gap-3 mb-12 px-2">
        <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
          <Mail className="text-gray-900 dark:text-white w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-white/60">
          AI Email Classifier
        </h1>
      </div>

      <div className="space-y-1 flex-1">
        <p className="text-[10px] font-bold text-gray-400 dark:text-white/30 uppercase tracking-[0.2em] mb-4 px-2">
          Workspace
        </p>
        
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
              activeTab === item.id 
                ? "bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white shadow-sm" 
                : "text-gray-500 dark:text-white/50 hover:bg-gray-100 dark:bg-white/5 hover:text-gray-700 dark:text-white/80"
            )}
          >
            {activeTab === item.id && (
              <div className="absolute left-0 w-1 h-6 bg-primary-500 rounded-r-full" />
            )}
            <item.icon className={cn("w-5 h-5 transition-colors", item.color || "text-inherit")} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="pt-6 border-t border-gray-100 dark:border-white/5 space-y-1">
        <button 
          onClick={() => setActiveTab('Settings')}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
            activeTab === 'Settings' 
              ? "bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white shadow-sm" 
              : "text-gray-500 dark:text-white/50 hover:bg-gray-100 dark:bg-white/5 hover:text-gray-700 dark:text-white/80"
          )}
        >
          {activeTab === 'Settings' && (
            <div className="absolute left-0 w-1 h-6 bg-primary-500 rounded-r-full" />
          )}
          <Settings className={cn("w-5 h-5 transition-colors", activeTab === 'Settings' ? "text-primary-400" : "text-inherit")} />
          <span className="font-medium">Settings</span>
        </button>
      </div>
    </aside>
  );
}
