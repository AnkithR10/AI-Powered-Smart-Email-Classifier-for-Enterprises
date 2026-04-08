import React, { useState } from 'react';
import { Search, Filter, ChevronRight, Star, Clock, MoreVertical, CheckCircle2, User } from 'lucide-react';
import { clsx } from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { emails } from '../data/emails';

export default function Inbox({ folder, starredIds, toggleStar, localUnread, setLocalUnread }) {
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const filteredEmails = emails.filter(email => {
    let matchesFolder;
    if (folder === 'Starred') {
      matchesFolder = starredIds.includes(email.id);
    } else if (folder === 'Inbox') {
      matchesFolder = true;
    } else {
      matchesFolder = email.category.toLowerCase() === folder.toLowerCase();
    }
    const matchesSearch = email.sender.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         email.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const isEmailUnread = localUnread[email.id] !== undefined ? localUnread[email.id] : !email.read;
    const matchesUrgency = urgencyFilter === 'All' 
        || (urgencyFilter === 'Unread' ? isEmailUnread : email.urgency.toLowerCase() === urgencyFilter.toLowerCase());
    
    return matchesFolder && matchesSearch && matchesUrgency;
  });

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{folder}</h2>
          <p className="text-gray-500 dark:text-white/40">{filteredEmails.length} messages found in this category.</p>
        </div>
        <div className="flex gap-4">
          <div className="glass px-4 py-2 rounded-2xl flex items-center gap-3 w-72 group focus-within:border-primary-500/50 transition-all">
            <Search className="w-4 h-4 text-gray-400 dark:text-white/30 group-focus-within:text-primary-400" />
            <input 
              type="text" 
              placeholder="Search emails..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-gray-900 dark:text-white text-sm w-full placeholder:text-gray-300 dark:text-white/20"
            />
          </div>
          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={clsx(
                "glass p-3 rounded-2xl transition-all duration-300 border",
                isFilterOpen ? "text-primary-400 border-primary-500/30 bg-primary-500/5 shadow-lg shadow-primary-500/10" : "text-gray-500 dark:text-white/40 border-transparent hover:text-gray-900 dark:text-white"
              )}
            >
              <Filter className="w-5 h-5" />
            </button>
            <AnimatePresence>
              {isFilterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-4 w-48 glass rounded-2xl p-2 border-gray-200 dark:border-white/10 z-50 shadow-2xl"
                >
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-300 dark:text-white/20 px-3 py-2">Filter By</p>
                  {['All', 'High', 'Medium', 'Low', 'Unread'].map((u) => (
                    <button
                      key={u}
                      onClick={() => {
                        setUrgencyFilter(u);
                        setIsFilterOpen(false);
                      }}
                      className={clsx(
                        "w-full text-left px-3 py-2 rounded-xl text-sm font-bold transition-all",
                        urgencyFilter === u ? "bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white" : "text-gray-500 dark:text-white/40 hover:bg-gray-100 dark:bg-white/5 hover:text-gray-600 dark:text-white/60"
                      )}
                    >
                      {u}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <div className="flex-1 glass rounded-[32px] overflow-hidden flex flex-col border-gray-100 dark:border-white/5">
        {/* Table Header */}
        <div className="grid grid-cols-[48px_1.5fr_2fr_1fr_120px] px-6 py-4 border-b border-gray-100 dark:border-white/5 bg-white/[0.02] text-[10px] font-bold text-gray-400 dark:text-white/30 uppercase tracking-[0.2em]">
          <div></div>
          <div>Sender / Subject</div>
          <div>Preview Message</div>
          <div>Urgency</div>
          <div className="text-right">Time</div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredEmails.map((email) => {
            const isEmailUnread = localUnread[email.id] !== undefined ? localUnread[email.id] : !email.read;
            return (
            <motion.div
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key={email.id}
              onClick={() => {
                setSelectedEmail(email);
                setLocalUnread(prev => ({ ...prev, [email.id]: false }));
              }}
              className={clsx(
                "grid grid-cols-[48px_1.5fr_2fr_1fr_120px] px-6 py-5 items-center gap-4 cursor-pointer transition-all duration-200 border-b border-white/[0.02]",
                !isEmailUnread ? "opacity-60" : "bg-white/[0.01]",
                "hover:bg-white/[0.05]"
              )}
            >
              <div className="flex justify-center">
                {isEmailUnread && <div className="w-2 h-2 rounded-full bg-primary-500 shadow-lg shadow-primary-500/50" />}
              </div>
              <div>
                <p className="text-gray-900 dark:text-white font-semibold text-sm mb-0.5">{email.sender}</p>
                <p className="text-gray-600 dark:text-white/60 text-xs truncate">{email.subject}</p>
              </div>
              <p className="text-gray-400 dark:text-white/30 text-xs truncate pr-10">{email.message}</p>
              <div>
                <Tag urgency={email.urgency} />
              </div>
              <p className="text-gray-400 dark:text-white/30 text-xs text-right whitespace-nowrap">
                {new Date(email.date).toLocaleDateString()}
              </p>
            </motion.div>
            );
          })}
        </div>
      </div>

      {/* Detail Panel */}
      <AnimatePresence>
        {selectedEmail && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed top-8 right-8 bottom-8 w-[450px] glass rounded-[32px] p-8 z-50 flex flex-col border-gray-200 dark:border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
          >
            <div className="flex justify-between items-start mb-8">
              <button 
                onClick={() => setSelectedEmail(null)}
                className="p-2 hover:bg-gray-100 dark:bg-white/5 rounded-full transition-colors text-gray-500 dark:text-white/40 hover:text-gray-900 dark:text-white"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              <div className="flex gap-2">
                <button 
                  onClick={() => toggleStar(selectedEmail.id)}
                  className={clsx(
                    "p-3 rounded-2xl transition-all flex items-center justify-center border border-transparent",
                    starredIds.includes(selectedEmail.id) 
                      ? "glass-active text-yellow-400 bg-yellow-400/10 shadow-[0_0_15px_rgba(250,204,21,0.15)] border-yellow-400/20" 
                      : "glass text-gray-500 dark:text-white/40 hover:text-gray-900 dark:text-white"
                  )}
                >
                  <Star className="w-5 h-5" fill={starredIds.includes(selectedEmail.id) ? "currentColor" : "none"} />
                </button>
                <div className="relative">
                  <button 
                    onClick={() => setIsMoreOpen(!isMoreOpen)}
                    className="p-3 glass rounded-2xl text-gray-500 dark:text-white/40 hover:text-gray-900 dark:text-white transition-colors"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  <AnimatePresence>
                    {isMoreOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute right-0 top-full mt-2 w-48 glass rounded-2xl py-2 border border-gray-200 dark:border-white/10 z-50 shadow-2xl"
                      >
                        <button 
                          onClick={() => {
                            window.print();
                            setIsMoreOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-white/70 hover:bg-gray-100 dark:hover:bg-white/5 font-semibold transition-colors"
                        >
                          Print
                        </button>
                        <button 
                          onClick={() => {
                            setLocalUnread(prev => ({ ...prev, [selectedEmail.id]: true }));
                            setIsMoreOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-white/70 hover:bg-gray-100 dark:hover:bg-white/5 font-semibold transition-colors"
                        >
                          Mark as Unread
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center border border-gray-200 dark:border-white/10">
                  <User className="text-gray-600 dark:text-white/60 w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-gray-900 dark:text-white font-bold text-lg">{selectedEmail.sender}</h3>
                  <p className="text-gray-500 dark:text-white/40 text-sm">To: me@enterprise.com</p>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                {selectedEmail.subject}
              </h2>

              <div className="flex gap-3 mb-8">
                <Tag urgency={selectedEmail.urgency} />
                <div className="bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-white/60 text-[10px] px-3 py-1 rounded-full border border-gray-200 dark:border-white/10 uppercase tracking-widest font-bold">
                  {selectedEmail.category}
                </div>
              </div>

              <div className="prose prose-invert prose-sm max-w-none text-gray-600 dark:text-white/60 leading-relaxed space-y-4">
                <p>{selectedEmail.message}</p>
                <p>Best regards,<br/>{selectedEmail.sender}</p>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Tag({ urgency }) {
  const label = urgency.charAt(0).toUpperCase() + urgency.slice(1);
  const styles = {
    High: "bg-red-500/10 text-red-400 border-red-500/20",
    Medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    Low: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  };

  return (
    <span className={clsx(
      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
      styles[label]
    )}>
      {label}
    </span>
  );
}
