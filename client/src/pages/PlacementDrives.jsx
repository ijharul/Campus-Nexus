import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  Building2, Briefcase, Calendar, Users, 
  ChevronRight, Plus, Search, Filter,
  Trophy, Clock, ArrowUpRight
} from 'lucide-react';

const PlacementDrives = () => {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchDrives = async () => {
    try {
      const { data } = await api.get('/drives');
      setDrives(data);
    } catch (error) {
      toast.error('Failed to load placement drives');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrives();
  }, []);

  const filteredDrives = drives.filter(drive => 
    drive.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    drive.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-2 border-sky-500/20 border-t-sky-500 rounded-full animate-spin" />
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest animate-pulse">Syncing Opportunity Grid</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20">
            <Trophy className="w-3 h-3 text-sky-400" />
            <span className="text-[9px] font-black text-sky-400 uppercase tracking-widest">Recruitment Management</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-none">
            Placement <span className="text-sky-400">Drives</span>
          </h1>
          <p className="text-slate-400 text-sm font-medium max-w-lg">
            Manage and track organizational recruitment pipelines across the institutional ecosystem.
          </p>
        </div>

        <Link
          to="/admin/drives/create"
          className="shrink-0 inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-sky-500/20 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" /> New Placement Drive
        </Link>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Drives', value: drives.length, icon: Building2, color: 'text-sky-400' },
          { label: 'Total Applicants', value: drives.reduce((acc, d) => acc + d.applications.length, 0), icon: Users, color: 'text-indigo-400' },
          { label: 'Shortlisted', value: drives.reduce((acc, d) => acc + d.applications.filter(a => a.status === 'shortlisted').length, 0), icon: Trophy, color: 'text-amber-400' },
          { label: 'Placed', value: drives.reduce((acc, d) => acc + d.applications.filter(a => a.status === 'selected').length, 0), icon: Trophy, color: 'text-emerald-400' },
        ].map((stat, i) => (
          <div key={i} className="p-4 rounded-2xl bg-slate-900/50 border border-white/5 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
              <p className="text-lg font-black text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by company or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/50 border border-white/5 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-slate-600 focus:ring-2 focus:ring-sky-500/40 outline-none transition-all"
          />
        </div>
      </div>

      {/* Drives Grid */}
      {filteredDrives.length === 0 ? (
        <div className="py-20 rounded-[2.5rem] border border-dashed border-white/10 flex flex-col items-center justify-center text-center px-6">
          <div className="w-16 h-16 rounded-3xl bg-slate-900 flex items-center justify-center mb-6 border border-white/5">
            <Building2 className="w-8 h-8 text-slate-700" />
          </div>
          <h3 className="text-xl font-black text-white mb-2">No Drives Found</h3>
          <p className="text-sm text-slate-500 font-medium max-w-xs">Try adjusting your search or launch a new recruitment drive.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredDrives.map((drive) => (
            <Link
              key={drive._id}
              to={`/admin/drives/${drive._id}`}
              className="group relative p-6 rounded-[2rem] bg-slate-900/40 border border-white/5 hover:border-white/10 transition-all duration-500 overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight className="w-5 h-5 text-sky-400" />
              </div>

              <div className="flex items-start gap-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-sky-500/10">
                  {drive.companyName[0]}
                </div>
                
                <div className="flex-1 min-w-0 space-y-1">
                  <h3 className="text-xl font-black text-white tracking-tight group-hover:text-sky-400 transition-colors truncate">
                    {drive.companyName}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-3 h-3 text-slate-500" />
                    <p className="text-sm font-bold text-slate-400 truncate">{drive.role}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-4">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Applications</p>
                  <p className="text-lg font-black text-white">{drive.applications.length}</p>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-[8px] font-black text-sky-500 uppercase tracking-widest mb-1">Deadline</p>
                  <p className="text-xs font-bold text-sky-400">
                    {new Date(drive.deadline).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mb-1">CGPA</p>
                  <p className="text-lg font-black text-emerald-400">{drive.eligibility?.minCGPA || '—'}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {drive.eligibility?.skills.slice(0, 3).map((skill, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    {skill}
                  </span>
                ))}
                {drive.eligibility?.skills.length > 3 && (
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                    +{drive.eligibility.skills.length - 3} More
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlacementDrives;
