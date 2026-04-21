import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { AuthContext } from '../contexts/AuthContext';
import { 
  Building2, Briefcase, Calendar, 
  ChevronRight, Search, Filter,
  Sparkles, Zap, Target, CheckCircle2,
  Clock, ArrowUpRight, Lock
} from 'lucide-react';

const OpportunityHub = () => {
  const { user } = useContext(AuthContext);
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [applying, setApplying] = useState(null);

  const fetchDrives = async () => {
    try {
      const { data } = await api.get('/drives');
      setDrives(data);
    } catch (error) {
      toast.error('Failed to load opportunities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrives();
  }, []);

  const handleApply = async (driveId) => {
    setApplying(driveId);
    try {
      await api.post(`/drives/${driveId}/apply`);
      toast.success('Application submitted successfully! 🚀');
      fetchDrives(); // Refresh to show "Applied" status
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(null);
    }
  };

  const filteredDrives = drives.filter(drive => 
    drive.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    drive.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-2 border-sky-500/20 border-t-sky-500 rounded-full animate-spin" />
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest animate-pulse">Scanning Global Openings</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {/* Compact Header Section */}
      <div className="relative p-8 md:p-12 rounded-[2.5rem] bg-slate-900/40 border border-white/5 overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-sky-500/10 via-transparent to-indigo-500/5 opacity-50" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sky-500/20 rounded-xl flex items-center justify-center text-sky-400 border border-sky-500/30">
                <Target className="w-5 h-5" />
              </div>
              <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-4">
                <h1 className="text-4xl font-black text-white tracking-tighter">
                  Opportunity <span className="text-sky-400">Hub</span>
                </h1>
                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest hidden md:block">
                  — Accelerate your career trajectory
                </p>
              </div>
            </div>
            <p className="text-slate-500 text-xs font-medium max-w-2xl md:hidden">
              Accelerate your career trajectory. Browse and apply for exclusive placement drives.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{drives.length} Active Drives</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar Refined */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-sky-500 transition-colors" />
          <input
            type="text"
            placeholder="Filter by company, role, or tech stack..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/40 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm text-white placeholder-slate-600 focus:ring-1 focus:ring-sky-500/30 focus:bg-slate-900/60 outline-none transition-all shadow-2xl"
          />
        </div>
      </div>

      {/* Opportunities Grid */}
      {filteredDrives.length === 0 ? (
        <div className="py-32 rounded-[3rem] border border-dashed border-white/10 flex flex-col items-center justify-center text-center px-6 bg-slate-900/20">
          <div className="w-20 h-20 rounded-3xl bg-slate-950 flex items-center justify-center mb-8 border border-white/5">
            <Zap className="w-10 h-10 text-slate-800" />
          </div>
          <h3 className="text-2xl font-black text-white mb-2 italic">"Silence is just the space before success."</h3>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em]">The grid is currently empty</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {filteredDrives.map((drive) => {
            const hasApplied = drive.applications.some(a => a.studentId === user?._id);
            const myApplication = drive.applications.find(a => a.studentId === user?._id);
            const isExpired = new Date() > new Date(drive.deadline);
            
            return (
              <div
                key={drive._id}
                className="group relative p-7 rounded-[2rem] bg-slate-900/40 border border-white/5 hover:border-sky-500/20 hover:bg-slate-900/60 transition-all duration-500 flex flex-col justify-between"
              >
                <div className="space-y-6">
                  {/* Company Info */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-sky-500/10 transition-transform group-hover:scale-105 duration-500">
                        {drive.companyName[0]}
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-white tracking-tight group-hover:text-sky-400 transition-colors">
                          {drive.companyName}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                          <p className="text-sm font-bold text-slate-400">{drive.role}</p>
                        </div>
                      </div>
                    </div>
                    {hasApplied && (
                       <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                         <CheckCircle2 className="w-3.5 h-3.5" /> Applied
                       </div>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-500 font-medium leading-relaxed line-clamp-2">
                    {drive.description || 'Explore this high-growth opportunity within your institutional recruitment ecosystem.'}
                  </p>

                  {/* Requirements Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Min. Eligibility</p>
                      <p className="text-sm font-black text-white">{drive.eligibility?.minCGPA || '0.0'} CGPA</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Application End</p>
                      <p className="text-sm font-black text-sky-400">
                        {new Date(drive.deadline).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {/* Skills Tags */}
                  <div className="flex flex-wrap gap-2">
                    {drive.eligibility?.skills.map((skill, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-between">
                   {hasApplied ? (
                     <div className="flex items-center gap-3">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Application Status</p>
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest
                          ${myApplication.status === 'selected' ? 'text-emerald-400 bg-emerald-400/10' :
                            myApplication.status === 'rejected' ? 'text-rose-400 bg-rose-400/10' :
                            myApplication.status === 'shortlisted' ? 'text-amber-400 bg-amber-400/10' :
                            'text-sky-400 bg-sky-400/10'}
                        `}>
                          {myApplication.status}
                        </span>
                     </div>
                   ) : isExpired ? (
                     <div className="flex items-center gap-2 text-rose-500/50">
                        <Lock className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Application Closed</span>
                     </div>
                   ) : (
                     <button
                        onClick={() => handleApply(drive._id)}
                        disabled={applying === drive._id}
                        className="w-full py-4 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-black text-[11px] uppercase tracking-[0.2em] transition-all shadow-lg shadow-sky-500/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 group/btn"
                     >
                       {applying === drive._id ? (
                         <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                       ) : (
                         <>
                           Confirm Application
                           <Zap className="w-4 h-4 fill-current group-hover/btn:translate-x-1 transition-transform" />
                         </>
                       )}
                     </button>
                   )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OpportunityHub;
