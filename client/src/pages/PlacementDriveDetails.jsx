import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  Building2, Briefcase, Calendar, Users, 
  ChevronRight, ArrowLeft, Download,
  CheckCircle2, XCircle, Clock, Award
} from 'lucide-react';

const PlacementDriveDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [drive, setDrive] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDrive = async () => {
    try {
      const { data } = await api.get(`/drives/${id}`);
      setDrive(data);
    } catch (error) {
      toast.error('Failed to load drive details');
      navigate('/admin/drives');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrive();
  }, [id]);

  const updateStatus = async (studentId, status) => {
    try {
      await api.put(`/drives/${id}/status`, { studentId, status });
      toast.success(`Student marked as ${status}`);
      fetchDrive(); // Refresh data
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-sky-500/20 border-t-sky-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <button 
            onClick={() => navigate('/admin/drives')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Back to All Drives</span>
          </button>
          
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
              {drive.companyName}
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[10px] font-black uppercase tracking-widest">
                <Briefcase className="w-3 h-3" /> {drive.role}
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <Calendar className="w-3 h-3" /> Deadline: {new Date(drive.deadline).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Applicant List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
              <Users className="w-6 h-6 text-sky-400" />
              Applicant Pool
              <span className="text-xs font-bold text-slate-500 bg-white/5 px-2.5 py-1 rounded-lg">
                {drive.applications.length} Students
              </span>
            </h3>
          </div>

          {drive.applications.length === 0 ? (
            <div className="p-12 rounded-[2.5rem] border border-dashed border-white/10 bg-slate-900/20 flex flex-col items-center justify-center text-center">
              <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">No applications received yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {drive.applications.map((app) => (
                <div 
                  key={app.studentId._id}
                  className="p-5 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-white/10 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-5"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-black text-lg shadow-lg border border-white/5 overflow-hidden">
                      {app.studentId.profilePicture ? (
                        <img src={app.studentId.profilePicture} alt="" className="w-full h-full object-cover" />
                      ) : (
                        app.studentId.name[0]
                      )}
                    </div>
                    <div>
                      <h4 className="font-black text-white text-base leading-tight">{app.studentId.name}</h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                        {app.studentId.branch} • Year {app.studentId.year}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center flex-wrap gap-3">
                    {/* Status Badge */}
                    <div className={`px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-widest
                      ${app.status === 'selected' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        app.status === 'rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                        app.status === 'shortlisted' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-white/5 text-slate-400 border-white/10'}
                    `}>
                      {app.status}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => updateStatus(app.studentId._id, 'shortlisted')}
                        className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-all"
                        title="Shortlist"
                      >
                        <Award className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => updateStatus(app.studentId._id, 'selected')}
                        className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                        title="Select"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => updateStatus(app.studentId._id, 'rejected')}
                        className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                        title="Reject"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Drive Details */}
        <div className="space-y-6">
          <div className="p-8 rounded-[2.5rem] bg-slate-900 border border-white/5 space-y-8">
            <div className="space-y-2">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">About the Role</h4>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">
                {drive.description || 'No detailed description provided for this drive.'}
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Eligibility Rules</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-xs font-bold text-slate-400">Min CGPA</span>
                  <span className="text-xs font-black text-white">{drive.eligibility?.minCGPA || 'Any'}</span>
                </div>
                <div className="space-y-2">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Target Branches</span>
                  <div className="flex flex-wrap gap-2">
                    {drive.eligibility?.branches.map(b => (
                      <span key={b} className="px-2 py-1 rounded-lg bg-sky-500/5 border border-sky-500/10 text-[9px] font-bold text-sky-400 uppercase tracking-widest">
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Key Skills</span>
                  <div className="flex flex-wrap gap-2">
                    {drive.eligibility?.skills.map(s => (
                      <span key={s} className="px-2 py-1 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-[9px] font-bold text-emerald-400 uppercase tracking-widest">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <button className="w-full py-4 rounded-2xl bg-white/5 border border-white/5 text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2">
              <Download className="w-4 h-4" /> Export Applicant CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlacementDriveDetails;
