import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  UserCheck, Inbox, ArrowRight, Users, TrendingUp,
  Heart, Briefcase, Award, Sparkles, Search, ChevronRight,
  MessageSquare, Star, Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StatCard = ({ icon: Icon, label, value, color = 'sky' }) => {
  const colors = {
    sky:     { bg: 'bg-sky-500/10',     text: 'text-sky-500',     border: 'border-sky-500/20' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20' },
    amber:   { bg: 'bg-amber-500/10',   text: 'text-amber-500',   border: 'border-amber-500/20' },
    indigo:  { bg: 'bg-indigo-500/10',  text: 'text-indigo-400',  border: 'border-indigo-500/20' },
  };
  const c = colors[color] || colors.sky;

  return (
    <div className={`pristine-card p-6 border border-white/5 hover:border-white/20 transition-all duration-500 hover:-translate-y-1 group`}>
      <div className="flex items-center justify-between mb-5">
        <div className={`p-3 rounded-xl border ${c.bg} ${c.border} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`w-5 h-5 ${c.text}`} />
        </div>
        <span className="px-2 py-1 bg-white/5 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-widest border border-white/5">
          Metrics
        </span>
      </div>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">{label}</p>
      <h3 className={`text-4xl font-black tracking-tight ${c.text}`}>{value}</h3>
    </div>
  );
};

const AlumniDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats]           = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [liveCampaign, setLiveCampaign] = useState(null);
  const [totalImpact, setTotalImpact] = useState(0);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [s, sug, reqs, camps, dons] = await Promise.all([
          api.get('/alumni/stats'),
          api.get('/alumni/suggested-students'),
          api.get('/mentorship/mentor-requests'),
          api.get('/college-admin/campaigns'),
          api.get('/donations/my')
        ]);
        
        setStats(s.data);
        setSuggestions(sug.data);
        // Only show pending requests on the dashboard
        setPendingRequests(reqs.data.filter(r => r.status === 'pending'));
        // Find the most recent active campaign
        const active = camps.data.find(c => c.isActive);
        setLiveCampaign(active);
        // Calculate total donated
        const total = dons.data.reduce((acc, d) => acc + d.amount, 0);
        setTotalImpact(total);
      } catch {
        toast.error('Unable to synchronize alumni hub.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-sky-500/10" />
        <div className="absolute inset-0 rounded-full border-4 border-t-sky-500 animate-spin" />
        <div className="absolute inset-2 rounded-full bg-sky-500/10 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-sky-500 animate-pulse" />
        </div>
      </div>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] animate-pulse">Syncing Alumni Hub</p>
    </div>
  );

  const firstName = user?.name?.split(' ')[0] ?? 'Alumni';

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">

      {/* ── Welcome Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase rounded-xl tracking-widest border border-emerald-500/20">
              ✓ Verified Professional
            </span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
              • {user?.company || 'Elite Network'} Alumni
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
            The Network Awaits, <span className="gradient-text-sky">{firstName}</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-base leading-relaxed italic">
            "Your guidance is the bridge between ambition and achievement for the next generation."
          </p>
        </div>

        <Link
          to="/profile"
          className="w-full lg:w-auto py-4 px-8 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold text-sm transition-all flex items-center justify-center gap-3 shadow-2xl shadow-sky-500/20 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Briefcase className="w-5 h-5" /> Professional Profile
        </Link>
      </div>

      {/* ── TIER 1: Global Stats Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard icon={Award} label="Guidance Provided" value={stats?.mentorshipsGiven || 0} color="sky" />
        <StatCard icon={TrendingUp} label="Referrals Done" value={stats?.referralsDone || 0} color="emerald" />
        <div className="glass-card p-6 border border-white/5 bg-slate-900/40">
           <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                 <Heart className="w-5 h-5 text-rose-500" />
              </div>
              <Link to="/alumni/donations" className="text-[9px] font-black text-rose-500 uppercase tracking-widest hover:underline">Donate More</Link>
           </div>
           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Legacy Giving</p>
           <h3 className="text-4xl font-black text-white tracking-tighter">₹{totalImpact.toLocaleString()}</h3>
        </div>
        <div className="glass-card p-6 border border-white/5 bg-indigo-500/5">
           <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3">Community Recognition</p>
           <div className="flex flex-wrap gap-2">
              {stats?.badges?.length > 0 ? stats.badges.map(b => (
                <span key={b} className="px-2 py-1 bg-indigo-500/10 border border-indigo-500/20 text-[8px] font-black text-indigo-400 uppercase tracking-widest rounded-lg">
                  {b}
                </span>
              )) : <span className="text-[10px] font-bold text-slate-600 italic">No badges earned yet</span>}
           </div>
        </div>
      </div>

      {/* ── NEW: IMPACT METRICS ROW ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-[2rem] bg-slate-900/40 border border-white/5 flex items-center gap-5">
           <div className="w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-400 border border-sky-500/20">
              <Users className="w-6 h-6" />
           </div>
           <div>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Students Helped</p>
              <p className="text-2xl font-black text-white">{stats?.impactStats?.studentsHelped || 0}</p>
           </div>
        </div>
        <div className="p-6 rounded-[2rem] bg-slate-900/40 border border-white/5 flex items-center gap-5">
           <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
              <Briefcase className="w-6 h-6" />
           </div>
           <div>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Referrals Provided</p>
              <p className="text-2xl font-black text-white">{stats?.impactStats?.referralsGiven || 0}</p>
           </div>
        </div>
        <div className="p-6 rounded-[2rem] bg-slate-900/40 border border-white/5 flex items-center gap-5">
           <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
              <Award className="w-6 h-6" />
           </div>
           <div>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Placements Secured</p>
              <p className="text-2xl font-black text-white">{stats?.impactStats?.successfulPlacements || 0}</p>
           </div>
        </div>
      </div>

      {/* ── TIER 2: Influence & Gateways Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Influence Chart */}
        <div className="lg:col-span-8 glass-card rounded-[2.5rem] p-10 bg-slate-900/50 border-white/5 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-sky-400 animate-pulse" /> Professional Influence
              </h3>
              <p className="text-xs text-slate-500 mt-1">Simulated impact trend based on network activity</p>
            </div>
            <div className="px-4 py-1.5 bg-sky-500/10 rounded-xl text-[10px] font-bold text-sky-400 uppercase tracking-widest border border-sky-500/20">
              Active Scaling
            </div>
          </div>

          <div className="h-[220px] w-full mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { name: 'Phase 1', val: 20 },
                { name: 'Phase 2', val: (stats?.mentorshipsGiven || 0) * 10 + 10 },
                { name: 'Phase 3', val: (stats?.referralsDone || 0) * 15 + 25 },
                { name: 'Current', val: ((stats?.mentorshipsGiven || 0) + (stats?.referralsDone || 0)) * 12 + 40 },
              ]}>
                <defs>
                  <linearGradient id="colorInfluence" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff0a" />
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{backgroundColor: '#0f172a', border: '1px solid #ffffff14', borderRadius: '12px'}}
                  itemStyle={{color: '#38bdf8', fontWeight: 'bold'}}
                  cursor={{stroke: '#0ea5e955', strokeWidth: 2}}
                />
                <Area 
                  type="monotone" 
                  dataKey="val" 
                  stroke="#0ea5e9" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorInfluence)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Elite Gateways */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.3em] pl-2">Elite Gateways</h3>
          <div className="grid grid-cols-1 gap-3">
            {[
              { to: '/mentorship', icon: UserCheck,    l: 'Mentorship Panel',   d: 'Approve guidance requests' },
              { to: '/referrals',  icon: Inbox,        l: 'Referral Engine',    d: 'Support talent opportunities' },
              { to: '/directory',  icon: Search,       l: 'Professional Mesh',  d: 'Discover the campus network' },
              { to: '/chat',       icon: MessageSquare, l: 'Network Chat',       d: 'Connect directly with members' },
            ].map(i => (
              <Link
                key={i.l} to={i.to}
                className="glass-card flex items-center gap-4 p-5 border border-white/5 hover:border-sky-500/20 transition-all duration-300 hover:translate-x-1.5 group"
              >
                <div className="w-11 h-11 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500 shrink-0 group-hover:scale-110 transition-transform">
                  <i.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white mb-0.5 leading-none tracking-tight">{i.l}</p>
                  <p className="text-[10px] text-slate-500 font-medium leading-none">{i.d}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-sky-500 group-hover:translate-x-1 transition-all shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── TIER 3: Engagement & Campaign Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Mentorship Action Center */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500">
                <MessageSquare className="w-5 h-5" />
              </div>
              Action Center
            </h3>
            {pendingRequests.length > 0 && (
              <span className="px-3 py-1 bg-rose-500 text-white text-[10px] font-black uppercase rounded-full animate-pulse">
                {pendingRequests.length} New
              </span>
            )}
          </div>

          {pendingRequests.length === 0 ? (
            <div className="py-16 text-center glass-card rounded-[2.5rem] border-white/5 bg-slate-900/30">
               <UserCheck className="w-10 h-10 text-slate-600 mx-auto mb-4 opacity-40" />
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">No pending requests.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.slice(0, 2).map(req => (
                <div key={req._id} className="glass-card p-6 flex items-center justify-between gap-6 hover:border-sky-500/30 transition-all group">
                   <div className="flex items-center gap-5 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-sky-500 font-bold border border-white/10 shrink-0">
                        {req.student?.profilePicture ? <img src={req.student.profilePicture} className="w-full h-full object-cover rounded-2xl" /> : req.student?.name[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-900 dark:text-white text-base truncate">{req.student?.name}</p>
                        <p className="text-[10px] text-slate-500 font-medium truncate italic">"{req.message || 'Seeking mentorship...'}"</p>
                      </div>
                   </div>
                   <Link to="/mentorship" className="px-5 py-2.5 bg-sky-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl">
                      Respond
                   </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Fundraising Spotlight */}
        <div className="space-y-6">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
              <Heart className="w-5 h-5" />
            </div>
            Campus Spotlight
          </h3>
          <div className="glass-card bg-gradient-to-br from-rose-500 to-rose-700 p-8 rounded-[2.5rem] text-white relative overflow-hidden group shadow-2xl shadow-rose-500/20 h-[220px] flex flex-col justify-center">
             {liveCampaign ? (
               <div className="relative z-10 space-y-6">
                  <h3 className="text-xl font-black tracking-tight leading-tight uppercase line-clamp-1">{liveCampaign.title}</h3>
                  <div className="space-y-4">
                     <div className="flex justify-between text-[10px] font-black uppercase">
                        <span>Progress</span>
                        <span>{Math.round((liveCampaign.raisedAmount / liveCampaign.goalAmount) * 100)}%</span>
                     </div>
                     <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                        <div className="bg-white h-full" style={{width: `${(liveCampaign.raisedAmount / liveCampaign.goalAmount) * 100}%`}} />
                     </div>
                  </div>
                  <Link to={`/alumni/donations?campaignId=${liveCampaign._id}`} className="block w-full py-3 bg-white text-rose-500 text-[10px] font-black uppercase tracking-widest text-center rounded-xl shadow-xl">
                     Support Project
                  </Link>
               </div>
             ) : (
               <div className="relative z-10 text-center">
                  <p className="text-sm font-bold mb-4">Empower future talent with a donation.</p>
                  <Link to="/alumni/donations" className="block w-full py-3 bg-white/20 hover:bg-white text-white hover:text-rose-500 text-[10px] font-black uppercase tracking-widest text-center rounded-xl transition-all border border-white/20">
                     Legacy Giving
                  </Link>
               </div>
             )}
          </div>
        </div>
      </div>

      {/* ── TIER 4: Talent Feed ── */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            Suggested Talent
          </h3>
          <Link to="/directory" className="text-[10px] font-black text-sky-500 hover:text-sky-400 uppercase tracking-widest">
            Full Directory
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {suggestions.slice(0, 3).map(s => (
            <div key={s._id} className="glass-card group relative overflow-hidden flex flex-col border border-white/5 hover:border-sky-500/20 transition-all duration-500">
              <div className="p-7 flex-1">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 border border-white/10 bg-white/5">
                    {s.profilePicture
                      ? <img src={s.profilePicture} className="w-full h-full object-cover" alt="" />
                      : <div className="w-full h-full flex items-center justify-center text-sky-500 font-black text-xl bg-sky-500/10">{s.name[0]}</div>
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-slate-900 dark:text-white text-lg truncate">{s.name}</p>
                    <p className="text-[10px] font-bold text-sky-500 uppercase tracking-widest">{s.branch} • {s.year}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {s.skills?.slice(0, 3).map(sk => (
                    <span key={sk} className="px-2.5 py-1 bg-white/5 text-slate-400 text-[9px] font-bold rounded-lg border border-white/5 uppercase">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
              <div className="px-6 pb-6">
                <Link to={`/profile/${s._id}`} className="w-full py-3 bg-white/5 hover:bg-white text-slate-400 hover:text-slate-900 font-black text-[9px] uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 border border-white/10">
                  View Profile <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AlumniDashboard;
