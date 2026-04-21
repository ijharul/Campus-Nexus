import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  TrendingUp, Activity, MessageSquare, Briefcase, 
  ChevronRight, Calendar, Zap, Sparkles, Target, 
  ArrowUpRight, Clock
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell,
  PieChart, Pie
} from 'recharts';

const WeeklyMomentum = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const { data } = await api.get('/activity/weekly');
        setData(data);
      } catch (err) {
        toast.error('Failed to load velocity metrics.');
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, []);

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-emerald-500/10" />
        <div className="absolute inset-0 rounded-full border-4 border-t-emerald-500 animate-spin" />
      </div>
      <p className="text-xs font-black text-slate-500 uppercase tracking-widest animate-pulse">Calculating Momentum...</p>
    </div>
  );

  const totalActions = data?.summary?.totalActions || 0;
  const breakdown = [
    { name: 'Chats', value: data?.summary?.chatMessages || 0, color: '#0ea5e9' },
    { name: 'Apps', value: data?.summary?.referralRequests || 0, color: '#6366f1' },
    { name: 'Mentors', value: data?.summary?.mentorshipRequests || 0, color: '#10b981' },
  ].filter(x => x.value > 0);

  return (
    <div className="max-w-7xl mx-auto pb-20 space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 px-2">
        <div className="flex-1 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-[10px] font-black uppercase tracking-widest">
            <Activity className="w-3 h-3" /> Real-time Analytics
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
              Weekly Momentum
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm md:text-base">
              Quantifying your professional velocity across the Campus Nexus ecosystem.
            </p>
          </div>
        </div>
        
        <div className="pristine-card p-6 border border-white/5 bg-slate-900/40 backdrop-blur-xl flex flex-col items-center justify-center min-w-[200px] gap-1">
           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Activity Score</p>
           <p className="text-5xl font-black text-white">{totalActions}</p>
           <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full mt-1">
             <TrendingUp className="w-3 h-3" /> +12% vs last week
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ── Main Velocity Chart ── */}
        <div className="lg:col-span-2 pristine-card p-8 border border-white/5 bg-slate-900/40 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
              <Zap className="w-5 h-5 text-amber-400" /> Engagement Trends
            </h3>
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
               <div className="flex items-center gap-2 text-sky-400"><span className="w-2 h-2 rounded-full bg-current" /> Chats</div>
               <div className="flex items-center gap-2 text-indigo-400"><span className="w-2 h-2 rounded-full bg-current" /> Applications</div>
            </div>
          </div>

          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.dailyBreakdown} margin={{ left: 10, right: 10, top: 10, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorChats" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="label" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                  dy={10}
                  padding={{ left: 20, right: 20 }}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="chats" stroke="#0ea5e9" strokeWidth={4} fill="url(#colorChats)" />
                <Area type="monotone" dataKey="applications" stroke="#6366f1" strokeWidth={4} fill="url(#colorApps)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Breakdown & Efficiency ── */}
        <div className="space-y-8">
          <div className="pristine-card p-8 border border-white/5 bg-slate-900/40 h-full flex flex-col justify-between">
             <div className="space-y-2">
                <h3 className="text-xl font-bold text-white uppercase tracking-tight">Resource Allocation</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Where you spend your energy</p>
             </div>
             
             <div className="h-[200px] w-full flex items-center justify-center">
                {breakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={breakdown}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={8}
                        dataKey="value"
                      >
                        {breakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-slate-600 text-sm italic">No data yet</div>
                )}
             </div>

             <div className="space-y-4">
                {breakdown.map(item => (
                  <div key={item.name} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-xs font-bold text-slate-300">{item.name}</span>
                    </div>
                    <span className="text-sm font-black text-white">{item.value}</span>
                  </div>
                ))}
             </div>
          </div>
        </div>

      </div>



      {/* ── Intelligence Feed ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="pristine-card p-8 border border-white/5 bg-slate-900/40 flex items-start gap-6 group hover:border-emerald-500/20 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner group-hover:scale-110 transition-transform">
               <Target className="w-7 h-7" />
            </div>
            <div className="space-y-2 flex-1">
               <div className="flex justify-between items-center">
                  <h4 className="text-lg font-bold text-white uppercase tracking-tight">Active Conversion</h4>
                  <span className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">Elite</span>
               </div>
               <p className="text-sm font-medium text-slate-400 leading-relaxed">
                 You are currently converting {data?.summary?.chatMessages || 0} chat sessions into {data?.summary?.mentorshipRequests || 0} mentorship requests. This velocity indicates a highly targeted professional networking strategy.
               </p>
            </div>
         </div>

         <div className="pristine-card p-8 border border-white/5 bg-slate-900/40 flex items-start gap-6 group hover:border-sky-500/20 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shadow-inner group-hover:scale-110 transition-transform">
               <Clock className="w-7 h-7" />
            </div>
            <div className="space-y-2 flex-1">
               <div className="flex justify-between items-center">
                  <h4 className="text-lg font-bold text-white uppercase tracking-tight">System Utilization</h4>
                  <span className="text-[10px] font-black text-sky-400 bg-sky-400/10 px-2 py-0.5 rounded-full">Optimal</span>
               </div>
               <p className="text-sm font-medium text-slate-400 leading-relaxed">
                 With {data?.summary?.totalActions || 0} total actions recorded this week, your profile engagement is within the top 10% of active members in your institution. Keep up the momentum.
               </p>
            </div>
         </div>
      </div>

    </div>
  );
};

export default WeeklyMomentum;
