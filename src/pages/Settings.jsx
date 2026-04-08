import React from 'react';
import { Settings as SettingsIcon, Wrench } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Settings() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh] px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ 
          duration: 0.4, 
          type: "spring",
          stiffness: 260,
          damping: 20
        }}
        className="glass p-10 md:p-14 rounded-[32px] border-white/5 flex flex-col items-center max-w-lg text-center shadow-2xl"
      >
        <div className="w-20 h-20 bg-primary-500/10 rounded-2xl flex items-center justify-center mb-8 rotate-12">
          <Wrench className="w-10 h-10 text-primary-400" />
        </div>
        
        <h2 className="text-3xl font-black text-white mb-4">Under Construction</h2>
        
        <p className="text-white/50 text-base leading-relaxed mb-8">
          We're designing a highly personalized settings experience tailored specifically for our users. This feature is scheduled for a future enhancement!
        </p>

        <div className="inline-flex items-center gap-2 text-primary-400 bg-primary-500/10 px-5 py-2.5 rounded-xl text-sm font-bold border border-primary-500/20">
          <SettingsIcon size={16} className="animate-spin" />
          <span>Coming Soon</span>
        </div>
      </motion.div>
    </div>
  );
}
