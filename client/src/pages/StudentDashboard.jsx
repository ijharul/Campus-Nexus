import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  Users, UserCheck, Inbox, Brain, Zap,
  ArrowRight, FileText, CheckCircle2, ChevronRight,
  GraduationCap, Briefcase, Map, Sparkles, MessageSquare,
  TrendingUp, Star
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

const StatCard = ({ label, value, icon: Icon, color = 'sky', description }) => {
  const colors = {
    sky:     { bg: 'bg-sky-500/10',     text: 'text-sky-500',     border: 'border-sky-500/20',     glow: 'shadow-sky-500/10' },
    indigo:  { bg: 'bg-indigo-500/10',  text: 'text-indigo-400',  border: 'border-indigo-500/20',  glow: 'shadow-indigo-500/10' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20', glow: 'shadow-emerald-500/10' },
    amber:   { bg: 'bg-amber-500/10',   text: 'text-amber-500',   border: 'border-amber-500/20',   glow: 'shadow-amber-500/10' },
  };
  const c = colors[color] || colors.sky;

  return (
    <div className={`pristine-card p-6 border border-white/5 hover:border-white/20 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl group ${c.glow}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl border ${c.bg} ${c.border} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`w-5 h-5 ${c.text}`} />
        </div>
        {description && (
          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${c.bg} ${c.text} border ${c.border}`}>
            Active
          </span>
        )}
      </div>
      <p className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-3xl font-black tracking-tight ${c.text}`}>{value}</p>
      {description && (
        <p className="text-[10px] text-slate-500 font-medium mt-2 leading-relaxed">{description}</p>
      )}
    </div>
  );
};

const ToolCard = ({ to, icon: Icon, title, description, color = 'sky' }) => (
  <Link
    to={to}
    className="pristine-card group relative overflow-hidden flex flex-col p-8 border border-white/5 hover:border-sky-500/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-sky-500/10"
  >
    {/* Background glow */}
    <div className="absolute inset-0 bg-gradient-to-br from-sky-500/0 to-indigo-500/0 group-hover:from-sky-500/5 group-hover:to-indigo-500/5 transition-all duration-700" />

    {/* Bottom accent */}
    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-sky-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

    <div className="relative z-10">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500/10 to-indigo-500/10 border border-sky-500/20 flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-7 h-7 text-sky-500" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">{title}</h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed mb-8 opacity-80">{description}</p>
      <div className="flex items-center gap-2 text-[10px] font-bold text-sky-500 uppercase tracking-[0.2em] group-hover:gap-4 transition-all duration-300">
        Enter <ChevronRight className="w-3 h-3" />
      </div>
    </div>
  </Link>
);

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [activityData, setActivityData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, activityRes] = await Promise.all([
          api.get('/student/stats'),
          api.get('/activity/weekly')
        ]);
        setStats(statsRes.data);
        setActivityData(activityRes.data.dailyBreakdown || []);
      } catch {
        toast.error('Unable to synchronize hub data.');
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
          <Zap className="w-4 h-4 text-sky-500 animate-pulse" />
        </div>
      </div>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] animate-pulse">Syncing Hub Data</p>
    </div>
  );

  const firstName      = user?.name?.split(' ')[0] ?? 'Student';
  const profilePercent = stats?.profileCompletion || 0;

  return (
    <div className="space-y-10 md:space-y-14 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-10">

      {/* ── Welcome Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1.5 bg-sky-500/10 text-sky-500 text-[10px] font-black uppercase rounded-xl tracking-widest border border-sky-500/20">
              Student Portal
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-[0.2em]">
              {user?.branch || 'General'} • Batch {user?.year || '2024'}
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tighter leading-none">
            Welcome, <span className="gradient-text-sky">{firstName}</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-base leading-relaxed">
            Profile Strength: <span className="text-sky-500 font-bold">{profilePercent}%</span>. Connect with elite alumni and unlock your career roadmap.
          </p>
        </div>

        {/* Token Widget */}
        <div className="w-full lg:w-auto">
          <div className="p-5 rounded-2xl bg-white/5 dark:bg-slate-900/50 border border-white/10 dark:border-white/5 flex items-center justify-between lg:justify-start gap-8 backdrop-blur-xl">
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Career Tokens</p>
              <div className="flex items-center gap-2 text-sky-500 font-black text-2xl tracking-tighter">
                <Zap className="w-5 h-5 fill-sky-500" /> {user?.tokens || 0}
              </div>
            </div>
            <Link
              to="/pricing"
              className="py-3 px-6 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-sky-500/20 hover:shadow-xl hover:scale-[1.03] active:scale-[0.98]"
            >
              Get More
            </Link>
          </div>
        </div>
      </div>

      {/* ── Profile Strength Banner ── */}
      <div className="pristine-card p-8 md:p-12 border border-white/5 relative overflow-hidden group">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-sky-500/5 to-transparent pointer-events-none transition-opacity group-hover:opacity-150" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl" />

        <div className="relative flex flex-col md:flex-row items-center gap-10">
          {/* Circular Progress */}
          <div className="relative w-40 h-40 shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r="68" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
              <circle
                cx="80" cy="80" r="68" stroke="url(#progressGrad)" strokeWidth="8" fill="transparent"
                strokeDasharray={427}
                strokeDashoffset={427 - (427 * profilePercent) / 100}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
              />
              <defs>
                <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{profilePercent}%</span>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-0.5">Strength</span>
            </div>
          </div>

          {/* Text */}
          <div className="flex-1 space-y-6 text-center md:text-left">
            <div className="space-y-3">
              <h3 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                Architect Your Future
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed max-w-xl">
                Elite profiles attract <span className="text-sky-500 font-bold">3x more</span> mentorship requests. Complete your experience and skill portfolio to unlock the global professional gateway.
              </p>
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <Link
                to="/profile"
                className="py-3.5 px-8 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 shadow-xl shadow-sky-500/20"
              >
                Complete Profile <ArrowRight className="w-4 h-4" />
              </Link>
              <div className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest">
                <CheckCircle2 className="w-4 h-4" /> Hub Member
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard label="Mentors"       value={stats?.mentors   || 0} icon={UserCheck}    color="sky"     description="Active connections" />
        <StatCard label="Referrals"     value={stats?.referrals || 0} icon={Inbox}        color="indigo"  description="Job pathways" />
        <StatCard label="Chats"         value={stats?.chats     || 0} icon={MessageSquare} color="emerald" description="Direct conversations" />
        <Link to="/pricing" className="pristine-card p-6 border border-white/5 flex flex-col justify-between group relative overflow-hidden bg-gradient-to-br from-slate-950/80 to-sky-950/60 hover:border-sky-500/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
          <div className="absolute -top-6 -right-6 opacity-5 group-hover:opacity-15 transition-opacity duration-700">
            <Star className="w-28 h-28 text-sky-400" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black text-sky-400 uppercase tracking-widest mb-1">Current Plan</p>
            <h4 className="text-2xl font-black text-white tracking-tight">{(user?.planName === 'none' || !user?.planName) ? 'Free' : user.planName}</h4>
            <p className="text-[10px] font-bold text-sky-500/70 uppercase tracking-widest mt-1">Institutional Access</p>
          </div>
          <div className="mt-4 relative z-10 text-[10px] font-black text-sky-400 uppercase tracking-widest flex items-center gap-1 group-hover:gap-3 transition-all">
            Upgrade <ChevronRight className="w-3 h-3" />
          </div>
        </Link>
      </div>


      {/* ── Elite Toolkit ── */}
      <div className="space-y-8">
        <div className="flex items-center gap-4 px-1">
          <div className="w-1.5 h-10 bg-gradient-to-b from-sky-400 to-indigo-500 rounded-full shadow-[0_0_15px_rgba(14,165,233,0.5)]" />
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-white tracking-widest uppercase leading-none">Elite Toolkit</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.25em]">Powered by Nexus AI</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ToolCard to="/ai"        icon={Brain}  title="Nexus IQ Hub"        description="AI-driven roadmap strategies and elite resume analysis powered by Gemini." />
          <ToolCard to="/directory" icon={Users}  title="Professional Mesh"   description="Connect with a global alumni network across 500+ top companies." />
          <ToolCard to="/referrals" icon={Inbox}  title="Global Gateways"     description="Access direct referral channels to world-class corporations." />
        </div>
      </div>

      {/* ── Vision Block ── */}
      <div className="relative rounded-[2rem] overflow-hidden text-white">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-sky-950 to-indigo-950" />
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `radial-gradient(ellipse at 0% 0%, rgba(56,189,248,0.4) 0%, transparent 50%), radial-gradient(ellipse at 100% 100%, rgba(99,102,241,0.4) 0%, transparent 50%)`,
        }} />

        {/* Ghost icon */}
        <div className="absolute top-0 right-0 p-12 opacity-[0.04] pointer-events-none">
          <Brain className="w-72 h-72" />
        </div>

        <div className="relative z-10 p-10 lg:p-16 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 text-center lg:text-left">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full text-sky-400 text-[10px] font-black uppercase tracking-widest border border-white/10">
                <Sparkles className="w-3 h-3" /> The Nexus Vision
              </div>
              <h3 className="text-4xl lg:text-6xl font-black leading-[0.95] tracking-tighter">
                Accelerate<br /><span className="gradient-text-sky">Your Legacy</span>
              </h3>
            </div>
            <p className="text-slate-400 text-lg font-medium leading-relaxed italic opacity-80">
              "Connect with the masters of industry who have walked this path before you."
            </p>
            <Link
              to="/directory"
              className="py-4 px-10 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white text-sm inline-flex items-center gap-3 font-bold shadow-2xl shadow-sky-500/25 transition-all hover:scale-[1.03] hover:shadow-sky-500/40"
            >
              Explore Network <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {[
              { icon: FileText,     l: 'Resume IQ Scan',     t: '10 Tokens' },
              { icon: Map,          l: 'Master Roadmap',      t: '5 Tokens' },
              { icon: GraduationCap, l: 'Competency Mapping', t: '5 Tokens' },
            ].map(x => (
              <Link
                key={x.l}
                to="/ai"
                className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 hover:border-sky-500/30 transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-5">
                  <div className="p-3 bg-sky-500/10 rounded-xl text-sky-400 border border-sky-500/20 shadow-inner">
                    <x.icon className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-white uppercase tracking-[0.15em]">{x.l}</p>
                </div>
                <div className="text-xs font-black text-sky-400 flex items-center gap-2 group-hover:scale-110 transition-transform">
                  <Zap className="w-4 h-4 fill-sky-400" /> {x.t}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default StudentDashboard;
