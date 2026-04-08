import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Mail, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Clock, 
  Zap,
  ShieldX,
  History,
  Activity,
  BarChart2,
  Inbox,
  Shield,
  ShieldAlert
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { emails } from '../data/emails';

export default function Dashboard({ localUnread = {} }) {
  const stats = useMemo(() => {
    const total = emails.length;
    const unreadCount = emails.filter(e => {
      const isUnread = localUnread[e.id] !== undefined ? localUnread[e.id] : !e.read;
      return isUnread;
    }).length;
    const highUrgency = emails.filter(e => e.urgency === 'high').length;
    const spamDetected = emails.filter(e => e.category === 'spam').length;
    const readCount = emails.filter(e => {
      const isUnread = localUnread[e.id] !== undefined ? localUnread[e.id] : !e.read;
      return !isUnread;
    }).length;
    const readRate = total ? Math.round((readCount / total) * 100) : 0;

    // Traffic Trend (Last 7 days)
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const performanceData = days.map(day => {
      const dayEmails = emails.filter(e => {
        const d = new Date(e.date);
        return d.toLocaleDateString('en-US', { weekday: 'short' }) === day;
      });
      return {
        name: day,
        total: dayEmails.length,
        high: dayEmails.filter(e => e.urgency === 'high').length
      };
    });

    // Intent Mix
    const categories = ['Complaint', 'Request', 'Feedback', 'Spam'];
    const categoryColors = {
      Complaint: '#ef4444',
      Request: '#3b82f6',
      Feedback: '#10b981',
      Spam: '#94a3b8'
    };
    const categoryData = categories.map(cat => ({
      name: cat,
      value: emails.filter(e => e.category === cat.toLowerCase()).length,
      color: categoryColors[cat]
    }));

    // Priority Mix
    const priorityMix = categories.map(cat => ({
      category: cat,
      high: emails.filter(e => e.category === cat.toLowerCase() && e.urgency === 'high').length,
      medium: emails.filter(e => e.category === cat.toLowerCase() && e.urgency === 'medium').length,
      low: emails.filter(e => e.category === cat.toLowerCase() && e.urgency === 'low').length
    }));

    // Efficiency
    const efficiency = categories.map(cat => {
      const subset = emails.filter(e => e.category === cat.toLowerCase());
      const rate = subset.length ? Math.round((subset.filter(e => {
        const isUnread = localUnread[e.id] !== undefined ? localUnread[e.id] : !e.read;
        return !isUnread;
      }).length / subset.length) * 100) : 0;
      return { category: cat, rate };
    });

    // Urgency Pie
    const urgencyData = [
      { name: 'High', value: highUrgency, color: '#ef4444' },
      { name: 'Medium', value: emails.filter(e => e.urgency === 'medium').length, color: '#f59e0b' },
      { name: 'Low', value: emails.filter(e => e.urgency === 'low').length, color: '#10b981' }
    ];

    return {
      kpis: {
        totalVolume: total,
        unread: unreadCount,
        highPriority: highUrgency,
        spam: spamDetected,
        resolution: `${readRate}%`,
        avgDelay: '14m' 
      },
      performanceData,
      categoryData,
      priorityMix,
      efficiency,
      urgencyData
    };
  }, [localUnread]);

  return (
    <div className="space-y-10 max-w-[1600px] mx-auto">
      {/* Header */}
      <header className="flex justify-between items-end">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary-400 font-bold text-xs uppercase tracking-[0.2em]">
            <Activity size={14} /> Intelligence Dashboard
          </div>
          <h2 className="text-4xl font-black text-gray-900 dark:text-white">System Analytics</h2>
          <p className="text-gray-500 dark:text-white/40 text-sm">Comprehensive multi-dimensional analysis of email flow and model accuracy.</p>
        </div>
      </header>

      {/* KPI Stats - Premium Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard title="Total Volume" value={stats.kpis.totalVolume} icon={Mail} color="blue" />
        <StatCard title="Unread" value={stats.kpis.unread} icon={Inbox} color="orange" />
        <StatCard title="High Priority" value={stats.kpis.highPriority} icon={Zap} color="red" />
        <StatCard title="Resolution" value={stats.kpis.resolution} icon={Shield} color="green" />
        <StatCard title="Avg. Delay" value={stats.kpis.avgDelay} icon={Clock} color="purple" />
        <StatCard title="Spam Detected" value={stats.kpis.spam} icon={ShieldAlert} color="slate" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Operational Chart */}
        <div className="lg:col-span-8 glass rounded-[32px] p-8 min-h-[450px] border-gray-100 dark:border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/5 blur-[100px] -z-10 group-hover:bg-primary-600/10 transition-all duration-500" />
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white transition-colors group-hover:text-primary-400">Incoming Traffic Trend</h3>
              <p className="text-gray-400 dark:text-white/30 text-xs mt-1 font-medium italic">Volumetric analysis over the trailing 7-day window.</p>
            </div>
            <div className="flex gap-2">
              <div className="glass px-3 py-1 rounded-full text-[10px] font-black text-gray-400 dark:text-white/30 tracking-tighter uppercase border-gray-100 dark:border-white/5">Auto-update: On</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={stats.performanceData}>
              <defs>
                <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.2)', fontSize: 11, fontWeight: 'bold'}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.2)', fontSize: 11}} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(8, 12, 18, 0.95)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', backdropFilter: 'blur(10px)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
                itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorTraffic)" animationBegin={0} animationDuration={1500} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Share - Strategic */}
        <div className="lg:col-span-4 glass rounded-[32px] p-8 border-gray-100 dark:border-white/5 flex flex-col items-center justify-center text-center group">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Intent Mix</h3>
          <p className="text-gray-400 dark:text-white/30 text-xs mb-8 uppercase tracking-widest font-black">Classification Distribution</p>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={stats.categoryData}
                innerRadius={70}
                outerRadius={95}
                paddingAngle={8}
                dataKey="value"
                animationDuration={1500}
                animationEasing="ease-out"
              >
                {stats.categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" className="hover:opacity-80 transition-opacity" />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(8, 12, 18, 0.95)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 mt-4 w-full px-4">
            {stats.categoryData.map((item) => (
              <div key={item.name} className="flex items-center gap-2 group/item">
                <div className="w-2 h-2 rounded-full transition-transform group-hover/item:scale-150" style={{ backgroundColor: item.color }} />
                <span className="text-[10px] text-white/50 font-bold uppercase tracking-wider">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Mix Stacked Chart */}
        <div className="lg:col-span-6 glass rounded-[32px] p-8 border-gray-100 dark:border-white/5 group relative overflow-hidden">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
             Priority Distribution <span className="px-2 py-0.5 rounded text-[10px] bg-primary-500/10 text-primary-400">Strategic</span>
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.priorityMix} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.02)" />
              <XAxis type="number" hide />
              <YAxis dataKey="category" type="category" axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 'bold'}} />
              <Tooltip 
                 cursor={{fill: 'rgba(255,255,255,0.02)'}}
                 contentStyle={{ backgroundColor: 'rgba(8, 12, 18, 0.95)', border: 'none', borderRadius: '12px' }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{paddingBottom: '20px', fontSize: '10px', textTransform: 'uppercase', fontBold: true, opacity: 0.5}} />
              <Bar dataKey="high" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} />
              <Bar dataKey="medium" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
              <Bar dataKey="low" stackId="a" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Heatmap Simulation (Peak Times) */}
        <div className="lg:col-span-6 glass rounded-[32px] p-8 border-gray-100 dark:border-white/5">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Volume Heatmap</h3>
          <p className="text-gray-400 dark:text-white/30 text-xs mb-8 uppercase tracking-widest font-black">24-hour temporal density</p>
          <div className="grid grid-cols-7 gap-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className="space-y-2">
                <div className="text-[10px] text-gray-300 dark:text-white/20 font-black uppercase text-center">{day}</div>
                <div className="grid grid-cols-1 gap-1">
                  {Array.from({ length: 24 }).map((_, hour) => {
                    const count = emails.filter(e => {
                      const d = new Date(e.date);
                      return d.toLocaleDateString('en-US', { weekday: 'short' }) === day && d.getHours() === hour;
                    }).length;
                    
                    const opacity = Math.min(count * 0.4, 0.9);
                    return (
                      <div 
                        key={hour}
                        className="h-2 rounded-sm"
                        style={{ 
                          backgroundColor: `rgba(59, 130, 246, ${opacity + 0.05})`,
                          border: opacity > 0 ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid rgba(255,255,255,0.02)'
                        }}
                        title={`${day} ${hour}:00 - ${count} emails`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Efficiency Analysis */}
        <div className="lg:col-span-7 glass rounded-[32px] p-8 border-gray-100 dark:border-white/5">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Efficiency Analysis</h3>
            <div className="text-[10px] font-black text-gray-400 dark:text-white/30 uppercase tracking-[0.2em]">Resolution by category</div>
          </div>
          <div className="space-y-6">
            {stats.efficiency.map((item) => (
              <div key={item.category} className="space-y-4">
                <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest">
                  <span className="text-gray-500 dark:text-white/40">{item.category} Response Rate</span>
                  <span className="text-primary-400">{item.rate}%</span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${item.rate}%` }}
                    className="h-full bg-primary-500 shadow-[0_0_12px_rgba(59,130,246,0.5)]"
                  ></motion.div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Urgency Distribution (Pie Specialty) */}
        <div className="lg:col-span-5 glass rounded-[32px] p-8 border-gray-100 dark:border-white/5 flex flex-col group">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Priority Breakdown</h3>
          <p className="text-gray-400 dark:text-white/30 text-xs mb-6 uppercase tracking-widest font-black">System-wide urgency ratio</p>
          <div className="flex-1 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={stats.urgencyData}
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.urgencyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black text-gray-900 dark:text-white leading-none">{stats.kpis.totalVolume}</span>
              <span className="text-[9px] font-bold text-gray-300 dark:text-white/20 uppercase tracking-widest">Records</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
             {stats.urgencyData.map(u => {
               const total = stats.kpis.totalVolume || 1;
               const percent = Math.round((u.value / total) * 100);
               return (
                 <div key={u.name} className="glass p-3 rounded-2xl text-center border-gray-100 dark:border-white/5">
                   <div className="text-[9px] font-bold text-gray-400 dark:text-white/30 uppercase mb-1">{u.name}</div>
                   <div className="text-lg font-black text-gray-900 dark:text-white leading-none" style={{color: u.color}}>{percent}%</div>
                 </div>
               );
             })}
          </div>
        </div>

      </div>
    </div>
  );
}

function StatCard({ icon: Icon, title, value, change, trend, color }) {
  const colorMap = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/10',
    red: 'bg-red-500/10 text-red-400 border-red-500/10',
    green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10',
    slate: 'bg-slate-500/10 text-slate-400 border-slate-500/10',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/10',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/10',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/10',
  };

  return (
    <div className="glass rounded-[32px] p-6 glass-hover group relative overflow-hidden border-gray-100 dark:border-white/5">
      <div className={`absolute -bottom-6 -right-6 p-1 opacity-[0.03] rotate-12 transition-all duration-500 group-hover:scale-150 group-hover:opacity-[0.08]`}>
        <Icon size={120} />
      </div>
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className={`p-3 rounded-2xl ${colorMap[color] || colorMap.blue} border`}>
          <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
        </div>
        {change && (
          <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
            {trend === 'up' ? '▲' : '▼'} {change}
          </div>
        )}
      </div>
      <p className="text-gray-300 dark:text-white/20 text-[10px] font-black uppercase tracking-widest mb-1 relative z-10">{title}</p>
      <h4 className="text-3xl font-black text-gray-900 dark:text-white group-hover:text-primary-400 transition-colors relative z-10">{value}</h4>
    </div>
  );
}
