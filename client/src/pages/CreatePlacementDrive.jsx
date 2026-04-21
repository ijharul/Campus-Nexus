import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  Building2, Briefcase, FileText, Calendar, 
  Target, Plus, X, ArrowLeft 
} from 'lucide-react';

const CreatePlacementDrive = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    role: '',
    description: '',
    deadline: '',
    minCGPA: '',
    skills: '',
    branches: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        eligibility: {
          minCGPA: Number(formData.minCGPA),
          skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
          branches: formData.branches.split(',').map(b => b.trim()).filter(b => b),
        }
      };

      await api.post('/drives', payload);
      toast.success('Placement drive created successfully!');
      navigate('/admin/drives');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create drive');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-xs font-bold uppercase tracking-widest">Back to Management</span>
      </button>

      <div className="space-y-2 mb-10">
        <h1 className="text-4xl font-black text-white tracking-tight">
          Create <span className="text-sky-400">Placement Drive</span>
        </h1>
        <p className="text-slate-400 text-sm font-medium">Launch a new recruitment opportunity for your students.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="p-8 rounded-[2rem] bg-slate-900/50 border border-white/5 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center border border-sky-500/20">
              <Building2 className="w-5 h-5 text-sky-400" />
            </div>
            <h3 className="text-lg font-black text-white tracking-tight">Company Details</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Company Name</label>
              <input
                required
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="e.g. Google"
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:ring-2 focus:ring-sky-500/40 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Job Role</label>
              <input
                required
                name="role"
                value={formData.role}
                onChange={handleChange}
                placeholder="e.g. Software Engineer"
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:ring-2 focus:ring-sky-500/40 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Job Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Detail the responsibilities, perks, and expectations..."
              className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:ring-2 focus:ring-sky-500/40 outline-none transition-all resize-none"
            />
          </div>
        </div>

        {/* Eligibility */}
        <div className="p-8 rounded-[2rem] bg-slate-900/50 border border-white/5 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <Target className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-lg font-black text-white tracking-tight">Eligibility Criteria</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Minimum CGPA</label>
              <input
                type="number"
                step="0.1"
                name="minCGPA"
                value={formData.minCGPA}
                onChange={handleChange}
                placeholder="e.g. 7.5"
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:ring-2 focus:ring-sky-500/40 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Deadline</label>
              <input
                required
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:ring-2 focus:ring-sky-500/40 outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Target Branches (comma separated)</label>
              <input
                name="branches"
                value={formData.branches}
                onChange={handleChange}
                placeholder="CS, IT, EC, ME"
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:ring-2 focus:ring-sky-500/40 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Required Skills (comma separated)</label>
              <input
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="React, Node.js, Python"
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:ring-2 focus:ring-sky-500/40 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-8 py-4 rounded-2xl bg-white/5 text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-12 py-4 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-sky-500/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Launch Drive
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePlacementDrive;
