import { useState, useEffect, useContext } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import {
  MessageSquare, Check, X, Award, UserPlus, Sparkles,
  ChevronRight, Clock, ArrowRight, UserCheck, Users,
} from "lucide-react";

/* ── Status Badge ────────────────────────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const map = {
    pending:   "bg-amber-500/10 text-amber-400 border-amber-500/25",
    accepted:  "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
    rejected:  "bg-rose-500/10 text-rose-400 border-rose-500/25",
    completed: "bg-sky-500/10 text-sky-400 border-sky-500/25",
  };
  return (
    <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border ${map[status] || "bg-white/5 text-slate-500 border-white/10"}`}>
      {status}
    </span>
  );
};

/* ── Avatar ──────────────────────────────────────────────────────────────── */
const Avatar = ({ name, size = "md" }) => {
  const initials = name?.charAt(0).toUpperCase() || "?";
  const sz = size === "lg" ? "w-14 h-14 text-xl" : "w-10 h-10 text-sm";
  return (
    <div className={`${sz} rounded-xl bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center font-black text-white shadow-lg shadow-sky-500/20 shrink-0`}>
      {initials}
    </div>
  );
};

/* ── Main Component ──────────────────────────────────────────────────────── */
const Mentorship = () => {
  const { user } = useContext(AuthContext);
  const [requests, setRequests]                 = useState([]);
  const [recommendedMentors, setRecommendedMentors] = useState([]);
  const [loading, setLoading]                   = useState(true);
  const [loadingMentors, setLoadingMentors]     = useState(true);
  const [sendingMentor, setSendingMentor]       = useState(null);

  const fetchRequests = async () => {
    try {
      const endpoint = user?.role === "student" ? "/mentorship/my-requests" : "/mentorship/mentor-requests";
      const { data } = await api.get(endpoint);
      setRequests(data);
    } catch {
      toast.error("Unable to load mentorship data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendedMentors = async () => {
    if (user?.role !== "student") return;
    try {
      const { data } = await api.get("/mentorship/recommended");
      setRecommendedMentors(data);
    } catch (err) {
      console.error("Error fetching mentors:", err);
    } finally {
      setLoadingMentors(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRequests();
      if (user.role === "student") fetchRecommendedMentors();
    }
  }, [user]);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/mentorship/${id}`, { status });
      toast.success(`Status updated to ${status}`);
      fetchRequests();
    } catch {
      toast.error("Update failed.");
    }
  };

  const sendMentorshipRequest = async (mentorId) => {
    setSendingMentor(mentorId);
    try {
      await api.post("/mentorship/request", {
        mentorId,
        message: "Requesting mentorship for career guidance.",
      });
      toast.success("Connection request sent!");
      fetchRecommendedMentors();
    } catch (err) {
      toast.error(err.response?.data?.message || "Request failed.");
    } finally {
      setSendingMentor(null);
    }
  };

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-2 border-sky-500/20 border-t-sky-500 rounded-full animate-spin" />
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest animate-pulse">Loading Mentorship</p>
    </div>
  );

  return (
    <div className="space-y-10 pb-16 animate-in fade-in slide-in-from-bottom-6 duration-700">

      {/* ── Page Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-3">
          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500/10 text-sky-400 text-[9px] font-black uppercase tracking-widest rounded-xl border border-sky-500/20">
              <Sparkles className="w-3 h-3" /> Connection Hub
            </div>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
              • {user?.role === "student" ? "Alumni Guide Mesh" : "Talent Pipeline"}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-none">
            {user?.role === 'alumni' ? 'Professional Guidance' : 'Mentorship'} <span className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">Nexus</span>
          </h1>

          {/* Single-line description */}
          <p className="text-slate-400 font-medium text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-2xl">
            {user?.role === "student"
              ? "Architect your professional path with guidance from elite alumni masters."
              : "Guide the next generation of talent through verified mentorship pipelines."}
          </p>
        </div>

        {/* CTA - Only show for students since alumni have suggested talent and directory links below */}
        {user?.role === 'student' && (
          <Link
            to="/directory"
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-500/10 border border-sky-500/25 text-sky-400 font-black text-[10px] uppercase tracking-widest hover:bg-sky-500 hover:text-white hover:border-sky-500 transition-all"
          >
            Explore Directory <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* ── Recommended Mentors (Student Only) ── */}
      {user?.role === "student" && (
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-1 h-7 bg-sky-500 rounded-full" />
            <h2 className="text-xl font-black text-white tracking-tight">Recommended Mentors</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {loadingMentors ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="rounded-2xl border border-white/5 bg-slate-900/60 p-6 animate-pulse h-52" />
              ))
            ) : recommendedMentors.length === 0 ? (
              <div className="md:col-span-2 lg:col-span-3 py-20 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/10 bg-slate-900/30">
                <UserPlus className="w-10 h-10 text-slate-600" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">No recommendations yet</p>
                <Link to="/directory" className="text-sky-400 text-xs font-bold hover:underline flex items-center gap-1">
                  Browse Directory <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ) : (
              recommendedMentors.map((mentor) => (
                <div key={mentor._id} className="group flex flex-col rounded-2xl border border-white/[0.07] bg-slate-900/60 p-6 hover:border-sky-500/30 hover:-translate-y-0.5 transition-all duration-300">
                  {/* Mentor info */}
                  <div className="flex items-center gap-4 mb-4">
                    <Link to={`/profile/${mentor._id}`}>
                      <Avatar name={mentor.name} size="lg" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-black text-white truncate leading-tight">{mentor.name}</h4>
                      <p className="text-[10px] text-sky-400 font-bold uppercase tracking-widest truncate mt-0.5">
                        {mentor.company || "Professional"} {mentor.currentRole ? `• ${mentor.currentRole}` : ""}
                      </p>
                    </div>
                  </div>

                  {/* Skills */}
                  {mentor.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {mentor.skills.slice(0, 3).map((skill) => (
                        <span key={skill} className="px-2.5 py-1 bg-white/5 text-slate-500 text-[9px] font-bold uppercase rounded-lg border border-white/5 tracking-wider">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Connect button */}
                  <button
                    onClick={() => sendMentorshipRequest(mentor._id)}
                    disabled={sendingMentor === mentor._id}
                    className="mt-auto w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    {sendingMentor === mentor._id ? "Sending..." : "Request Connection"}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── Connection Feed ── */}
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-1 h-7 bg-indigo-500 rounded-full" />
          <h2 className="text-xl font-black text-white tracking-tight">
            {user?.role === "student" ? "My Requests" : "Incoming Requests"}
          </h2>
          {requests.length > 0 && (
            <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] font-black">
              {requests.length}
            </span>
          )}
        </div>

        {requests.length === 0 ? (
          <div className="py-24 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/10 bg-slate-900/30">
            <MessageSquare className="w-10 h-10 text-slate-600" />
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">No active connections</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => {
              const targetUser = user?.role === "student" ? req.mentor : req.student;
              if (!targetUser) return null;

              return (
                <div
                  key={req._id}
                  className="flex flex-col sm:flex-row sm:items-center gap-5 p-5 rounded-2xl border border-white/[0.07] bg-slate-900/60 hover:border-white/[0.12] transition-all duration-200"
                >
                  {/* Avatar + Info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <Link to={`/profile/${targetUser._id}`} className="hover:scale-105 transition-transform">
                      <Avatar name={targetUser.name} />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <Link to={`/profile/${targetUser._id}`} className="hover:text-sky-400 transition-colors">
                          <h4 className="text-base font-black text-white truncate leading-none">{targetUser.name}</h4>
                        </Link>
                        <StatusBadge status={req.status} />
                      </div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest truncate">
                        {targetUser.branch || targetUser.company || "Professional"}{targetUser.skills?.length > 0 ? ` • ${targetUser.skills.slice(0, 2).join(", ")}` : ""}
                      </p>
                      {req.message && (
                        <p className="mt-2 text-xs text-slate-400 italic bg-white/5 rounded-lg px-3 py-2 border border-white/5 truncate max-w-sm">
                          "{req.message}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {req.status === "accepted" && (
                      <Link
                        to={`/chat?select=${targetUser._id}`}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-sky-500/20"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> Message
                      </Link>
                    )}

                    {user?.role === "alumni" && req.status === "accepted" && (
                      <button
                        onClick={() => updateStatus(req._id, "completed")}
                        className="px-5 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all"
                      >
                        Mark Done
                      </button>
                    )}

                    {user?.role === "alumni" && req.status === "pending" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateStatus(req._id, "accepted")}
                          className="w-10 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-all flex items-center justify-center shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95"
                        >
                          <Check className="w-4 h-4" strokeWidth={3} />
                        </button>
                        <button
                          onClick={() => updateStatus(req._id, "rejected")}
                          className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center hover:scale-105 active:scale-95"
                        >
                          <X className="w-4 h-4" strokeWidth={3} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Mentorship;
