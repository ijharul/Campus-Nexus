import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import { AuthContext } from "../contexts/AuthContext";
import {
  Search, Briefcase, GraduationCap, Globe, Building2, Users,
  MessageSquare, Brain, ArrowRight, User, Filter, Sparkles,
  MapPin, Trophy, ChevronRight, UserCheck, Mail
} from "lucide-react";
import ReportModal from "../components/ReportModal";

/* ── User Card ────────────────────────────────────────────────────────────── */
const UserCard = ({ person, onMentorshipRequest, onChatRequest, onReport, onProfileView, currentUser }) => {
  const initials   = person.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  const collegeName = person.collegeId?.name || person.college || null;
  const isAlumni   = person.role === "alumni";

  return (
    <div
      onClick={(e) => { if (!e.target.closest(".card-actions")) onProfileView(person._id); }}
      className="group relative flex flex-col rounded-2xl border border-white/[0.07] bg-slate-900/60 backdrop-blur-xl cursor-pointer overflow-hidden transition-all duration-300 hover:border-sky-500/30 hover:-translate-y-1 hover:shadow-2xl hover:shadow-sky-500/5"
    >
      {/* Top accent line */}
      <div className={`h-0.5 w-full ${isAlumni ? 'bg-gradient-to-r from-sky-500 to-indigo-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'}`} />

      <div className="p-6 flex-1">
        {/* Avatar + badge row */}
        <div className="flex items-start justify-between mb-5">
          {person.profilePicture ? (
            <div className="relative">
              <img src={person.profilePicture} alt={person.name}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-white/10 shadow-xl group-hover:ring-sky-500/30 transition-all" />
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
            </div>
          ) : (
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg group-hover:scale-105 transition-transform ${isAlumni ? 'bg-gradient-to-br from-sky-400 to-indigo-600' : 'bg-gradient-to-br from-emerald-400 to-teal-600'}`}>
              {initials}
            </div>
          )}
          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${isAlumni ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
            {isAlumni ? "Alumni" : "Student"}{person.batch ? ` • ${person.batch}` : ""}
          </span>
        </div>

        {/* Name & role */}
        <h3 className="text-lg font-black text-white tracking-tight leading-tight mb-1">
          {person.name}
        </h3>
        {person.currentRole && (
          <p className="text-[10px] text-sky-400 font-bold uppercase tracking-[0.15em] mb-4">
            {person.currentRole}
          </p>
        )}

        {/* Meta info */}
        <div className="space-y-2 mb-4">
          {person.company && (
            <div className="flex items-center gap-2.5 text-xs text-slate-400 font-medium">
              <Briefcase className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">{person.company}</span>
            </div>
          )}
          {collegeName && (
            <div className="flex items-center gap-2.5 text-xs text-slate-500 font-medium">
              <Building2 className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <span className="truncate opacity-70">{collegeName}</span>
            </div>
          )}
        </div>

        {/* Skills */}
        {person.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {person.skills.slice(0, 3).map((skill, i) => (
              <span key={i} className="px-2.5 py-1 rounded-md text-[9px] font-bold uppercase bg-white/5 text-slate-500 border border-white/5 tracking-wider">
                {skill}
              </span>
            ))}
            {person.skills.length > 3 && (
              <span className="px-2.5 py-1 rounded-md text-[9px] font-bold uppercase bg-white/5 text-slate-600 border border-white/5">
                +{person.skills.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Actions footer */}
      <div className="card-actions px-5 py-4 border-t border-white/5 flex items-center gap-2.5">
        <button
          onClick={() => onProfileView(person._id)}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-white/5"
          title="View profile"
        >
          <User className="w-4 h-4" />
        </button>

        {currentUser?.role === "student" && person.role === "alumni" && (
          <button
            onClick={() => onMentorshipRequest(person._id)}
            className="flex-1 py-2.5 px-3 text-[9px] font-black uppercase tracking-widest rounded-xl bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <UserCheck className="w-3.5 h-3.5" /> Connect
          </button>
        )}

        {currentUser?.role === 'alumni' && person.role === 'student' && (
          <button
            onClick={() => onChatRequest(person._id)}
            className="flex-1 py-2.5 px-3 text-[9px] font-black uppercase tracking-widest rounded-xl bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5" /> Scout Talent
          </button>
        )}

        {currentUser?.role !== "student" && person.role === 'alumni' && (
          <button
            onClick={() => onProfileView(person._id)}
            className="flex-1 py-2.5 px-3 text-[9px] font-black uppercase tracking-widest rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 transition-all flex items-center justify-center gap-1.5"
          >
            View Professional Profile <ChevronRight className="w-3 h-3" />
          </button>
        )}

        {currentUser?.role === 'student' && (
          <button
            onClick={() => onChatRequest(person._id)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 transition-all border border-white/5"
            title="Chat"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        )}

        <a
          href={`mailto:${person.email}`}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all border border-white/5"
          title="Direct Email"
        >
          <Mail className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};

/* ── Main Directory Component ─────────────────────────────────────────────── */
const Directory = () => {
  const { user }      = useContext(AuthContext);
  const navigate      = useNavigate();
  const [users, setUsers]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [isGlobal, setIsGlobal]       = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters]         = useState({ company: "", skills: "", role: "" });
  const [reportTarget, setReportTarget] = useState(null);

  // fetchUsers accepts optional overrides so role filter is applied immediately
  // without waiting for setFilters (which is async)
  const fetchUsers = async (overrides = {}) => {
    setLoading(true);
    try {
      const merged = { ...filters, ...overrides };
      const params = new URLSearchParams();
      if (isGlobal)          params.append("global",  "true");
      if (merged.company)    params.append("company", merged.company);
      if (merged.skills)     params.append("skills",  merged.skills);
      if (merged.role)       params.append("role",    merged.role);

      const res = await api.get(`/users?${params.toString()}`);

      // Always client-side exclude: self, superAdmin, collegeAdmin
      // And if current user is a student → also exclude other students
      let result = res.data.filter(
        (u) => u._id !== user?._id && u.role !== "superAdmin" && u.role !== "collegeAdmin"
      );
      if (user?.role === "student") {
        result = result.filter((u) => u.role === "alumni");
      }
      setUsers(result);
    } catch {
      toast.error("Unable to load directory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      const roleOverride = user.role === "student" ? "alumni" : "";
      setFilters((p) => ({ ...p, role: roleOverride }));
      // Pass role directly so it's used immediately, not after setState settles
      fetchUsers({ role: roleOverride });
    }
  }, [isGlobal, user]);

  const handleSearch = (e) => { e.preventDefault(); fetchUsers(); };

  const handleMentorshipRequest = async (mentorId) => {
    try {
      await api.post("/mentorship/request", {
        mentorId,
        message: "Hello, I would love to connect and learn from your experience.",
      });
      toast.success("Mentorship request sent!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to send request.");
    }
  };

  const handleChatRequest = async (receiverId) => {
    try {
      await api.post("/chat/request", { receiverId });
      toast.success("Chat invitation sent!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to start chat.");
    }
  };

  const handleProfileView = (userId) => navigate(`/profile/${userId}`);

  return (
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-6 duration-700">

      {/* ── Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-sky-500/10 text-sky-400 text-[10px] font-black uppercase rounded-xl tracking-widest border border-sky-500/20">
              <Globe className="w-3 h-3" />
              {isGlobal ? "Global Network" : "Institutional Hub"}
            </div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              {users.length} verified members
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-none">
            {user?.role === 'alumni' ? (
              <>Global <span className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">Mesh</span></>
            ) : (
              <>Find <span className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">Alumni</span></>
            )}
          </h1>
          <p className="text-slate-400 font-medium text-base whitespace-nowrap overflow-hidden text-ellipsis leading-relaxed italic">
            {user?.role === "alumni"
              ? "Source rising talent to mentor or connect with professional peers in the elite global network."
              : "Architect your professional path by connecting with institutional masters and alumni guides."}
          </p>
        </div>

        {/* Scope toggle */}
        <div className="flex items-center gap-4 p-5 rounded-2xl bg-slate-900/60 border border-white/[0.07] backdrop-blur-xl shrink-0">
          <div>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Coverage</p>
            <p className="text-sm font-black text-white">{isGlobal ? "Worldwide" : "My Institution"}</p>
          </div>
          <button
            onClick={() => setIsGlobal(!isGlobal)}
            className={`relative w-14 h-7 rounded-full flex items-center px-1 transition-all duration-300 ${isGlobal ? "bg-sky-500 shadow-lg shadow-sky-500/30" : "bg-white/10"}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${isGlobal ? "translate-x-7" : "translate-x-0"}`} />
          </button>
        </div>
      </div>

      {/* ── Search & Filters ── */}
      <div className="rounded-2xl border border-white/[0.07] bg-slate-900/60 backdrop-blur-xl p-5">
        {/* Mobile toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden w-full py-3 rounded-xl bg-white/5 border border-white/5 text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center justify-center gap-2 mb-4"
        >
          <Filter className="w-4 h-4" /> {showFilters ? "Hide Filters" : "Show Filters"}
        </button>

        <form onSubmit={handleSearch} className={`flex flex-col lg:flex-row gap-4 items-end ${showFilters ? "flex" : "hidden lg:flex"}`}>
          {user?.role !== "student" && (
            <div className="w-full lg:w-44">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Role</label>
              <select
                value={filters.role}
                onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500/50 transition-all outline-none appearance-none cursor-pointer"
              >
                <option value="" className="bg-slate-900">All Members</option>
                <option value="alumni" className="bg-slate-900">Alumni</option>
                <option value="student" className="bg-slate-900">Students</option>
              </select>
            </div>
          )}

          <div className="flex-1">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Company</label>
            <div className="relative">
              <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text" value={filters.company}
                onChange={(e) => setFilters({ ...filters, company: e.target.value })}
                placeholder="Search by company..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500/50 transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex-1">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Skills</label>
            <div className="relative">
              <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text" value={filters.skills}
                onChange={(e) => setFilters({ ...filters, skills: e.target.value })}
                placeholder="React, Python, AI..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500/50 transition-all outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full lg:w-auto px-8 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 shrink-0"
          >
            <Search className="w-4 h-4" /> Search
          </button>
        </form>
      </div>

      {/* ── Results ── */}
      <div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-white/5 bg-slate-900/60 p-6 animate-pulse">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-white/5" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-white/5 rounded-lg w-3/4" />
                    <div className="h-3 bg-white/5 rounded-lg w-1/2" />
                  </div>
                </div>
                <div className="space-y-2.5">
                  <div className="h-3 bg-white/5 rounded-lg" />
                  <div className="h-3 bg-white/5 rounded-lg w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center rounded-2xl border border-white/5 bg-slate-900/30">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-5 border border-white/5">
              <Users className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-xl font-black text-slate-400 mb-2">No Members Found</h3>
            <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-6">Try different filters</p>
            {!isGlobal && (
              <button
                onClick={() => setIsGlobal(true)}
                className="px-6 py-3 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold text-xs uppercase tracking-widest hover:bg-sky-500 hover:text-white transition-all"
              >
                Try Global Search
              </button>
            )}
          </div>
        ) : (
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-5 flex items-center gap-2">
              <span className="w-4 h-px bg-sky-500 inline-block" />
              {users.length} results found
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {users.map((person) => (
                <UserCard
                  key={person._id}
                  person={person}
                  currentUser={user}
                  onMentorshipRequest={handleMentorshipRequest}
                  onChatRequest={handleChatRequest}
                  onProfileView={handleProfileView}
                  onReport={setReportTarget}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Nexus AI Banner - Only show for Students ── */}
      {user?.role === 'student' && (
        <div className="relative rounded-2xl overflow-hidden border border-white/5">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950/40 to-sky-950/60" />
          <div className="absolute top-0 right-0 p-10 opacity-[0.04] pointer-events-none">
            <Brain className="w-72 h-72" />
          </div>
          <div className="relative z-10 p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2 text-sky-400 text-[10px] font-black uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5" /> Nexus AI
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                AI-Powered Career Tools
              </h2>
              <p className="text-slate-400 text-sm font-medium leading-relaxed">
                Resume analysis, skill gap detection, career roadmaps — all in one place. Let Nexus AI accelerate your career growth.
              </p>
              {/* Feature chips */}
              <div className="flex flex-wrap gap-2 pt-1">
                {["Resume Analyzer", "Skill Gap Analysis", "Career Roadmap", "AI Mentor Match"].map((f) => (
                  <span key={f} className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[9px] font-bold uppercase tracking-widest text-slate-400">{f}</span>
                ))}
              </div>
            </div>
            <Link
              to="/ai"
              className="shrink-0 inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-black text-sm transition-all shadow-xl shadow-sky-500/20 hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
            >
              Open Nexus AI <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {reportTarget && (
        <ReportModal targetUser={reportTarget} onClose={() => setReportTarget(null)} />
      )}
    </div>
  );
};

export default Directory;
