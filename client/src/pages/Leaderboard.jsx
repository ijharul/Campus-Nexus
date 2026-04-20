import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';
import { 
  Trophy, Crown, Zap, Target, Users, ArrowRight,
  TrendingUp, Award, Star, Info, ChevronRight, UserPlus, FileText, CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

/* ── Asset Configuration ─────────────────────────────────────────────────── */
const MEDALS = {
  1: { bg: 'bg-amber-500',   grad: 'from-amber-400 to-amber-600', ring: 'ring-amber-500/50', icon: Crown, label: 'Gold' },
  2: { bg: 'bg-slate-300',   grad: 'from-slate-300 to-slate-400', ring: 'ring-slate-400/50', icon: Trophy, label: 'Silver' },
  3: { bg: 'bg-orange-700',  grad: 'from-orange-500 to-orange-700', ring: 'ring-orange-700/50', icon: Award, label: 'Bronze' },
};

const ALUMNI_RULES = [
  { action: 'Post a New Referral', points: 20, icon: UserPlus, color: 'sky' },
  { action: 'Accept Mentorship Request', points: 15, icon: Users, color: 'indigo' },
  { action: 'Candidate gets Interview', points: 50, icon: Target, color: 'amber' },
  { action: 'Official Hire Confirmed', points: 250, icon: CheckCircle2, color: 'emerald' },
];

const STUDENT_RULES = [
  { action: 'Apply for Referral', points: 5, icon: FileText, color: 'sky' },
  { action: 'Request Mentorship', points: 10, icon: Users, color: 'indigo' },
  { action: 'Secure an Interview', points: 40, icon: Target, color: 'amber' },
  { action: 'Get Hired / Internship', points: 150, icon: CheckCircle2, color: 'emerald' },
];

/* ── Components ──────────────────────────────────────────────────────────── */
const LeaderboardItem = ({ member, rank, isMe }) => {
  const m = MEDALS[rank];
  
  return (
    <div className={`relative flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 border overflow-hidden group
      ${isMe 
        ? 'bg-sky-500/[0.08] border-sky-500/30 shadow-lg shadow-sky-500/10' 
        : 'bg-slate-900/60 border-white/[0.05] hover:bg-slate-800/80 hover:border-white/[0.12] hover:-translate-y-0.5'
      }`}
    >
      {/* Rank Indicator */}
      <div className="w-10 sm:w-12 flex items-center justify-center shrink-0">
        {m ? (
          <div className={`relative w-10 h-10 rounded-xl bg-gradient-to-br ${m.grad} flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform`}>
            <m.icon className="w-5 h-5 text-white/90" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-slate-900 rounded-full flex items-center justify-center text-[9px] font-black text-white border border-white/10">
              {rank}
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-sm font-black text-slate-400">
            {rank}
          </div>
        )}
      </div>

      {/* Avatar */}
      <div className="relative shrink-0">
        <img
          src={member.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=0ea5e9&color=fff&size=128`}
          alt={member.name}
          className={`w-12 h-12 rounded-xl object-cover ring-2 ${m ? m.ring : 'ring-white/10'}`}
        />
        {member.badges?.includes('Verified Alumni') && (
          <div className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-br from-sky-400 to-indigo-500 rounded-full border-2 border-slate-900 flex items-center justify-center shadow-sm">
            <Star className="w-2.5 h-2.5 text-white fill-current" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 py-1">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <Link
            to={member.username ? `/u/${member.username}` : `/profile/${member._id}`}
            className="font-black text-white hover:text-sky-400 transition-colors text-sm sm:text-base truncate tracking-tight"
          >
            {member.name}
          </Link>
          {isMe && (
            <span className="px-2 py-0.5 rounded-md bg-sky-500/20 border border-sky-500/30 text-[9px] font-black text-sky-400 uppercase tracking-widest shrink-0">
              You
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-400 font-medium truncate">
          {member.role === 'alumni'
            ? <span className="text-slate-300">{member.currentRole || 'Professional'} <span className="text-slate-600 mx-1">•</span> {member.company || 'Enterprise'}</span>
            : <span>{member.branch || 'Student'} <span className="text-slate-600 mx-1">•</span> Year {member.year || 'N/A'}</span>
          }
        </p>
      </div>

      {/* Points */}
      <div className="text-right shrink-0">
        <div className="text-lg sm:text-2xl font-black text-white tabular-nums tracking-tighter group-hover:text-amber-400 transition-colors">
          {member.contributionScore || 0}
        </div>
        <div className="text-[9px] text-amber-500/80 font-black uppercase tracking-widest flex items-center justify-end gap-1 mt-0.5">
          <Zap className="w-3 h-3 fill-current" /> Points
        </div>
      </div>
    </div>
  );
};

/* ── Main View ───────────────────────────────────────────────────────────── */
export default function Leaderboard() {
  const { user } = useContext(AuthContext);
  const [alumni, setAlumni] = useState([]);
  const [students, setStudents] = useState([]);
  const [myStats, setMyStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('alumni');
  const [showRules, setShowRules] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const isAdmin = user?.role === 'collegeAdmin';
      const promises = [
        api.get('/gamification/leaderboard/alumni'),
        api.get('/gamification/leaderboard/students'),
      ];

      if (!isAdmin) {
        promises.push(api.get('/gamification/my-stats'));
      }

      const results = await Promise.all(promises);
      setAlumni(results[0].data);
      setStudents(results[1].data);
      if (!isAdmin) {
        setMyStats(results[2].data);
      }
    } catch {
      toast.error('Failed to sync leaderboard.');
    } finally {
      setLoading(false);
    }
  };

  const currentList = activeTab === 'alumni' ? alumni : students;

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center animate-pulse">
        <Trophy className="w-6 h-6 text-amber-500/50" />
      </div>
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest animate-pulse">Syncing Ranks...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-6 duration-700">

      {/* ── Hero & Stats ── */}
      <div className="relative overflow-hidden rounded-[2rem] border border-white/5 bg-slate-900/50">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-slate-900 to-sky-500/10 opacity-50" />
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
          <Trophy className="w-96 h-96" />
        </div>

        <div className="relative z-10 p-8 sm:p-10 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 bg-white/5 rounded-lg border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-300">
                <Users className="w-3.5 h-3.5 text-sky-400" /> Institute Rankings
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-none mb-2">
                Nexus <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">Elite</span>
              </h1>
              <p className="text-sm text-slate-400 font-medium max-w-sm">
                Recognizing the most active and impactful members shaping our institutional network.
              </p>
            </div>

            {/* My Stats Card - Floating */}
            {myStats && user?.role !== 'collegeAdmin' && (
              <div className="flex bg-slate-950/50 rounded-2xl border border-white/10 p-2 shrink-0 backdrop-blur-sm">
                <div className="px-6 py-4 border-r border-white/5">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Your Rank</p>
                  <p className="text-3xl font-black text-white tracking-tighter">#{myStats.rank}</p>
                </div>
                <div className="px-6 py-4 border-r border-white/5">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Points</p>
                  <p className="text-3xl font-black text-amber-400 tracking-tighter">{myStats.contributionScore || 0}</p>
                </div>
                <div className="px-6 py-4">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Tokens</p>
                  <p className="text-3xl font-black text-emerald-400 tracking-tighter">{myStats.tokens || 0}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Scoring Logic Toggle ── */}
      <div className="rounded-2xl border border-white/5 bg-slate-900/30 overflow-hidden transition-all duration-300">
        <button 
          onClick={() => setShowRules(!showRules)}
          className="w-full flex items-center justify-between p-5 text-left hover:bg-white/[0.02] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
              <Info className="w-4 h-4 text-sky-400" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">How rankings work</h3>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5">Click to view the point system logic</p>
            </div>
          </div>
          <ChevronRight className={`w-5 h-5 text-slate-600 transition-transform duration-300 ${showRules ? 'rotate-90' : ''}`} />
        </button>
        
        {showRules && (
          <div className="p-5 border-t border-white/5 bg-slate-900/50 animate-in fade-in slide-in-from-top-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
              {activeTab === 'alumni' ? 'Professional Contribution Scores' : 'Institutional Engagement Scores'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {(activeTab === 'alumni' ? ALUMNI_RULES : STUDENT_RULES).map((rule, idx) => {
                const Icon = rule.icon;
                return (
                  <div key={idx} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <Icon className={`w-5 h-5 text-${rule.color}-400 mb-3`} />
                    <p className="text-xl font-black text-white mb-1">+{rule.points} <span className="text-[10px] text-slate-500 uppercase">pts</span></p>
                    <p className="text-xs font-medium text-slate-400 leading-snug">{rule.action}</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 p-4 rounded-xl bg-sky-500/10 border border-sky-500/20 flex gap-3 items-start text-xs text-sky-200">
              <Zap className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed"><strong className="font-bold text-sky-400 text-sm block mb-1">Why is my rank 1?</strong> If you have 0 points, you tie for 1st place with all other users who also have 0 points relative to your filter. Start participating in Referrals to earn points and climb the real ladder!</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Lists ── */}
      <div className="space-y-6">
        {/* Modern Tabs */}
        <div className="flex p-1.5 rounded-2xl bg-slate-900/80 border border-white/[0.07] gap-1 w-full sm:w-fit">
          {['alumni', 'students'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 sm:flex-none sm:w-40 flex items-center justify-center gap-2 rounded-xl py-3 text-[10px] font-black uppercase tracking-widest transition-all duration-200
                ${activeTab === tab
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                }`}
            >
              {tab === 'alumni' ? 'Top Alumni' : 'Top Students'}
            </button>
          ))}
        </div>

        {/* Leaderboard Array */}
        <div className="space-y-3">
          {currentList.length === 0 ? (
            <div className="py-24 text-center rounded-3xl border border-dashed border-white/10 bg-slate-900/30">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-slate-600" />
              </div>
              <h3 className="text-lg font-black text-white mb-1">No leaders yet</h3>
              <p className="text-xs font-medium text-slate-500">The ladder begins when the first points are earned.</p>
            </div>
          ) : (() => {
            let currentRank = 1;
            return currentList.map((leader, i) => {
              if (i > 0 && leader.contributionScore < currentList[i - 1].contributionScore) {
                currentRank = i + 1;
              }
              return (
                <LeaderboardItem 
                  key={leader._id} 
                  member={leader} 
                  rank={currentRank} 
                  isMe={leader._id === user?._id}
                />
              );
            });
          })()}
        </div>
      </div>

      {/* ── Start Earning CTA ── */}
      {/* ── Start Earning CTA (Hidden for Admin) ── */}
      {user?.role !== 'collegeAdmin' && (
        <div className="rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 p-1 border border-indigo-500/20 shadow-2xl shadow-indigo-500/10">
          <div className="rounded-[1.35rem] bg-slate-900 px-6 py-8 sm:px-10 flex flex-col sm:flex-row items-center justify-center gap-6">
            <div className="flex items-center gap-5 text-center sm:text-left">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0 mx-auto sm:mx-0">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-black text-white tracking-tight leading-tight">Start earning points today</h4>
                <p className="text-xs text-slate-400 font-medium mt-1 max-w-md">
                  {user?.role === 'alumni' 
                    ? 'Help current students succeed. Post a referral or accept mentorship requests to climb the ranks.' 
                    : 'Apply for referrals listed by verified alumni to boost your visibility and earn engagement points.'}
                </p>
              </div>
            </div>
            <Link
              to={user?.role === 'alumni' ? "/referrals" : "/referrals"}
              className="w-full sm:w-auto shrink-0 px-8 py-3.5 bg-white hover:bg-slate-100 text-slate-900 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 group"
            >
              {user?.role === 'alumni' ? 'Provide Referrals' : 'Go to Referrals'} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}
