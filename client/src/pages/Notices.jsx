import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  Bell, Inbox, Loader2, ArrowRight, Zap, Plus, X, Clock,
  Megaphone, Calendar, Briefcase, Star,
} from 'lucide-react';

/* ── Type config ─────────────────────────────────────────────────────────── */
const typeConfig = {
  Announcement: {
    badge:  'bg-sky-500/10 text-sky-400 border-sky-500/25',
    accent: 'from-sky-500 to-sky-400',
    icon:   Megaphone,
    dot:    'bg-sky-500',
  },
  Event: {
    badge:  'bg-violet-500/10 text-violet-400 border-violet-500/25',
    accent: 'from-violet-500 to-purple-400',
    icon:   Calendar,
    dot:    'bg-violet-500',
  },
  Opportunity: {
    badge:  'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
    accent: 'from-emerald-500 to-teal-400',
    icon:   Briefcase,
    dot:    'bg-emerald-500',
  },
  default: {
    badge:  'bg-amber-500/10 text-amber-400 border-amber-500/25',
    accent: 'from-amber-500 to-orange-400',
    icon:   Star,
    dot:    'bg-amber-500',
  },
};

/* ── Notice Card ─────────────────────────────────────────────────────────── */
const NoticeCard = ({ n, user, isAlumni, onDelete }) => {
  const cfg  = typeConfig[n.type] || typeConfig.default;
  const Icon = cfg.icon;

  return (
    <div className="group relative flex flex-col rounded-2xl border border-white/[0.07] bg-slate-900/60 overflow-hidden hover:border-white/[0.14] hover:-translate-y-0.5 transition-all duration-300">
      {/* Coloured top accent */}
      <div className={`h-0.5 bg-gradient-to-r ${cfg.accent}`} />

      <div className="p-5 flex-1">
        {/* Badge + date row */}
        <div className="flex items-center justify-between mb-4">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-black uppercase rounded-lg tracking-widest border ${cfg.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {n.type}
          </span>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold">
            <Clock className="w-3 h-3" />
            {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        </div>

        {/* Title */}
        <h4 className="text-base font-black text-white tracking-tight mb-2 leading-snug group-hover:text-sky-400 transition-colors">
          {n.title}
        </h4>

        {/* Content */}
        <p className="text-sm text-slate-400 font-medium leading-relaxed">
          {n.content}
        </p>

        {/* External link */}
        {n.externalLink && (
          <a
            href={n.externalLink} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1.5 mt-4 text-[10px] font-bold text-sky-400 hover:text-sky-300 transition-colors uppercase tracking-widest"
          >
            Learn More <ArrowRight className="w-3 h-3" />
          </a>
        )}
      </div>

      {/* Footer — author + delete, same bg as card */}
      <div className="px-5 py-3.5 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center text-[11px] font-black text-white shrink-0">
            {n.authorName?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <p className="text-[10px] font-black text-white uppercase leading-none">{n.authorName}</p>
            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{n.authorRole}</p>
          </div>
        </div>

        {n.authorId === user._id && isAlumni && (
          <button
            onClick={() => onDelete(n._id)}
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-all flex items-center justify-center"
            title="Delete notice"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

/* ── Main Component ──────────────────────────────────────────────────────── */
const Notices = () => {
  const { user } = useContext(AuthContext);
  const [notices, setNotices]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [form, setForm]                 = useState({ title: '', content: '', type: 'Announcement' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAlumni = user?.role === 'alumni';
  const canPost = (user?.role === 'alumni' && user?.verificationStatus === 'verified') || ['collegeAdmin', 'superAdmin'].includes(user?.role);

  const fetchNotices = async () => {
    try {
      const { data } = await api.get('/notices');
      setNotices(data);
    } catch {
      toast.error('Unable to load notices.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotices(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.content) return;
    setIsSubmitting(true);
    try {
      await api.post('/notices', form);
      toast.success('Notice published!');
      setForm({ title: '', content: '', type: 'Announcement' });
      fetchNotices();
    } catch {
      toast.error('Failed to publish.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/notices/${id}`);
      fetchNotices();
      toast.success('Notice deleted.');
    } catch {
      toast.error('Action restricted.');
    }
  };

  return (
    <div className="space-y-8 pb-16 animate-in fade-in slide-in-from-bottom-6 duration-700">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 bg-amber-500/10 text-amber-400 text-[9px] font-black uppercase rounded-xl border border-amber-500/20 tracking-widest flex items-center gap-1.5">
              <Bell className="w-3 h-3" /> Notices
            </div>
            {notices.length > 0 && (
              <span className="px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[9px] font-black">
                {notices.length} Active
              </span>
            )}
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-none">
            Institution <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">Notices</span>
          </h1>
          <p className="text-slate-400 text-sm font-medium">
            Stay updated with campus announcements and critical updates.
          </p>
        </div>
      </div>

      <div className={`grid grid-cols-1 ${canPost ? 'lg:grid-cols-12' : ''} gap-8`}>

        {/* ── Post Form (Alumni & Admin Only) ── */}
        {canPost && (
          <div className="lg:col-span-4">
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-white/[0.07] bg-slate-900/60 p-6 space-y-4 sticky top-6"
            >
              {/* Form header */}
              <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                <div className="w-8 h-8 rounded-xl bg-sky-500 flex items-center justify-center shrink-0">
                  <Plus className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-tight leading-none">Post Notice</h4>
                  <p className="text-[9px] text-slate-500 font-bold mt-0.5">Broadcast to all students</p>
                </div>
              </div>

              {/* Type select */}
              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500/50 outline-none transition-all appearance-none"
                >
                  <option value="Announcement" className="bg-slate-900">📢 Announcement</option>
                  <option value="Event" className="bg-slate-900">📅 Event</option>
                  <option value="Opportunity" className="bg-slate-900">💼 Opportunity</option>
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Title</label>
                <input
                  type="text"
                  placeholder="Notice headline..."
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500/50 outline-none transition-all"
                />
              </div>

              {/* Content */}
              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Message</label>
                <textarea
                  placeholder="Write the notice details here..."
                  rows={5}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500/50 outline-none transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-sky-500/20 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <><Zap className="w-3.5 h-3.5" /> Publish</>
                }
              </button>
            </form>
          </div>
        )}

        {/* ── Notices List ── */}
        <div className={canPost ? 'lg:col-span-8' : ''}>
          {loading ? (
            <div className={`grid grid-cols-1 ${!canPost ? 'md:grid-cols-2' : ''} gap-4`}>
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 rounded-2xl bg-slate-900/60 border border-white/5 animate-pulse" />
              ))}
            </div>
          ) : notices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-28 rounded-2xl border border-dashed border-white/10 bg-slate-900/30">
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-4 border border-white/5">
                <Inbox className="w-7 h-7 text-slate-600" />
              </div>
              <h3 className="text-lg font-black text-slate-500 mb-1">No Notices Yet</h3>
              <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">
                {canPost ? 'Post the first notice using the form' : 'Check back later for updates'}
              </p>
            </div>
          ) : (
            <div className={`grid grid-cols-1 ${!canPost ? 'md:grid-cols-2' : ''} gap-4`}>
              {notices.map((n) => (
                <NoticeCard
                  key={n._id}
                  n={n}
                  user={user}
                  isAlumni={isAlumni}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notices;
