import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import api from "../services/api";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import {
  Users,
  GraduationCap,
  UserCheck,
  Search,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Eye,
  Building2,
  TrendingUp,
  Inbox,
  ShieldAlert,
  Plus,
  X,
  Trash2,
  UserX,
  User,
  Briefcase,
  Calendar,
  BarChart3,
  ChevronRight,
  ArrowRight,
  Zap,
  MessageSquare,
  Mail,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// ── Shared UI Components ──────────────────────────────────────────────────────

// ── Shared UI Components ──────────────────────────────────────────────────────

const StatCard = ({ icon: Icon, label, value, sub, color = "sky" }) => {
  const colors = {
    sky: "bg-sky-50 dark:bg-sky-900/10 text-sky-600 dark:text-sky-400 border-sky-100 dark:border-sky-900/50",
    emerald:
      "bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50",
    amber:
      "bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/50",
    blue: "bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/50",
  };
  return (
    <div className="glass-card rounded-[1.5rem] p-6 border-slate-200/60 dark:border-slate-800/60 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center gap-4 mb-4">
        <div className={`p-3 rounded-xl border-2 ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {label}
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {value}
          </p>
        </div>
      </div>
      {sub && (
        <p className="text-[10px] text-slate-500 font-medium pl-1">{sub}</p>
      )}
    </div>
  );
};

const SectionHeader = ({ title, desc, icon: Icon, children }) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-slate-100 dark:border-slate-800 pb-8">
    <div className="flex items-center gap-4">
      {Icon && (
        <div className="w-10 h-10 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-800">
          <Icon className="w-5 h-5 text-slate-400" />
        </div>
      )}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          {title}
        </h2>
        <p className="text-sm text-slate-500 font-medium">{desc}</p>
      </div>
    </div>
    <div className="flex items-center gap-3">{children}</div>
  </div>
);

// ── Section Components ────────────────────────────────────────────────────────

const Overview = ({ stats, collegeName }) => {
  const metrics = [
    { label: "Students", value: stats?.students || 0, color: "bg-sky-500" },
    { label: "Alumni", value: stats?.alumni || 0, color: "bg-emerald-500" },
    {
      label: "Campaigns",
      value: stats?.activeCampaignsCount || 0,
      color: "bg-blue-500",
    },
    {
      label: "Reports",
      value: stats?.reportsPending || 0,
      color: "bg-amber-500",
    },
  ];
  const maxValue = Math.max(...metrics.map((m) => m.value), 1);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <SectionHeader
        title="Institution Overview"
        desc={`Platform performance and community metrics for ${collegeName}.`}
        icon={GraduationCap}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          label="Enrolled Students"
          value={stats?.students || 0}
          sub="Active learning accounts"
          color="sky"
        />
        <StatCard
          icon={UserCheck}
          label="Verified Alumni"
          value={stats?.alumni || 0}
          sub="Mentors & professionals"
          color="emerald"
        />
        <StatCard
          icon={TrendingUp}
          label="Total Contributions"
          value={`₹${stats?.totalDonations?.toLocaleString() || 0}`}
          sub="Lifetime platform giving"
          color="blue"
        />
        <StatCard
          icon={Inbox}
          label="Pending Reports"
          value={stats?.reportsPending || 0}
          sub="Support tickets requiring action"
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-card rounded-[2rem] p-10 border-slate-200/60 dark:border-slate-800/60 shadow-lg">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-sky-500" /> Community
                Engagement
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                College performance snapshot using live admin metrics
              </p>
            </div>
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
              Live Snapshot
            </span>
          </div>

          <div className="h-[200px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" opacity={0.1} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} dy={10} />
                <YAxis hide />
                <Tooltip contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px'}} itemStyle={{color: '#fff'}} />
                <Area type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 text-xs text-slate-500">
            <div className="rounded-3xl bg-slate-50 dark:bg-slate-950 p-4 text-center">
              <p className="font-semibold text-slate-900 dark:text-white">
                Engagement
              </p>
              <p className="mt-2">Real-time metrics for your college</p>
            </div>
            <div className="rounded-3xl bg-slate-50 dark:bg-slate-950 p-4 text-center">
              <p className="font-semibold text-slate-900 dark:text-white">
                Health
              </p>
              <p className="mt-2">
                {stats?.reportsPending === 0
                  ? "No pending issues"
                  : `${stats?.reportsPending} reports open`}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-[2rem] p-10 bg-slate-900 dark:bg-slate-950 border-none shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform duration-1000">
            <ShieldCheck className="w-48 h-48 text-white" />
          </div>
          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-white tracking-tight mb-2">
              Platform Security
            </h3>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
              System protocols are active. All university records are encrypted
              and identity verified.
            </p>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
                Operational Status: 100%
              </span>
            </div>
            <div className="flex gap-4">
              <button className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-xs font-bold text-white transition-all uppercase tracking-wider">
                System Audit
              </button>
              <button className="px-5 py-2.5 bg-sky-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-sky-500/20 active:scale-95 transition-all">
                Security Center
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserManagement = ({ onRefresh }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [view, setView] = useState("all");
  const [busyId, setBusyId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/users/all");
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Unable to retrieve member directory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [view, onRefresh]);

  const handleBlock = async (u) => {
    const action = u.isBlocked ? "Restore" : "Suspend";
    if (!window.confirm(`${action} access for ${u.name}?`)) return;
    setBusyId(u._id);
    try {
      await api.put(`/users/${u._id}/block`);
      toast.success(`${u.name}'s access status has been updated.`);
      fetchUsers();
    } catch {
      toast.error("Update failed. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesView = view === "all" || u.role === view;
    return matchesSearch && matchesView;
  });

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <SectionHeader
        title="Member Directory"
        desc="Manage and supervise students and alumni registered with your institution."
        icon={Users}
      >
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          {[
            ["all", "Total Members"],
            ["alumni", "Alumni"],
            ["student", "Students"],
          ].map(([k, l]) => (
            <button
              key={k}
              onClick={() => setView(k)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${view === k ? "bg-white dark:bg-slate-700 text-sky-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              {l}
            </button>
          ))}
        </div>
      </SectionHeader>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="input-premium !pl-12 !py-3 !text-sm border-slate-200 dark:border-slate-800"
          />
        </div>
      </div>

      <div className="glass-card rounded-[2.5rem] overflow-hidden shadow-xl border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800">
                {[
                  "User Profile",
                  "Program",
                  "Plan",
                  "Activity",
                  "Access Status",
                  "Action",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-8 py-5 text-xs font-semibold text-slate-400 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-sm">
              {filtered.map((u) => (
                <tr
                  key={u._id}
                  className={`group hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors ${u.isBlocked ? "opacity-60" : ""}`}
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-[1rem] border border-slate-100 dark:border-slate-800 overflow-hidden shrink-0 shadow-sm transition-transform hover:scale-105">
                        <Link to={`/profile/${u._id}`}>
                          {u.profilePicture ? (
                            <img
                              src={u.profilePicture}
                              className="w-full h-full object-cover"
                              alt=""
                            />
                          ) : (
                            <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 text-base font-bold uppercase">
                              {u.name[0]}
                            </div>
                          )}
                        </Link>
                      </div>
                      <div className="min-w-0">
                        <Link
                          to={`/profile/${u._id}`}
                          className="block group/link"
                        >
                          <p className="font-bold text-slate-900 dark:text-white truncate group-hover/link:text-sky-600 transition-colors">
                            {u.name}
                          </p>
                        </Link>
                        <p className="text-[11px] text-slate-500 font-medium truncate">
                          {u.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider bg-sky-50 dark:bg-sky-900/20 px-2 py-0.5 rounded w-fit mb-1">
                      {u.role}
                    </p>
                    <p className="text-xs text-slate-500 font-medium">
                      {u.branch || "General"}
                    </p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {u.planName || "none"}
                    </p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                        {u.experience?.length || 0} Records
                      </span>
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        {u.role === 'student' ? 'Batch of' : 'Class of'} {u.year || "N/A"}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {u.isBlocked ? (
                      <span className="inline-flex items-center gap-1.5 text-rose-600 font-semibold">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>{" "}
                        Suspended
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-emerald-600 font-semibold">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>{" "}
                        Verified
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/profile/${u._id}`}
                        title="View Full Profile"
                        className="p-2.5 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-400 hover:text-sky-500 hover:border-sky-500/30 rounded-xl transition-all shadow-sm group/view"
                      >
                        <User className="w-5 h-5 group-hover/view:scale-110 transition-transform" />
                      </Link>
                      <a
                        href={`mailto:${u.email}`}
                        title="Contact via Email"
                        className="p-2.5 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-400 hover:text-emerald-500 hover:border-emerald-500/30 rounded-xl transition-all shadow-sm group/mail"
                      >
                        <Mail className="w-5 h-5 group-hover/mail:scale-110 transition-transform" />
                      </a>
                      <button
                        onClick={() => handleBlock(u)}
                        disabled={busyId === u._id}
                        title={
                          u.isBlocked ? "Restore Access" : "Suspend Account"
                        }
                        className={`p-2.5 rounded-xl transition-all shadow-sm ${u.isBlocked ? "bg-emerald-500 text-white" : "bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-400 hover:text-rose-500 hover:border-rose-500/30"}`}
                      >
                        {busyId === u._id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : u.isBlocked ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <UserX className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-32 text-center text-slate-400 font-medium">
              <Search className="w-10 h-10 mx-auto mb-4 opacity-20" />
              <p className="text-sm italic">
                No members matching your search criteria were found.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const VerificationRequests = ({ onRefresh }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState(null);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/college-admin/verifications/pending');
            setRequests(data);
        } catch {
            toast.error("Failed to sync verification queue.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [onRefresh]);

    const handleAction = async (id, status) => {
        setBusyId(id);
        try {
            await api.put(`/college-admin/verifications/${id}`, { status });
            toast.success(`Node ${status === 'verified' ? 'authorized' : 'rejected'}.`);
            fetchRequests();
            onRefresh();
        } catch {
            toast.error("Handshake failed.");
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <SectionHeader 
                title="Institutional Verification Hub" 
                desc="Authorize identity nodes and award institutional badges to alumni." 
                icon={ShieldCheck} 
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {requests.length === 0 ? (
                    <div className="col-span-2 py-40 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem]">
                        <ShieldCheck className="w-16 h-16 text-slate-200 dark:text-slate-800 mx-auto mb-6" />
                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No Pending Handshakes</p>
                    </div>
                ) : (
                    requests.map(req => (
                        <div key={req._id} className="glass-card rounded-[2.5rem] p-10 bg-white/50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 relative group">
                            <div className="flex items-center gap-6 mb-8">
                                <Link to={`/profile/${req._id}`} className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-500 font-black text-xl hover:scale-105 transition-transform">
                                    {req.name[0]}
                                </Link>
                                <div className="flex-1">
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight flex items-center gap-2">
                                        {req.name}
                                        <a href={`mailto:${req.email}`} className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-400 hover:text-sky-500 transition-colors">
                                            <Mail className="w-3.5 h-3.5" />
                                        </a>
                                    </h3>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{req.email}</p>
                                </div>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 mb-8 space-y-4">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-400 font-bold uppercase tracking-widest">Requested Status</span>
                                    <span className="text-brand-600 font-black uppercase">Verified Alumnus</span>
                                </div>
                                {req.batch && (
                                   <div className="flex justify-between items-center text-xs">
                                      <span className="text-slate-400 font-bold uppercase tracking-widest">Claimed Batch</span>
                                      <span className="text-slate-900 dark:text-white font-black">{req.batch}</span>
                                   </div>
                                )}
                            </div>

                            <div className="flex gap-4">
                                <button 
                                    onClick={() => handleAction(req._id, 'verified')}
                                    disabled={busyId === req._id}
                                    className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-xl shadow-emerald-500/20 transition-all active:scale-95"
                                >
                                    Authorize
                                </button>
                                <button 
                                    onClick={() => handleAction(req._id, 'rejected')}
                                    disabled={busyId === req._id}
                                    className="px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/10 hover:text-rose-500 transition-all active:scale-95"
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const ReportsSection = ({ onRefresh }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/college-admin/reports");
      setReports(data);
    } catch {
      toast.error("Reports synchronization failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleUpdate = async (id, status) => {
    setBusyId(id);
    try {
      await api.put(`/college-admin/reports/${id}`, { status });
      toast.success(`Action taken: The report has been ${status}.`);
      fetchReports();
      onRefresh();
    } catch {
      toast.error("Request rejected.");
    } finally {
      setBusyId(null);
    }
  };

  const handleBlockAndResolve = async (reportId, targetId) => {
    if (!window.confirm("Are you sure you want to block this user and resolve the report?")) return;
    setBusyId(reportId);
    try {
      await api.put(`/college-admin/reports/${reportId}`, { 
        status: "resolved", 
        adminNote: "User blocked due to community reports.",
        blockUser: true 
      });
      setReports(prev => prev.map(r => r._id === reportId ? { ...r, status: 'resolved' } : r));
      toast.success("User blocked and report resolved.");
    } catch {
      toast.error("Action failed.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <SectionHeader
        title="Community Reports"
        desc="Review and resolve platform integrity concerns filed by members."
        icon={ShieldAlert}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {reports.length === 0 ? (
          <div className="col-span-2 py-40 text-center glass-card rounded-[3rem] border-dashed border-slate-200 dark:border-slate-800">
            <ShieldCheck className="w-14 h-14 text-emerald-500 mx-auto mb-6 opacity-40" />
            <p className="text-sm font-semibold text-slate-400 italic">
              No pending community reports requiring action.
            </p>
          </div>
        ) : (
          reports.map((r) => (
            <div
              key={r._id}
              className={`glass-card rounded-[2rem] p-8 transition-all border-b-8 ${r.status === "pending" ? "border-amber-500 shadow-xl" : "border-slate-100 dark:border-slate-800 opacity-60"}`}
            >
              <div className="flex items-center justify-between mb-8">
                <span
                  className={`px-4 py-1.5 text-[10px] font-bold uppercase rounded-lg ${r.status === "pending" ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}
                >
                  {r.status}
                </span>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {new Date(r.createdAt).toLocaleDateString(undefined, {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase mb-2">
                    Reporter
                  </p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {r.reporterId?.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-bold text-slate-400 uppercase mb-2">
                    Alleged Target
                  </p>
                  <p className="text-sm font-bold text-rose-500 truncate">
                    {r.targetId?.name}
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 mb-8 relative">
                <p className="text-[10px] font-bold text-amber-600 uppercase mb-3 tracking-widest italic">
                  Report Details
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed italic">
                  "{r.reason}"
                </p>
              </div>

              {r.status === "pending" && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleUpdate(r._id, "resolved")}
                    disabled={busyId === r._id}
                    className="flex-1 btn-sky py-3 text-[10px] font-bold shadow-lg"
                  >
                    Resolve
                  </button>
                  <button
                    onClick={() => handleBlockAndResolve(r._id, r.targetId?._id)}
                    disabled={busyId === r._id}
                    className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl shadow-lg transition-all"
                  >
                    Block User
                  </button>
                  <button
                    onClick={() => handleUpdate(r._id, "dismissed")}
                    disabled={busyId === r._id}
                    className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-500 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const CampaignsSection = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    goalAmount: "",
    endDate: "",
  });
  const [busy, setBusy] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [donations, setDonations] = useState([]);

  const fetchCampaigns = async () => {
    try {
      const [{ data: cData }, { data: dData }] = await Promise.all([
        api.get("/college-admin/campaigns"),
        api.get("/college-admin/donations")
      ]);
      setCampaigns(cData);
      setDonations(dData);
    } catch {
      toast.error("Unable to retrieve active campaigns.");
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/college-admin/campaigns", form);
      toast.success("Donation campaign successfully launched.");
      setShowForm(false);
      setForm({ title: "", description: "", goalAmount: "", endDate: "" });
      fetchCampaigns();
    } catch {
      toast.error("Failed to create campaign. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <SectionHeader
        title="Giving Campaigns"
        desc="Create and manage donation goals to support institution initiatives."
        icon={TrendingUp}
      >
        <button
          onClick={() => setShowForm(!showForm)}
          className={`btn-premium flex items-center gap-2 !px-6 transition-all ${showForm ? "!bg-slate-100 !text-slate-600 shadow-none" : "btn-sky"}`}
        >
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {showForm ? "Cancel Request" : "New Campaign"}
        </button>
      </SectionHeader>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="glass-card rounded-[2rem] p-10 shadow-xl animate-in zoom-in-95 duration-300 border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-500 mb-2 block ml-1">
                Campaign Title
              </label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g., Annual Library Renovation 2026"
                className="input-premium py-4 !text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-500 mb-2 block ml-1">
                Campaign Description
              </label>
              <textarea
                required
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Explain the purpose and goals of this initiative..."
                className="input-premium min-h-[120px] !text-sm py-4"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-2 block ml-1">
                Financial Goal (INR)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                  ₹
                </span>
                <input
                  required
                  type="number"
                  value={form.goalAmount}
                  onChange={(e) =>
                    setForm({ ...form, goalAmount: e.target.value })
                  }
                  placeholder="500,000"
                  className="input-premium !pl-10 py-4 !text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-2 block ml-1">
                Expiry Date
              </label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="input-premium py-3.5 cursor-pointer !text-sm"
              />
            </div>
          </div>
          <button
            disabled={busy}
            type="submit"
            className="w-full btn-sky !py-4 shadow-xl flex items-center justify-center gap-2"
          >
            {busy ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <ShieldCheck className="w-5 h-5" />
            )}
            Launch Campaign
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {campaigns.length === 0 ? (
          <div className="lg:col-span-3 py-40 text-center glass-card rounded-[3rem] border-dashed border-slate-200 dark:border-slate-800">
            <TrendingUp className="w-14 h-14 text-slate-200 dark:text-slate-800 mx-auto mb-6 opacity-40" />
            <p className="text-sm font-medium text-slate-400 italic">
              No active donation campaigns at this time.
            </p>
          </div>
        ) : (
          campaigns.map((c) => {
            const campaignDonations = donations.filter(d => d.campaignId?._id === c._id);
            const isExpanded = expandedId === c._id;

            return (
            <div
              key={c._id}
              onClick={() => setExpandedId(isExpanded ? null : c._id)}
              className={`glass-card rounded-[2rem] p-8 flex flex-col group border-slate-200/60 dark:border-slate-800/60 hover:shadow-2xl transition-all cursor-pointer ${isExpanded ? 'ring-2 ring-sky-500/50' : ''}`}
            >
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight max-w-[70%]">
                  {c.title}
                </h3>
                <span
                  className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-lg border ${c.isActive ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 dark:bg-slate-900 text-slate-400 border-slate-100 dark:border-slate-800"}`}
                >
                  {c.isActive ? "Active" : "Finished"}
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 mb-8 font-medium italic">
                "{c.description}"
              </p>

              <div className="mt-auto space-y-4">
                <div className="flex justify-between text-[11px] font-bold uppercase">
                  <span className="text-slate-400">
                    Target: ₹{c.goalAmount.toLocaleString()}
                  </span>
                  <span className="text-sky-600 bg-sky-50 dark:bg-sky-900/30 px-2 py-0.5 rounded-md">
                    {Math.round((c.raisedAmount / c.goalAmount) * 100)}% Funded
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-900 h-2 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="bg-sky-500 h-full transition-all duration-1000 shadow-lg"
                    style={{
                      width: `${Math.min((c.raisedAmount / c.goalAmount) * 100, 100)}%`,
                    }}
                  ></div>
                </div>

                {isExpanded && (
                  <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-4 space-y-4 animate-in slide-in-from-top-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Contribution Ledger</p>
                    {campaignDonations.length === 0 ? (
                      <p className="text-[10px] text-slate-500 italic">No donations recorded yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {campaignDonations.map(d => (
                          <div key={d._id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                             <Link 
                               to={`/profile/${d.donorId?._id}`} 
                               onClick={(e) => e.stopPropagation()}
                               className="flex items-center gap-2 group/u"
                             >
                                <div className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                  {d.donorId?.name?.[0]}
                                </div>
                                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 group-hover/u:text-sky-500 truncate max-w-[80px]">{d.donorId?.name}</span>
                             </Link>
                             <span className="text-[11px] font-black text-emerald-500">₹{d.amount.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-2">
                       <span className="text-[10px] font-bold text-slate-500">Remaining</span>
                       <span className="text-[10px] font-black text-rose-500">₹{(c.goalAmount - c.raisedAmount).toLocaleString()}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <Calendar className="w-4 h-4 text-slate-300" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Expires{" "}
                    {new Date(c.endDate).toLocaleDateString(undefined, {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          )})
        )}
      </div>
    </div>
  );
};

const NoticesSection = () => {
  const [notices, setNotices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    content: "",
    type: "Announcement",
    externalLink: "",
  });
  const [busy, setBusy] = useState(false);

  const fetchNotices = async () => {
    try {
      const { data } = await api.get("/college-admin/notices");
      setNotices(data);
    } catch {
      toast.error("Unable to synchronize notice board.");
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/college-admin/notices", form);
      toast.success("Campus notice published successfully.");
      setShowForm(false);
      setForm({
        title: "",
        content: "",
        type: "Announcement",
        externalLink: "",
      });
      fetchNotices();
    } catch {
      toast.error("Notice publication failed.");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this notice from the campus board?")) return;
    try {
      await api.delete(`/college-admin/notices/${id}`);
      toast.success("Notice archived.");
      fetchNotices();
    } catch {
      toast.error("Archiving failed.");
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <SectionHeader
        title="Campus Notice Board"
        desc="Publish and manage institution-wide announcements for students and alumni."
        icon={Calendar}
      >
        <button
          onClick={() => setShowForm(!showForm)}
          className={`btn-premium flex items-center gap-2 !px-6 transition-all ${showForm ? "!bg-slate-100 !text-slate-600 shadow-none" : "btn-sky"}`}
        >
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {showForm ? "Cancel" : "New Notice"}
        </button>
      </SectionHeader>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="glass-card rounded-[2rem] p-10 shadow-xl animate-in zoom-in-95 duration-300 border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-500 mb-2 block ml-1 uppercase tracking-wider">
                Notice Title
              </label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Annual Alumni Meet 2026 - Registration Open"
                className="input-premium py-4 !text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-500 mb-2 block ml-1 uppercase tracking-wider">
                Content
              </label>
              <textarea
                required
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Detaills of the announcement..."
                className="input-premium min-h-[120px] !text-sm py-4"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-2 block ml-1 uppercase tracking-wider">
                Notice Category
              </label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="input-premium py-3.5 !text-sm cursor-pointer"
              >
                {["Announcement", "Event", "Webinar", "Job Alert"].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-2 block ml-1 uppercase tracking-wider">
                Action Link (Optional)
              </label>
              <input
                value={form.externalLink}
                onChange={(e) =>
                  setForm({ ...form, externalLink: e.target.value })
                }
                placeholder="https://registration-form.com"
                className="input-premium py-3.5 !text-sm"
              />
            </div>
          </div>
          <button
            disabled={busy}
            type="submit"
            className="w-full btn-sky !py-4 shadow-xl flex items-center justify-center gap-2"
          >
            {busy ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <ShieldCheck className="w-5 h-5" />
            )}{" "}
            Publish to Campus
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 gap-6">
        {notices.length === 0 ? (
          <div className="py-20 text-center glass-card rounded-[2.5rem] border-dashed border-slate-200 dark:border-slate-800">
            <p className="text-sm font-medium text-slate-400 italic">
              Static bulletin. No notices are currently active.
            </p>
          </div>
        ) : (
          notices.map((n) => (
            <div
              key={n._id}
              className="glass-card rounded-[2rem] p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-xl transition-all border-slate-200/60 dark:border-slate-800/60"
            >
              <div className="flex items-center gap-6">
                <div className="p-4 rounded-2xl bg-sky-500/10 text-sky-600 border border-sky-500/20">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-sky-600 bg-sky-50 dark:bg-sky-900/30 px-2 py-0.5 rounded-lg border border-sky-100 dark:border-sky-800 uppercase tracking-widest mb-2 inline-block">
                    {n.type}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                    {n.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1 mt-1">
                    {n.content}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0 w-full md:w-auto">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mr-2">
                  {new Date(n.createdAt).toLocaleDateString()}
                </p>
                <button
                  onClick={() => handleDelete(n._id)}
                  className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-2xl transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ── Root College Admin Component ──────────────────────────────────────────────

const DonationsSection = () => {
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const fetchDonations = async () => {
            try {
                const { data } = await api.get("/college-admin/donations");
                setDonations(data);
            } catch (error) { toast.error("Transaction bridge offline."); }
            finally { setLoading(false); }
        };
        fetchDonations();
    }, []);

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <SectionHeader
                title="Philanthropy Ledger"
                desc="Audit successful alumni donations directly correlated to your campus infrastructure."
                icon={Zap}
            />
            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-sky-500 animate-spin" /></div>
            ) : donations.length === 0 ? (
                <div className="py-40 text-center glass-card rounded-[3rem] border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center">
                    <Zap className="w-14 h-14 text-slate-300 dark:text-slate-700 mb-6" />
                    <p className="text-sm font-semibold text-slate-400 italic mb-2">The philanthropy ledger is currently undisturbed.</p>
                </div>
            ) : (
                <div className="glass-card rounded-[2.5rem] overflow-hidden shadow-xl border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800">
                                    {["Donor Origin", "Allocation Target", "Transaction Value", "Date Wired"].map(h => (
                                        <th key={h} className="px-8 py-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-sm">
                                {donations.map(d => (
                                    <tr key={d._id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                              <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 text-xs font-bold uppercase overflow-hidden ring-2 ring-transparent group-hover:ring-sky-500/30 transition-all">
                                                {d.donorId?.profilePicture ? <img src={d.donorId.profilePicture} className="w-full h-full object-cover" /> : d.donorId?.name[0]}
                                              </div>
                                              <div>
                                                  <p className="font-bold text-slate-900 dark:text-white leading-tight">{d.donorId?.name || 'Unknown'}</p>
                                                  <p className="text-[10px] text-slate-400 font-medium">{d.donorId?.email}</p>
                                              </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                                {d.campaignId ? d.campaignId.title : 'General Campus Fund'}
                                            </p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-100 dark:border-emerald-500/30">
                                                ₹{d.amount.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                                {new Date(d.createdAt).toLocaleDateString(undefined, {
                                                  day: "2-digit",
                                                  month: "short",
                                                  year: "numeric"
                                                })}
                                            </p>
                                            <p className="text-[10px] font-medium text-slate-400 mt-0.5">
                                                {new Date(d.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </p>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

const CollegeAdminDashboard = ({ section = "overview" }) => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const { data } = await api.get("/college-admin/stats");
      setStats(data);
    } catch {
      toast.error("Intelligence sync disrupted.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading)
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-8">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin"></div>
          <Building2 className="absolute inset-0 m-auto w-8 h-8 text-emerald-500 animate-pulse" />
        </div>
        <p className="text-xs font-black text-slate-400 animate-pulse uppercase tracking-[0.4em]">
          Calibrating Institute Hub
        </p>
      </div>
    );

  const collegeName = user?.collegeId?.name || "Local Institute";

  return (
    <div className="max-w-7xl mx-auto pb-20">
      {section === "overview" && (
        <Overview stats={stats} collegeName={collegeName} />
      )}
      {section === "users" && <UserManagement onRefresh={fetchStats} />}
      {section === "verification" && <VerificationRequests onRefresh={fetchStats} />}
      {section === "reports" && <ReportsSection onRefresh={fetchStats} />}
      {section === "campaigns" && <CampaignsSection />}
      {section === "notices" && <NoticesSection />}
      {section === "donations" && <DonationsSection />}
    </div>
  );
};

export default CollegeAdminDashboard;
