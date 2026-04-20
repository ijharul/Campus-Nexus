import { X, Briefcase, GraduationCap, Building2, Zap, UserCheck, Clock, Star, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const UserDetailModal = ({ user: u, onClose, onReport }) => {
  const [reporting, setReporting] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [showReportForm, setShowReportForm] = useState(false);

  if (!u) return null;
  const initials = u.name?.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase() || '?';

  const handleReport = async (e) => {
    e.preventDefault();
    if (!reportReason.trim()) return;
    setReporting(true);
    try {
      await api.post('/college-admin/reports', { targetId: u._id, reason: reportReason });
      toast.success('Report filed for review.');
      setReportReason('');
      setShowReportForm(false);
    } catch { toast.error('Report submission failed.'); }
    finally { setReporting(false); }
  };

  const roleColor = {
    student:      'bg-sky-100 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400',
    alumni:       'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    collegeAdmin: 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 border border-sky-100 dark:border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-sky-50 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">User Profile</h3>
          <div className="flex items-center gap-2">
            {!showReportForm && (
              <button 
                onClick={() => setShowReportForm(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black uppercase text-rose-500 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 rounded-lg transition-all"
                title="Report this user"
              >
                <ShieldAlert className="w-3.5 h-3.5" /> Report
              </button>
            )}
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors rounded-lg p-1 hover:bg-sky-50 dark:hover:bg-slate-700">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {showReportForm && (
            <div className="bg-rose-50 dark:bg-rose-500/10 border-2 border-rose-200 dark:border-rose-500/20 rounded-2xl p-5 animate-in slide-in-from-top-4 duration-300">
              <div className="flex items-center justify-between mb-3 text-rose-600 dark:text-rose-400">
                <p className="text-xs font-black uppercase tracking-widest">Reporting Conduct</p>
                <button onClick={() => setShowReportForm(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X className="w-4 h-4" /></button>
              </div>
              <form onSubmit={handleReport} className="space-y-3">
                <textarea 
                  required
                  value={reportReason}
                  onChange={e => setReportReason(e.target.value)}
                  placeholder="Why are you reporting this user?"
                  className="w-full bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-500/20 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-rose-500 transition-all min-h-[80px]"
                />
                <button disabled={reporting} type="submit" className="w-full py-2 bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-black uppercase rounded-lg shadow-lg shadow-rose-500/20">
                  {reporting ? 'Submitting...' : 'Submit Report for Review'}
                </button>
              </form>
            </div>
          )}
          {/* Avatar + basic */}
          <div className="flex items-start gap-4">
            {u.profilePicture
              ? <img src={u.profilePicture} alt={u.name} className="w-16 h-16 rounded-xl object-cover ring-2 ring-sky-100 dark:ring-slate-600 shrink-0" />
              : <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold shrink-0">{initials}</div>
            }
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white truncate">{u.name}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{u.email}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${roleColor[u.role] || 'bg-slate-100 text-slate-500'}`}>{u.role}</span>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${u.plan === 'Free' ? 'bg-slate-100 dark:bg-slate-700 text-slate-500' : 'bg-sky-100 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400'}`}>
                  {u.plan} Plan
                </span>
                {u.isApproved === false && (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Pending
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Info cards */}
          <div className="grid grid-cols-2 gap-3">
            {u.collegeId?.name && (
              <InfoTile icon={Building2} label="College" value={u.collegeId.name} />
            )}
            {u.pendingCollege && (
              <InfoTile icon={Building2} label="College (Pending)" value={u.pendingCollege} />
            )}
            {u.company && (
              <InfoTile icon={Briefcase} label="Company" value={u.company} />
            )}
            {u.currentRole && (
              <InfoTile icon={UserCheck} label="Role/Title" value={u.currentRole} />
            )}
            {u.batch && (
              <InfoTile icon={GraduationCap} label="Batch" value={u.batch} />
            )}
            {u.branch && (
              <InfoTile icon={GraduationCap} label="Branch" value={u.branch} />
            )}
            <InfoTile icon={Zap} label="AI Tokens" value={`${u.tokens ?? 0} remaining`} accent />
          </div>

          {/* Bio */}
          {u.bio && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">About</p>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{u.bio}</p>
            </div>
          )}

          {/* Skills */}
          {u.skills?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {u.skills.map((s, i) => (
                  <span key={i} className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-100 dark:border-sky-500/20">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Experience */}
          {u.experience?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Experience</p>
              <div className="space-y-2">
                {u.experience.map((exp, i) => (
                  <div key={i} className="px-4 py-3 bg-sky-50/50 dark:bg-slate-700/40 rounded-xl border border-sky-100 dark:border-slate-700">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{exp.role || exp.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{exp.company} {exp.duration && `· ${exp.duration}`}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {u.projects?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Projects</p>
              <div className="space-y-2">
                {u.projects.map((p, i) => (
                  <div key={i} className="px-4 py-3 bg-sky-50/50 dark:bg-slate-700/40 rounded-xl border border-sky-100 dark:border-slate-700">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{p.title}</p>
                    {p.description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{p.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resume link */}
          {u.resume && (
            <a href={u.resume} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-sky-600 dark:text-sky-400 hover:underline">
              📄 View Resume
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

const InfoTile = ({ icon: Icon, label, value, accent }) => (
  <div className={`px-3 py-2.5 rounded-xl border ${accent ? 'bg-sky-50 dark:bg-sky-500/10 border-sky-100 dark:border-sky-500/20' : 'bg-slate-50 dark:bg-slate-700/40 border-sky-50 dark:border-slate-700'}`}>
    <div className="flex items-center gap-1.5 mb-0.5">
      <Icon className={`w-3.5 h-3.5 ${accent ? 'text-sky-500' : 'text-slate-400'}`} />
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{label}</span>
    </div>
    <p className={`text-sm font-semibold ${accent ? 'text-sky-700 dark:text-sky-400' : 'text-slate-800 dark:text-slate-200'} truncate`}>{value}</p>
  </div>
);

export default UserDetailModal;
