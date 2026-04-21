import { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import {
  Brain, FileText, Map, Target, Zap, ArrowRight, Sparkles,
  Upload, Check, AlertCircle, ChevronRight, Loader2, BookOpen,
  TrendingUp, Award,
} from 'lucide-react';

/* ─────── shared ─────────────────────────────────────────────────────────── */
const INPUT = 'w-full bg-slate-950/50 border border-white/10 rounded-xl px-5 py-4 text-sm font-medium text-white placeholder-slate-500 focus:ring-1 focus:ring-sky-500/50 focus:border-sky-500/50 outline-none transition-all resize-none';
const LBL   = 'text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 block';

/* ─────── tool definitions ───────────────────────────────────────────────── */
const TOOLS = [
  {
    id: 'resume',
    label: 'Resume Review',
    desc: 'AI feedback on your resume',
    icon: FileText,
    cost: '10 tokens',
    from: 'from-sky-500',  to: 'to-cyan-400',
    ring: 'ring-sky-500/30',
    btn:  'bg-sky-500 hover:bg-sky-600 shadow-sky-500/25',
    features: ['ATS score check', 'Keyword optimization', 'Structure feedback'],
  },
  {
    id: 'roadmap',
    label: 'Career Roadmap',
    desc: 'Step-by-step path to your goal',
    icon: Map,
    cost: '5 tokens',
    from: 'from-indigo-500', to: 'to-violet-400',
    ring: 'ring-indigo-500/30',
    btn:  'bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/25',
    features: ['Custom timeline', 'Skill requirements', 'Resources'],
  },
  {
    id: 'skills',
    label: 'Skill Gap',
    desc: "Find what's missing",
    icon: Target,
    cost: '5 tokens',
    from: 'from-emerald-500', to: 'to-teal-400',
    ring: 'ring-emerald-500/30',
    btn:  'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/25',
    features: ['Gap identification', 'Priority ranking', 'Learning plan'],
  },
];

/* ─────── result section ─────────────────────────────────────────────────── */
const RES_MAP = {
  green:  { bg: 'bg-emerald-500/5',  border: 'border-emerald-500/20', lbl: 'text-emerald-400', dot: 'bg-emerald-400' },
  amber:  { bg: 'bg-amber-500/5',    border: 'border-amber-500/20',   lbl: 'text-amber-400',   dot: 'bg-amber-400' },
  sky:    { bg: 'bg-sky-500/5',      border: 'border-sky-500/20',     lbl: 'text-sky-400',     dot: 'bg-sky-400' },
  rose:   { bg: 'bg-rose-500/5',     border: 'border-rose-500/20',    lbl: 'text-rose-400',    dot: 'bg-rose-400' },
  indigo: { bg: 'bg-indigo-500/5',   border: 'border-indigo-500/20',  lbl: 'text-indigo-400',  dot: 'bg-indigo-400' },
  slate:  { bg: 'bg-white/[0.03]',   border: 'border-white/10',       lbl: 'text-slate-400',   dot: 'bg-slate-500' },
};

const Res = ({ title, color, children }) => {
  const c = RES_MAP[color] || RES_MAP.slate;
  return (
    <div className={`rounded-xl border p-6 transition-all shadow-sm ${c.bg} ${c.border}`}>
      <p className={`text-[10px] font-black uppercase tracking-widest mb-5 flex items-center gap-2 ${c.lbl}`}>
        <span className={`w-2 h-2 rounded-full inline-block ${c.dot}`} />
        {title}
      </p>
      {children}
    </div>
  );
};

/* ─────── main ───────────────────────────────────────────────────────────── */
export default function NexusIQ() {
  const [active,        setActive]        = useState('resume');
  const [loading,       setLoading]       = useState(false);
  const [resumeText,    setResumeText]    = useState('');
  const [resumeFile,    setResumeFile]    = useState(null);
  const [careerGoal,    setCareerGoal]    = useState('');
  const [skillsData,    setSkillsData]    = useState({ current: '', target: '' });
  const [resumeResult,  setResumeResult]  = useState(null);
  const [roadmapResult, setRoadmapResult] = useState(null);
  const [skillsResult,  setSkillsResult]  = useState(null);

  const tool = TOOLS.find(t => t.id === active);

  const callAI = async (endpoint, payload, setter) => {
    setLoading(true);
    try {
      let body = payload;
      if (payload.resumeFile) {
        body = new FormData();
        Object.keys(payload).forEach(k =>
          body.append(k === 'resumeFile' ? 'resume' : k, payload[k])
        );
      }
      const { data } = await api.post(`/ai/${endpoint}`, body);
      setter(data);
      toast.success('Analysis complete!');
    } catch (err) {
      const isApiKeyError = err.response?.status === 500 || err.response?.status === 401 || err.response?.status === 403;
      const errorMsg = isApiKeyError 
        ? "AI Engine is currently offline (API key unavailable). System update in progress — please try again later."
        : (err.response?.data?.message || 'AI request failed.');
      
      toast.error(errorMsg, {
        duration: 5000,
        icon: '⚠️'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-16 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── Header row ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/30">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-2xl font-black text-white tracking-tight leading-none">
                Nexus <span className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">IQ</span>
              </h1>
              <div className="px-2.5 py-1 bg-sky-500/10 border border-sky-500/20 rounded-full text-sky-400 text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> Gemini
              </div>
            </div>
            <p className="text-slate-500 text-xs font-medium">AI-powered career tools for students</p>
          </div>
        </div>
        <Link to="/pricing"
          className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-sky-400 hover:border-sky-500/30 transition-all text-[9px] font-black uppercase tracking-widest">
          <Zap className="w-3 h-3 fill-current" /> Get Tokens
        </Link>
      </div>

      {/* ── 3 Tool Picker Cards (horizontal) ── */}
      <div className="grid grid-cols-3 gap-3">
        {TOOLS.map(t => {
          const Icon = t.icon;
          const isActive = active === t.id;
          return (
            <button key={t.id} onClick={() => setActive(t.id)}
              className={`relative text-left p-5 rounded-2xl border transition-all duration-300 overflow-hidden group
                ${isActive
                  ? `bg-gradient-to-br ${t.from} ${t.to} border-transparent ring-2 ${t.ring} shadow-xl scale-[1.01]`
                  : 'bg-slate-900/50 border-white/[0.07] hover:bg-slate-800/70 hover:border-white/[0.14] hover:-translate-y-0.5'
                }`}
            >
              {/* icon */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all
                ${isActive ? 'bg-white/20 shadow-inner' : 'bg-white/5 group-hover:bg-white/10'}`}>
                <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
              </div>
              <p className={`text-lg font-black leading-tight mb-1 ${isActive ? 'text-white' : 'text-slate-300'}`}>
                {t.label}
              </p>
              <p className={`text-xs font-semibold ${isActive ? 'text-white/80' : 'text-slate-500'}`}>
                {t.desc}
              </p>
              {/* cost tag */}
              <div className={`absolute top-4 right-4 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest shadow-sm
                ${isActive ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-500'}`}>
                {t.cost}
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Active Panel ── */}
      <div className="rounded-2xl border border-white/[0.08] bg-slate-900/50 overflow-hidden">

        {/* Panel header strip */}
        <div className={`h-[3px] bg-gradient-to-r ${tool.from} ${tool.to} transition-all duration-500`} />

        <div className="p-7 space-y-6">

          {/* Section label */}
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tool.from} ${tool.to} flex items-center justify-center shadow-lg`}>
              <tool.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white leading-tight">{tool.label}</h2>
              <p className="text-xs text-slate-400 font-medium">{tool.desc}</p>
            </div>
            {/* Feature chips */}
            <div className="ml-auto hidden md:flex items-center gap-2">
              {tool.features.map(f => (
                <span key={f} className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[10px] font-black text-slate-400 uppercase tracking-widest shadow-sm">
                  {f}
                </span>
              ))}
            </div>
          </div>

          <div className="border-t border-white/5" />

          {/* ━━ RESUME ━━ */}
          {active === 'resume' && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className={LBL}>Paste resume text</label>
                  <textarea rows={9} value={resumeText}
                    onChange={e => setResumeText(e.target.value)}
                    placeholder="Paste your resume content — summary, experience, education, skills..."
                    className={INPUT} />
                </div>
                <div className="space-y-4">
                  <label className={LBL}>Upload PDF instead</label>
                  <label className="flex flex-col items-center justify-center h-[calc(100%-36px)] min-h-[160px] border-2 border-dashed border-white/[0.06] rounded-xl hover:border-sky-500/40 hover:bg-sky-500/5 bg-slate-950/30 transition-all cursor-pointer relative group">
                    <input type="file" accept=".pdf"
                      onChange={e => setResumeFile(e.target.files[0])}
                      className="absolute inset-0 opacity-0 cursor-pointer" />
                    <Upload className={`w-10 h-10 mb-3 transition-transform group-hover:-translate-y-1 ${resumeFile ? 'text-sky-400' : 'text-slate-600'}`} />
                    <p className="text-sm font-bold text-slate-400 px-4 text-center">
                      {resumeFile ? resumeFile.name : 'Click or drag PDF here'}
                    </p>
                  </label>
                </div>
              </div>
              <button disabled={loading || (!resumeText && !resumeFile)}
                onClick={() => callAI('analyze-resume', { resumeText, resumeFile }, setResumeResult)}
                className={`w-full py-4 rounded-xl text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed ${tool.btn}`}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                {loading ? 'Analyzing...' : 'Analyze My Resume'}
              </button>
              {resumeResult && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-in fade-in duration-400">
                  <Res title="Strengths" color="green">
                    <ul className="space-y-3">
                      {resumeResult.strengths?.map((s, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-slate-300 leading-relaxed font-medium">
                          <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" strokeWidth={3} /> {s}
                        </li>
                      ))}
                    </ul>
                  </Res>
                  <Res title="Improve" color="amber">
                    <ul className="space-y-3">
                      {resumeResult.weaknesses?.map((w, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-slate-300 leading-relaxed font-medium">
                          <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" strokeWidth={2.5} /> {w}
                        </li>
                      ))}
                    </ul>
                  </Res>
                  <Res title="AI Suggestions" color="sky">
                    <ul className="space-y-3">
                      {resumeResult.suggestions?.map((s, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-slate-300 leading-relaxed font-medium">
                          <ChevronRight className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" strokeWidth={3} /> {s}
                        </li>
                      ))}
                    </ul>
                  </Res>
                </div>
              )}
            </div>
          )}

          {/* ━━ ROADMAP ━━ */}
          {active === 'roadmap' && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div>
                <label className={LBL}>Your target role</label>
                <input type="text" value={careerGoal}
                  onChange={e => setCareerGoal(e.target.value)}
                  placeholder="e.g. Senior Software Engineer at a top tech company"
                  className={INPUT} />
              </div>
              <button disabled={loading || !careerGoal}
                onClick={() => callAI('career-roadmap', { goal: careerGoal }, setRoadmapResult)}
                className={`w-full py-4 rounded-xl text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed ${tool.btn}`}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Map className="w-5 h-5" />}
                {loading ? 'Building your roadmap...' : 'Generate My Roadmap'}
              </button>
              {roadmapResult && (
                <div className="space-y-5 animate-in fade-in duration-400">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Res title="Required Skills" color="indigo">
                      <div className="flex flex-wrap gap-2.5">
                        {roadmapResult.requiredSkills?.map((s, i) => (
                          <span key={i} className="px-3 py-1.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-lg text-xs font-bold">{s}</span>
                        ))}
                      </div>
                    </Res>
                    <Res title="Recommended Tools" color="sky">
                      <div className="flex flex-wrap gap-2.5">
                        {roadmapResult.recommendedTechnologies?.map((t, i) => (
                          <span key={i} className="px-3 py-1.5 bg-sky-500/10 text-sky-300 border border-sky-500/20 rounded-lg text-xs font-bold">{t}</span>
                        ))}
                      </div>
                    </Res>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-slate-950/30 p-8">
                    <h4 className="text-base font-black text-white mb-6 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-indigo-400" /> Your Step-by-Step Roadmap
                    </h4>
                    <div className="space-y-6 relative">
                      <div className="absolute left-5 top-0 bottom-0 w-px bg-white/10" />
                      {roadmapResult.roadmap?.map((step, i) => (
                        <div key={i} className="flex gap-5 group">
                          <div className="relative z-10 w-10 h-10 rounded-xl shrink-0 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm font-black group-hover:bg-indigo-500 group-hover:text-white transition-all">
                            {i + 1}
                          </div>
                          <div>
                            <p className="font-black text-white text-base leading-snug">{step.step}</p>
                            <p className="text-slate-400 text-sm mt-1.5 leading-relaxed font-medium">{step.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ━━ SKILL GAP ━━ */}
          {active === 'skills' && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={LBL}>Your current skills</label>
                  <input type="text" value={skillsData.current}
                    onChange={e => setSkillsData({...skillsData, current: e.target.value})}
                    placeholder="React, Python, Node.js, AWS..."
                    className={INPUT} />
                </div>
                <div>
                  <label className={LBL}>Target role</label>
                  <input type="text" value={skillsData.target}
                    onChange={e => setSkillsData({...skillsData, target: e.target.value})}
                    placeholder="Full Stack Developer, ML Engineer..."
                    className={INPUT} />
                </div>
              </div>
              <button disabled={loading || !skillsData.current || !skillsData.target}
                onClick={() => callAI('skills-gap', { currentSkills: skillsData.current.split(',').map(s => s.trim()), targetRole: skillsData.target }, setSkillsResult)}
                className={`w-full py-4 rounded-xl text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed ${tool.btn}`}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Target className="w-5 h-5" />}
                {loading ? 'Analyzing skills...' : 'Run Gap Analysis'}
              </button>
              {skillsResult && (
                <div className="space-y-5 animate-in fade-in duration-400">
                  <Res title="Missing Skills" color="rose">
                    <div className="flex flex-wrap gap-2.5">
                      {skillsResult.missingSkills?.map((s, i) => (
                        <span key={i} className="px-3.5 py-1.5 bg-rose-500/10 text-rose-300 border border-rose-500/20 rounded-lg text-sm font-bold">{s}</span>
                      ))}
                    </div>
                  </Res>
                  <Res title="Learning Priority List" color="sky">
                    <div className="space-y-4">
                      {skillsResult.priorityLearningList?.map((item, i) => (
                        <div key={i} className="flex gap-4 p-4 rounded-xl bg-slate-950/30 border border-white/[0.04]">
                          <span className="w-6 h-6 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[11px] font-black flex items-center justify-center shrink-0">
                            {i + 1}
                          </span>
                          <div>
                            <p className="font-black text-sky-300 text-sm">{item.skill}</p>
                            <p className="text-slate-400 text-xs italic mt-1 font-medium">{item.reason}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Res>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* ── footer nudge ── */}
      <div className="text-center">
        <Link to="/pricing" className="inline-flex items-center gap-2 text-slate-600 hover:text-sky-400 transition-colors text-xs font-bold uppercase tracking-widest">
          <Zap className="w-3 h-3 fill-current" /> Upgrade for more AI credits <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
