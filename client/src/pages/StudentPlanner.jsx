import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { AuthContext } from '../contexts/AuthContext';
import { 
  Target, CheckCircle2, ChevronRight, Play, 
  Trash2, Plus, Calendar, Clock, Loader2, Award, Zap, BarChart, Flag
} from 'lucide-react';

export default function StudentPlanner() {
  const { user } = useContext(AuthContext);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [busyId, setBusyId] = useState(null);
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    targetDate: ''
  });

  const fetchGoals = async () => {
    try {
      const { data } = await api.get('/goals');
      setGoals(data);
    } catch (error) {
      toast.error('Unable to synchronize target milestones.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGoals(); }, []);

  const createGoal = async (e) => {
    e.preventDefault();
    setBusyId('create');
    try {
      await api.post('/goals', form);
      toast.success('Career target locked and stored.');
      setShowForm(false);
      setForm({ title: '', description: '', targetDate: '' });
      fetchGoals();
    } catch {
      toast.error('Failed to set target.');
    } finally { setBusyId(null); }
  };

  const updateGoalStatus = async (id, status) => {
    setBusyId(id);
    try {
      await api.put(`/goals/${id}`, { status });
      toast.success('Milestone progress advanced!');
      fetchGoals();
    } catch { toast.error('Action failed.'); } 
    finally { setBusyId(null); }
  };

  const deleteGoal = async (id) => {
    if(!window.confirm('Delete this career blueprint node?')) return;
    setBusyId(id);
    try {
      await api.delete(`/goals/${id}`);
      toast.success('Target neutralized from database.');
      fetchGoals();
    } catch { toast.error('Termination failed.'); } 
    finally { setBusyId(null); }
  };

  if (user?.role !== 'student') return null;

  const total = goals.length;
  const completed = goals.filter(g => g.status === 'completed').length;
  const metrics = Math.round(total === 0 ? 0 : (completed / total) * 100);

  const pendingGoals = goals.filter(g => g.status === 'pending');
  const inProgressGoals = goals.filter(g => g.status === 'in-progress');
  const completedGoals = goals.filter(g => g.status === 'completed');

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center animate-pulse">
        <Target className="w-6 h-6 text-sky-500" />
      </div>
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest animate-pulse">Syncing Pathway...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-12 px-6 lg:px-8 w-full animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* ── Header ── */}
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 bg-white/5 rounded-lg border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-300">
            <Flag className="w-3.5 h-3.5 text-sky-400" /> Blueprint Engine
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight flex items-center gap-3 leading-none mb-4">
             Career <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500">Pathway</span>
          </h2>
          <p className="text-slate-400 text-sm font-medium max-w-xl">
            Log actionable advice from your mentors and track milestone progression via a dynamic Kanban pipeline.
          </p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="px-8 py-3.5 shrink-0 bg-sky-500 hover:bg-sky-600 active:scale-95 text-white text-[10px] uppercase font-black tracking-widest rounded-xl transition-all shadow-xl shadow-sky-500/20 flex items-center justify-center gap-2"
        >
          {showForm ? 'Close Engine' : <><Plus className="w-4 h-4"/> Initialize Target</>}
        </button>
      </div>

      {/* ── Neural Analytics HUD ── */}
      <div className="bg-slate-900/60 rounded-[2rem] p-8 md:p-10 mb-12 border border-white/[0.05] flex flex-col md:flex-row items-center gap-12 relative overflow-hidden">
         <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none">
           <BarChart className="w-64 h-64" />
         </div>
         
         <div className="relative w-40 h-40 shrink-0 z-10">
             <svg className="w-full h-full transform -rotate-90 scale-110">
               <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-slate-800" />
               <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray={440} strokeDashoffset={440 - (440 * metrics) / 100} strokeLinecap="round" className="text-sky-500 drop-shadow-[0_0_10px_rgba(14,165,233,0.5)] transition-all duration-1000 ease-out" />
             </svg>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
               <span className="text-4xl font-black text-white leading-none mb-1">{metrics}%</span>
               <span className="text-[9px] font-black text-sky-500 uppercase tracking-widest">Achieved</span>
             </div>
         </div>
         
         <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 w-full z-10">
            {[
              { label: 'Mapped Goals', val: total, color: 'text-slate-300', bg: 'bg-white/5', border: 'border-white/10' },
              { label: 'Pending', val: pendingGoals.length, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
              { label: 'In Execution', val: inProgressGoals.length, color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20' },
              { label: 'Completed', val: completed, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' }
            ].map(stat => (
              <div key={stat.label} className={`p-6 rounded-2xl ${stat.bg} border ${stat.border} text-center flex flex-col justify-center items-center shadow-inner`}>
                  <p className={`text-4xl font-black ${stat.color} mb-1 tracking-tighter`}>{stat.val}</p>
                  <p className="text-[9px] uppercase font-black text-white/50 tracking-widest">{stat.label}</p>
              </div>
            ))}
         </div>
      </div>

      {/* ── Form Entry ── */}
      {showForm && (
        <form onSubmit={createGoal} className="bg-slate-900 border border-white/10 rounded-[2rem] p-8 md:p-10 mb-12 shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Milestone Header</label>
              <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Master React Hooks" className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-4 text-sm font-bold text-white placeholder:text-slate-600 focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 outline-none transition-all" />
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Execution Plan (Description)</label>
              <textarea required value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Break down exactly what needs to be done based on mentor feedback..." className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-4 text-sm font-medium text-white placeholder:text-slate-600 focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 outline-none transition-all min-h-[120px]" />
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Target Deadline</label>
              <input required type="date" value={form.targetDate} onChange={e => setForm({...form, targetDate: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3.5 text-sm font-bold text-white placeholder:text-slate-600 focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 outline-none transition-all [color-scheme:dark]" />
            </div>
          </div>
          <button type="submit" disabled={busyId === 'create'} className="w-full py-4 bg-sky-500 hover:bg-sky-600 active:scale-95 rounded-xl shadow-xl shadow-sky-500/20 text-[10px] font-black text-white uppercase tracking-widest flex justify-center items-center transition-all">
            {busyId === 'create' ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Lock Execution Target'}
          </button>
        </form>
      )}

      {/* ── Kanban Board Layout ── */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* Column: Pending */}
        <div className="flex-1 w-full bg-slate-900/40 border border-white/5 rounded-[2rem] p-4 flex flex-col gap-4">
           <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)] animate-pulse" /> Pending Sync</h3>
              <span className="bg-white/5 px-2 py-0.5 rounded text-[10px] font-black text-slate-400 tabular-nums">{pendingGoals.length}</span>
           </div>
           {pendingGoals.length === 0 && <div className="py-12 text-center opacity-30"><Target className="w-8 h-8 text-slate-500 mx-auto mb-2" /><p className="text-[9px] uppercase font-black tracking-widest">Empty</p></div>}
           {pendingGoals.map(goal => <GoalCard key={goal._id} goal={goal} busyId={busyId} updateGoalStatus={updateGoalStatus} deleteGoal={deleteGoal} />)}
        </div>

        {/* Column: In Progress */}
        <div className="flex-1 w-full bg-slate-900/60 border border-sky-500/10 rounded-[2rem] p-4 flex flex-col gap-4 relative overflow-hidden">
           <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-sky-500/50 to-transparent" />
           <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-xs font-black text-sky-400 uppercase tracking-widest flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.6)] animate-pulse" /> In Execution</h3>
              <span className="bg-sky-500/10 px-2 py-0.5 rounded text-[10px] font-black text-sky-400 tabular-nums">{inProgressGoals.length}</span>
           </div>
           {inProgressGoals.length === 0 && <div className="py-12 text-center opacity-30"><Play className="w-8 h-8 text-slate-500 mx-auto mb-2" /><p className="text-[9px] uppercase font-black tracking-widest">Empty</p></div>}
           {inProgressGoals.map(goal => <GoalCard key={goal._id} goal={goal} busyId={busyId} updateGoalStatus={updateGoalStatus} deleteGoal={deleteGoal} />)}
        </div>

        {/* Column: Completed */}
        <div className="flex-1 w-full bg-slate-900/40 border border-white/5 rounded-[2rem] p-4 flex flex-col gap-4">
           <div className="px-4 py-3 border-b border-emerald-500/10 flex items-center justify-between">
              <h3 className="text-xs font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" /> Achieved</h3>
              <span className="bg-emerald-500/10 px-2 py-0.5 rounded text-[10px] font-black text-emerald-500 tabular-nums">{completedGoals.length}</span>
           </div>
           {completedGoals.length === 0 && <div className="py-12 text-center opacity-30"><Award className="w-8 h-8 text-slate-500 mx-auto mb-2" /><p className="text-[9px] uppercase font-black tracking-widest">Empty</p></div>}
           {completedGoals.map(goal => <GoalCard key={goal._id} goal={goal} busyId={busyId} updateGoalStatus={updateGoalStatus} deleteGoal={deleteGoal} />)}
        </div>

      </div>
    </div>
  );
}

/* ── Goal Card Component for Kanban Board ── */
function GoalCard({ goal, busyId, updateGoalStatus, deleteGoal }) {
  const isOverdue = goal.status !== 'completed' && new Date(goal.targetDate) < new Date();
  
  return (
    <div className="bg-slate-950/50 border border-white/5 p-5 rounded-2xl group hover:border-white/10 transition-all hover:shadow-xl relative overflow-hidden flex flex-col gap-4">
      {goal.status === 'completed' && <div className="absolute inset-0 bg-emerald-900/5 pointer-events-none" />}
      
      <div>
        <div className="flex items-center justify-between mb-3">
           <span className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest ${isOverdue ? 'text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20' : 'text-slate-500'}`}>
               <Calendar className="w-3 h-3" /> {new Date(goal.targetDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
               {isOverdue && ' (Overdue)'}
           </span>
           {goal.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
        </div>
        <h4 className={`text-base font-black tracking-tight leading-snug mb-2 ${goal.status === 'completed' ? 'text-slate-400 line-through' : 'text-white'}`}>
          {goal.title}
        </h4>
        <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-3">
          {goal.description}
        </p>
      </div>

      {goal.mentorNotes && (
        <div className="bg-sky-500/10 border border-sky-500/20 p-3 rounded-xl mt-auto">
          <p className="text-[8px] font-black text-sky-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Zap className="w-3 h-3" /> Mentor Intel</p>
          <p className="text-xs text-sky-200/80 italic font-medium leading-relaxed truncate">"{goal.mentorNotes}"</p>
        </div>
      )}

      {/* Action Strip */}
      <div className="flex gap-2 pt-3 border-t border-white/5 mt-auto opacity-0 group-hover:opacity-100 transition-opacity">
         {goal.status === 'pending' && (
           <button onClick={() => updateGoalStatus(goal._id, 'in-progress')} disabled={busyId === goal._id} className="flex-1 py-1.5 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 rounded-lg outline-none flex justify-center items-center">
              {busyId === goal._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
           </button>
         )}
         {goal.status === 'in-progress' && (
           <button onClick={() => updateGoalStatus(goal._id, 'completed')} disabled={busyId === goal._id} className="flex-1 py-1.5 bg-emerald-500 text-white rounded-lg outline-none flex justify-center items-center shadow-lg shadow-emerald-500/20 active:scale-95">
              {busyId === goal._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
           </button>
         )}
         <button onClick={() => deleteGoal(goal._id)} disabled={busyId === goal._id} className="w-10 flex-shrink-0 flex items-center justify-center py-1.5 bg-slate-900 border border-white/10 hover:border-rose-500/50 hover:bg-rose-500/10 rounded-lg text-slate-400 hover:text-rose-400 transition-colors">
            {busyId === goal._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
         </button>
      </div>

    </div>
  );
}
