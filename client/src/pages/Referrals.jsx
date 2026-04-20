import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { AuthContext } from '../contexts/AuthContext';
import {
  Building2, ExternalLink, Check, X, Award, Trophy,
  Plus, FileText, Briefcase, User, ChevronRight,
  Clock, Star, Sparkles,
} from 'lucide-react';

/* ── Status Badge ────────────────────────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const map = {
    pending:   'bg-amber-500/10 text-amber-400 border-amber-500/25',
    accepted:  'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
    rejected:  'bg-rose-500/10 text-rose-400 border-rose-500/25',
    referred:  'bg-sky-500/10 text-sky-400 border-sky-500/25',
    interview: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25',
    selected:  'bg-emerald-500 text-white border-emerald-600',
  };
  return (
    <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border ${map[status] || 'bg-white/5 text-slate-500 border-white/10'}`}>
      {status}
    </span>
  );
};

/* ── Lifecycle Stepper ───────────────────────────────────────────────────── */
const LifecycleStepper = ({ currentStatus, history }) => {
  const stages = ['pending', 'accepted', 'referred', 'interview', 'selected'];
  const currentIndex = stages.indexOf(currentStatus);

  return (
    <div className="mb-5">
      <div className="flex items-center gap-0">
        {stages.map((stage, i) => {
          const isActive  = i <= currentIndex;
          const isCurrent = i === currentIndex;
          const dateMark  = history?.find((h) => h.status === stage)?.timestamp;

          return (
            <div key={stage} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                  isCurrent   ? 'bg-sky-500 border-sky-400 scale-110 shadow-lg shadow-sky-500/40'
                  : isActive  ? 'bg-sky-500/80 border-sky-500'
                              : 'bg-white/5 border-white/10'
                }`}>
                  {isActive && i < currentIndex
                    ? <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    : isCurrent
                      ? <div className="w-2 h-2 rounded-full bg-white" />
                      : null
                  }
                </div>
                <div className="mt-1.5 text-center">
                  <p className={`text-[8px] font-black uppercase tracking-widest ${isCurrent ? 'text-sky-400' : isActive ? 'text-slate-300' : 'text-slate-600'}`}>
                    {stage}
                  </p>
                  {dateMark && (
                    <p className="text-[7px] text-slate-600 mt-0.5">
                      {new Date(dateMark).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </p>
                  )}
                </div>
              </div>
              {/* Connector line */}
              {i < stages.length - 1 && (
                <div className={`flex-1 h-0.5 mb-5 mx-1 rounded-full transition-all ${i < currentIndex ? 'bg-sky-500' : 'bg-white/5'}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ── Main Component ──────────────────────────────────────────────────────── */
const Referrals = () => {
  const { user } = useContext(AuthContext);
  const [requests, setRequests]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showModal, setShowModal]     = useState(false);
  const [alumniList, setAlumniList]   = useState([]);
  const [submitting, setSubmitting]   = useState(false);
  const [formData, setFormData]       = useState({
    alumniId: '', company: '', role: '', jobType: 'full-time', resume: null, message: '',
  });

  const fetchRequests = async () => {
    try {
      const endpoint = user?.role === 'student' ? '/referrals/my-requests' : '/referrals/incoming';
      const { data } = await api.get(endpoint);
      setRequests(data);
    } catch {
      toast.error('Unable to load referral data.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAlumniList = async () => {
    try {
      const { data } = await api.get('/users?role=alumni');
      setAlumniList(data);
    } catch (err) {
      console.error('Error fetching alumni:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRequests();
      if (user.role === 'student') fetchAlumniList();
    }
  }, [user]);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/referrals/${id}`, { status });
      toast.success(`Status updated to ${status}.`);
      fetchRequests();
    } catch {
      toast.error('Failed to update status.');
    }
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => { if (formData[key]) data.append(key, formData[key]); });
      await api.post('/referrals/request', data);
      toast.success('Referral request submitted!');
      setShowModal(false);
      setFormData({ alumniId: '', company: '', role: '', jobType: 'full-time', resume: null, message: '' });
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-2 border-sky-500/20 border-t-sky-500 rounded-full animate-spin" />
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest animate-pulse">Loading Referrals</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-16 animate-in fade-in slide-in-from-bottom-6 duration-700">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 bg-sky-500/10 text-sky-400 text-[9px] font-black uppercase rounded-xl border border-sky-500/20 tracking-widest">
              {user?.role === 'student' ? 'My Referrals' : 'Endorsement Center'}
            </div>
            {requests.length > 0 && (
              <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-400 text-[9px] font-black">
                {requests.length} Active
              </span>
            )}
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-none">
            {user?.role === 'student' ? 'Job Referrals' : 'Professional Referrals'}
          </h1>
          <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-lg">
            {user?.role === 'student'
              ? 'Request endorsements from alumni at your target organizations.'
              : 'Empower the community by providing professional referrals to top talent.'}
          </p>
        </div>

        {user?.role === 'student' && (
          <button
            onClick={() => setShowModal(true)}
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-sky-500/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" /> New Request
          </button>
        )}
      </div>

      {/* ── Referral Cards ── */}
      {requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 rounded-[2.5rem] border border-dashed border-white/10 bg-slate-900/40 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="w-16 h-16 rounded-2xl bg-sky-500/10 flex items-center justify-center mb-6 border border-sky-500/20 relative z-10">
            <Sparkles className="w-8 h-8 text-sky-500" />
          </div>
          <h3 className="text-xl font-black text-white mb-2 relative z-10 italic">"Your endorsement is their breakthrough."</h3>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mb-8 relative z-10">
            {user?.role === 'student' ? 'No referrals requested yet' : 'The endorsement queue is currently clear'}
          </p>
          {user?.role === 'student' && (
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold text-xs uppercase tracking-widest hover:bg-sky-500 hover:text-white transition-all"
            >
              Request Referral
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {requests.map((req) => {
            const targetUser = user?.role === 'student' ? req.alumni : req.student;
            if (!targetUser) return null;

            return (
              <div
                key={req._id}
                className="group flex flex-col rounded-2xl border border-white/[0.07] bg-slate-900/60 overflow-hidden hover:border-white/[0.14] hover:-translate-y-0.5 transition-all duration-300"
              >
                {/* Top accent */}
                <div className={`h-0.5 w-full ${req.status === 'selected' ? 'bg-gradient-to-r from-emerald-400 to-teal-400' : req.status === 'rejected' ? 'bg-rose-500/50' : 'bg-gradient-to-r from-sky-500 to-indigo-500'}`} />

                <div className="p-6 flex-1 space-y-5">
                  {/* User + status row */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center font-black text-white text-base shadow-lg shrink-0">
                        {targetUser.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-black text-white text-base leading-tight truncate">{targetUser.name}</h4>
                        <p className="text-[10px] text-sky-400 font-bold uppercase tracking-widest truncate">
                          {targetUser.company || targetUser.role}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={req.status} />
                  </div>

                  {/* Job details */}
                  <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
                    <div>
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Company</p>
                      <p className="text-xs font-bold text-white truncate">{req.company}</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Role</p>
                      <p className="text-xs font-bold text-white truncate">{req.role}</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-sky-500 uppercase tracking-widest mb-1">Type</p>
                      <p className="text-xs font-bold text-sky-400 capitalize">{req.jobType?.replace('-', ' ')}</p>
                    </div>
                  </div>

                  {/* Lifecycle stepper */}
                  <LifecycleStepper currentStatus={req.status} history={req.history} />

                  {/* Resume + message */}
                  <div className="space-y-3">
                    {req.resume && (
                      <a
                        href={req.resume} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-sky-400 transition-colors uppercase tracking-widest"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> View Resume
                      </a>
                    )}
                    {req.message && (
                      <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-400 italic leading-relaxed">
                        "{req.message}"
                      </div>
                    )}
                  </div>
                </div>

                {/* Alumni Actions footer */}
                {user?.role === 'alumni' && (
                  <div className="px-6 py-4 border-t border-white/5 flex flex-wrap gap-2">
                    {req.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateStatus(req._id, 'accepted')}
                          className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                        >
                          <Check className="w-3.5 h-3.5" strokeWidth={3} /> Accept
                        </button>
                        <button
                          onClick={() => updateStatus(req._id, 'rejected')}
                          className="flex-1 py-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                          <X className="w-3.5 h-3.5" strokeWidth={3} /> Decline
                        </button>
                      </>
                    )}
                    {req.status === 'accepted' && (
                      <button
                        onClick={() => updateStatus(req._id, 'referred')}
                        className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2"
                      >
                        <Award className="w-3.5 h-3.5" /> Mark as Referred
                      </button>
                    )}
                    {req.status === 'referred' && (
                      <button
                        onClick={() => updateStatus(req._id, 'interview')}
                        className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                      >
                        <Briefcase className="w-3.5 h-3.5" /> Interview Scheduled
                      </button>
                    )}
                    {req.status === 'interview' && (
                      <button
                        onClick={() => updateStatus(req._id, 'selected')}
                        className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                      >
                        <Trophy className="w-3.5 h-3.5" /> Candidate Selected 🎉
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Request Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <div>
                <h3 className="text-lg font-black text-white tracking-tight">Request Referral</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Fill in your job details</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSendRequest} className="p-6 space-y-4">

              {/* Alumni select */}
              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Select Alumni</label>
                <select
                  required
                  onChange={(e) => setFormData({ ...formData, alumniId: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500/50 outline-none transition-all appearance-none"
                >
                  <option value="" className="bg-slate-900">Choose alumni...</option>
                  {alumniList.map((a) => (
                    <option key={a._id} value={a._id} className="bg-slate-900">
                      {a.name}{a.company ? ` — ${a.company}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Company + Role */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Company</label>
                  <input
                    required type="text"
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g. Google"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500/50 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Job Title</label>
                  <input
                    required type="text"
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="e.g. SWE Intern"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500/50 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Job type */}
              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Employment Type</label>
                <select
                  onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500/50 outline-none transition-all appearance-none"
                >
                  <option value="full-time" className="bg-slate-900">Full-Time</option>
                  <option value="internship" className="bg-slate-900">Internship</option>
                  <option value="part-time" className="bg-slate-900">Part-Time</option>
                  <option value="contract" className="bg-slate-900">Contract</option>
                </select>
              </div>

              {/* Resume upload */}
              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Resume (PDF)</label>
                <label className="relative flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-white/10 hover:border-sky-500/40 hover:bg-sky-500/5 transition-all cursor-pointer">
                  <input required type="file" accept=".pdf"
                    onChange={(e) => setFormData({ ...formData, resume: e.target.files[0] })}
                    className="absolute inset-0 opacity-0 cursor-pointer" />
                  <FileText className="w-5 h-5 text-slate-500 shrink-0" />
                  <span className="text-xs font-bold text-slate-500">
                    {formData.resume ? formData.resume.name : 'Click to upload PDF'}
                  </span>
                </label>
              </div>

              {/* Message */}
              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Cover Note (optional)</label>
                <textarea
                  rows={3}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Why are you a good fit for this role?"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500/50 outline-none transition-all resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={submitting}
                  className="flex-1 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-sky-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Referrals;
