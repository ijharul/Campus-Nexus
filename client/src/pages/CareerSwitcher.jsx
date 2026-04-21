import { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  Shuffle, 
  Target, 
  Sparkles, 
  ArrowRight, 
  Zap, 
  Brain, 
  MapPin, 
  Briefcase,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  Clock,
  Loader2
} from 'lucide-react';

const CareerSwitcher = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({
        currentRole: '',
        targetRole: '',
        yearsOfExperience: ''
    });
    const [result, setResult] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!data.currentRole || !data.targetRole) {
            return toast.error('Please fill in both roles.');
        }

        setLoading(true);
        try {
            const res = await api.post('/ai/career-switch', data);
            setResult(res.data);
            toast.success('Transition analysis complete!');
        } catch (err) {
            const isApiKeyError = err.response?.status === 500 || err.response?.status === 401 || err.response?.status === 403;
            const errorMsg = isApiKeyError 
                ? "AI Engine is currently offline (API key unavailable). System update in progress — please try again later."
                : (err.response?.data?.message || 'AI Engine offline.');
            
            toast.error(errorMsg, {
                duration: 5000,
                icon: '⚠️'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-20 space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/40 p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                    <Shuffle className="w-64 h-64" />
                </div>
                <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/30">
                            <Shuffle className="w-6 h-6" />
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tight">Career <span className="text-indigo-400">Switcher</span></h1>
                    </div>
                    <p className="text-slate-400 font-medium max-w-xl">
                        Planning a major career jump? Our AI analyzed thousands of successful career transitions to help you find your bridge.
                    </p>
                </div>
                <div className="relative z-10 flex flex-col items-center justify-center px-8 py-4 bg-white/5 rounded-3xl border border-white/10">
                    <div className="text-3xl font-black text-white">2 <Zap className="inline w-5 h-5 text-amber-400 fill-current" /></div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Cost Per Analysis</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Input Panel */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-white/5 space-y-6">
                        <h2 className="text-xl font-black text-white flex items-center gap-2">
                            <Target className="w-5 h-5 text-sky-400" /> Transition Map
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Current Role</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Sales Executive"
                                    value={data.currentRole}
                                    onChange={(e) => setData({...data, currentRole: e.target.value})}
                                    className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-slate-600 outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Target Role</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Data Analyst"
                                    value={data.targetRole}
                                    onChange={(e) => setData({...data, targetRole: e.target.value})}
                                    className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-slate-600 outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Years of Experience</label>
                                <input 
                                    type="number" 
                                    placeholder="e.g. 3"
                                    value={data.yearsOfExperience}
                                    onChange={(e) => setData({...data, yearsOfExperience: e.target.value})}
                                    className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-slate-600 outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
                                />
                            </div>
                            <button 
                                disabled={loading}
                                className="w-full py-5 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-indigo-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                                {loading ? 'Analyzing Path...' : 'Launch AI Analysis'}
                            </button>
                        </form>
                    </div>

                    <div className="bg-indigo-500/5 p-6 rounded-3xl border border-indigo-500/10">
                        <div className="flex items-center gap-3 mb-4">
                            <Brain className="w-5 h-5 text-indigo-400" />
                            <h3 className="text-sm font-black text-white uppercase tracking-tight">Why Career Switcher?</h3>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed font-medium">
                            Our AI identifies "Bridge Skills"—hidden overlaps in your current background that make you a strong candidate for roles in entirely different industries.
                        </p>
                    </div>
                </div>

                {/* Result Panel */}
                <div className="lg:col-span-7">
                    {result ? (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
                            {/* Score Card */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-900/40 p-6 rounded-3xl border border-white/5">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Difficulty</p>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${result.difficultyLevel === 'Easy' ? 'bg-emerald-500' : result.difficultyLevel === 'Medium' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                                        <p className="text-xl font-black text-white">{result.difficultyLevel}</p>
                                    </div>
                                </div>
                                <div className="bg-slate-900/40 p-6 rounded-3xl border border-white/5">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Est. Timeline</p>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-sky-400" />
                                        <p className="text-xl font-black text-white">{result.estimatedTimeline}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Transferable Skills */}
                            <div className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-white/5">
                                <h3 className="text-lg font-black text-white mb-6 flex items-center gap-3">
                                    <TrendingUp className="w-5 h-5 text-emerald-400" /> Transferable Bridge Skills
                                </h3>
                                <div className="flex flex-wrap gap-3">
                                    {result.transferableSkills?.map((skill, i) => (
                                        <span key={i} className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-2">
                                            <ShieldCheck className="w-3.5 h-3.5" /> {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Transition Plan */}
                            <div className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-white/5">
                                <h3 className="text-lg font-black text-white mb-8 flex items-center gap-3">
                                    <MapPin className="w-5 h-5 text-sky-400" /> Step-by-Step Transition
                                </h3>
                                <div className="space-y-6">
                                    {result.bridgeSteps?.map((step, i) => (
                                        <div key={i} className="flex gap-5 group">
                                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 text-sm font-black group-hover:bg-sky-500 group-hover:text-white transition-all">
                                                {i + 1}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-black text-white text-base">{step.step}</h4>
                                                <p className="text-slate-400 text-sm mt-1 font-medium leading-relaxed">{step.detail}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Industry Insights */}
                            <div className="p-8 rounded-[2.5rem] bg-indigo-500/10 border border-indigo-500/20">
                                <h3 className="text-sm font-black text-indigo-400 uppercase tracking-widest mb-4">Industry Insights</h3>
                                <p className="text-slate-300 text-sm leading-relaxed font-medium italic">
                                    "{result.industryInsights}"
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-20 px-10 bg-slate-900/20 rounded-[2.5rem] border border-dashed border-white/10 opacity-60">
                            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                                <Sparkles className="w-10 h-10 text-slate-700" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black text-white">Ready for a new chapter?</h3>
                                <p className="text-slate-500 text-sm font-medium max-w-xs">Fill in your career details to generate a customized AI transition blueprint.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CareerSwitcher;
