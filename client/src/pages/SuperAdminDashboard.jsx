import { useState, useEffect, useContext, useMemo } from "react";
import { AuthContext } from "../contexts/AuthContext";
import api from "../services/api";
import toast from "react-hot-toast";
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  Plus,
  Search,
  X,
  Loader2,
  Trash2,
  UserX,
  UserCheck,
  TrendingUp,
  BarChart3,
  IndianRupee,
  UserPlus,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Globe,
  ShieldAlert,
  GraduationCap,
  Briefcase,
  Filter,
  Inbox,
  CheckCircle,
  XCircle,
  Zap,
  Brain,
  ChevronRight,
  UserCog,
  Mail,
  Lock,
  ShieldCheck,
  Fingerprint,
  PencilLine,
  MapPin,
  Activity,
  Info,
  BarChart as ChartIcon,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";

const StatCard = ({ icon: Icon, label, value, sub, trend, color = "sky" }) => {
  const colors = {
    sky: "bg-sky-500/10 text-sky-500 border-sky-500/10",
    emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/10",
    amber: "bg-amber-500/10 text-amber-500 border-amber-500/10",
    indigo: "bg-indigo-500/10 text-indigo-500 border-indigo-500/10",
    blue: "bg-blue-500/10 text-blue-500 border-blue-500/10",
  };

  return (
    <div className="glass-card rounded-[2rem] p-8 hover:shadow-2xl transition-all duration-500 group border-transparent hover:border-slate-200 dark:hover:border-slate-700 bg-white/40 dark:bg-slate-900/40">
      <div className="flex items-center justify-between mb-8">
        <div
          className={`p-3.5 rounded-xl border-2 ${colors[color]} group-hover:scale-110 transition-transform`}
        >
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${trend > 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"}`}
          >
            {trend > 0 ? (
              <ArrowUpRight className="w-3.5 h-3.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5" />
            )}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
        <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          {value}
        </h3>
      </div>
      {sub && (
        <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-4 flex items-center gap-2">
          {sub}
        </p>
      )}
    </div>
  );
};

const SectionHeader = ({ title, desc, icon: Icon, children }) => (
  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
    <div className="flex items-center gap-5">
      {Icon && (
        <div className="w-14 h-14 bg-slate-900 dark:bg-slate-50 rounded-2xl flex items-center justify-center shadow-lg">
          <Icon className="w-7 h-7 text-white dark:text-slate-900" />
        </div>
      )}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-1">
          {title}
        </h1>
        <p className="text-sm font-normal text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
          {desc}
        </p>
      </div>
    </div>
    <div className="flex items-center gap-3">{children}</div>
  </div>
);

// ── Admin Management Modal ───────────────────────────────────────────────────

const AdminManagementModal = ({ college, onClose, onRefresh }) => {
  const [mode, setMode] = useState("create");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    userId: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`/colleges/${college._id}/create-admin`, form);
      toast.success(`Administrator account created for ${college.name}`);
      onRefresh();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-6 animate-in fade-in duration-300">
      <div className="glass-card rounded-[2rem] w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-300 border-slate-200/50 dark:border-slate-700/50 overflow-hidden bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <UserCog className="w-6 h-6 text-sky-500" /> Manage Institutional
              Access
            </h3>
            <p className="text-sm font-medium text-slate-500 mt-1">
              {college.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8">
          <div className="mb-8 p-4 bg-sky-50 dark:bg-sky-500/10 rounded-xl border border-sky-100 dark:border-sky-500/20">
            <p className="text-xs font-bold text-sky-600 uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Administrative Policy
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Existing students or alumni cannot be admins. A fresh
              administrative account must be created for each institution.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 mb-1.5 block ml-1">
                    Administrator Name
                  </label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      required
                      type="text"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      className="input-premium py-3 !pl-11 !text-sm"
                      placeholder="e.g. Alexis Carter"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 mb-1.5 block ml-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      className="input-premium py-3 !pl-11 !text-sm"
                      placeholder="admin@college.edu"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 mb-1.5 block ml-1">
                  Temporary Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    required
                    type="password"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    className="input-premium py-3 !pl-11 !text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full flex items-center justify-center gap-3 py-4 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-sky-500/20 disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99] text-sm mt-4"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <ShieldCheck className="w-5 h-5" />
              )}
              {loading
                ? "Processing..."
                : mode === "create"
                  ? "Create & Authorize"
                  : "Confirm Promotion"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// ── Institution View Modal (Monitoring Dashboard) ──────────────────────────

const InstitutionViewModal = ({ college, onClose }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get(`/colleges/${college._id}/stats`);
        setStats(data);
      } catch (err) {
        toast.error("Failed to load campus metrics");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [college._id]);

  const MetricCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
      <div
        className={`p-3 rounded-xl w-fit mb-4 bg-${color}-500/10 text-${color}-500`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
        {label}
      </p>
      <h4 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
        {value}
      </h4>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-6 animate-in fade-in duration-300">
      <div className="glass-card rounded-[2.5rem] w-full max-w-4xl shadow-3xl animate-in zoom-in-95 duration-500 border-slate-200/50 dark:border-slate-700/50 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="p-10 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-sky-500 text-white flex items-center justify-center text-2xl font-bold shadow-xl shadow-sky-500/20">
              {college.name[0]}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {college.name}
              </h3>
              <p className="text-sm font-medium text-slate-500 flex items-center gap-2 mt-1">
                <MapPin className="w-4 h-4" />{" "}
                {college.location || "Remote Campus"} •{" "}
                <Globe className="w-4 h-4" /> {college.domain || "Direct Hub"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-2xl text-slate-400 hover:text-rose-500 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <MetricCard
              icon={Users}
              label="Student Population"
              value={loading ? "..." : stats?.students || 0}
              color="sky"
            />
            <MetricCard
              icon={GraduationCap}
              label="Alumni Network"
              value={loading ? "..." : stats?.alumni || 0}
              color="indigo"
            />
            <MetricCard
              icon={Activity}
              label="Engagement Index"
              value={loading ? "..." : `${stats?.total || 0} Members`}
              color="emerald"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
                Primary Administrator
              </h5>
              {college.adminId ? (
                <div className="bg-slate-50 dark:bg-slate-800/80 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 flex items-center gap-5">
                  <div className="w-14 h-14 bg-sky-100 dark:bg-sky-500/20 text-sky-600 rounded-2xl flex items-center justify-center font-bold text-xl">
                    {college.adminId.name[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white truncate">
                      {college.adminId.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {college.adminId.email}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-center">
                  <p className="text-sm font-medium text-slate-400 italic">
                    No assigned administrator found.
                  </p>
                </div>
              )}
            </div>

            <div className="bg-gradient-to-br from-indigo-500 to-sky-600 rounded-3xl p-8 text-white relative overflow-hidden group">
              <div className="relative z-10">
                <h5 className="text-xs font-bold text-white/70 uppercase tracking-widest mb-6">
                  Internal Status
                </h5>
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="w-5 h-5 text-emerald-300" />
                  <p className="text-sm font-bold tracking-tight">
                    Verified Institution
                  </p>
                </div>
                <div className="flex items-center gap-3 mb-2 opacity-80">
                  <ShieldCheck className="w-5 h-5 text-sky-200" />
                  <p className="text-[13px] font-medium">
                    Campus Governance Active
                  </p>
                </div>
                <p className="text-xs text-white/50 mt-6 font-mono">
                  ID: {college._id}
                </p>
              </div>
              <Building2 className="absolute -right-10 -bottom-10 w-48 h-48 opacity-10 group-hover:scale-110 transition-transform duration-700" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Overview Section ─────────────────────────────────────────────────────────

const Overview = ({ analytics }) => {
  const revenueData = [
    { name: "Jan", value: 45000 },
    { name: "Feb", value: 52000 },
    { name: "Mar", value: 48000 },
    { name: "Apr", value: 61000 },
    { name: "May", value: analytics?.revenue?.monthly || 0 },
  ];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <SectionHeader
        title="Platform Dashboard"
        desc="A high-level summary of network growth, financial health, and community engagement."
        icon={LayoutDashboard}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          label="Total Users"
          value={analytics?.users?.total.toLocaleString()}
          trend={12}
          sub={`${analytics?.users?.weekly} new signups this week`}
          color="sky"
        />
        <StatCard
          icon={Building2}
          label="Partner Institutions"
          value={analytics?.colleges?.total}
          trend={5}
          sub="Active college campuses"
          color="blue"
        />
        <StatCard
          icon={CreditCard}
          label="Monthly Revenue"
          value={`₹${analytics?.revenue?.monthly.toLocaleString()}`}
          trend={8}
          sub="Projected for current month"
          color="emerald"
        />
        <StatCard
          icon={ShieldAlert}
          label="Pending Verifications"
          value={analytics?.users?.pendingCollegeUsers || 0}
          sub="Pending identity reviews"
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 glass-card rounded-[2rem] p-10 border-slate-200/50 dark:border-slate-800/50 shadow-xl bg-white/50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" /> Revenue
                Performance
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Platform subscription growth over the last 5 months
              </p>
            </div>
            <div className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Live Updates
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#94a3b8"
                  strokeOpacity={0.1}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "600",
                    padding: "12px",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#0ea5e9"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 glass-card rounded-[2rem] p-10 flex flex-col justify-between border-slate-200/50 dark:border-slate-800/50 shadow-xl bg-white/50 dark:bg-slate-900/50">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-2">
              <Users className="w-5 h-5 text-sky-500" /> User Distribution
            </h3>
            <div className="space-y-6">
              {[
                {
                  label: "Students",
                  count: analytics?.users?.roleBreakdown?.students,
                  color: "bg-sky-500",
                  sub: "Active learners",
                },
                {
                  label: "Alumni",
                  count: analytics?.users?.roleBreakdown?.alumni,
                  color: "bg-emerald-500",
                  sub: "Industry mentors",
                },
                {
                  label: "Institutes",
                  count: analytics?.users?.roleBreakdown?.admins,
                  color: "bg-indigo-500",
                  sub: "Platform admins",
                },
              ].map((r) => (
                <div key={r.label}>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {r.label}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {r.count}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`${r.color} h-full rounded-full transition-all duration-1000`}
                      style={{
                        width: `${(r.count / analytics?.users?.total) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800">
            <div className="bg-sky-50 dark:bg-sky-950/30 rounded-2xl p-4 border border-sky-100 dark:border-sky-900/50 flex items-center gap-4">
              <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                <ShieldCheck className="w-5 h-5 text-sky-500" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-sky-600 uppercase tracking-tighter mb-0.5">
                  Platform Integrity
                </p>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate">
                  System security active and monitored
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Colleges Section ─────────────────────────────────────────────────────────

const CollegesSection = ({ colleges, loading, onRefresh }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    adminName: "",
    adminEmail: "",
    adminPassword: "",
  });
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [manageTarget, setManageTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/colleges/${editingId}`, {
          name: form.name,
          location: form.location,
          domain: form.domain,
        });
        toast.success("Institution details updated");
      } else {
        const payload = {
          name: form.name,
          location: form.location,
          domain: form.domain,
          adminType: form.adminName ? "create" : "none",
          adminData: form.adminName
            ? {
                name: form.adminName,
                email: form.adminEmail,
                password: form.adminPassword,
              }
            : undefined,
        };
        await api.post("/colleges", payload);
        toast.success("Institution & Administrator successfully registered");
      }
      setShowForm(false);
      setEditingId(null);
      setForm({
        name: "",
        location: "",
        domain: "",
        adminName: "",
        adminEmail: "",
        adminPassword: "",
      });
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setBusy(false);
    }
  };

  const filtered = colleges.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.location || "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <SectionHeader
        title="Institution Management"
        desc="Maintain and supervise partner colleges connected to the university network."
        icon={Building2}
      >
        <button
          onClick={() => setShowForm(!showForm)}
          className={`btn-premium flex items-center gap-2 !px-6 transition-all ${showForm ? "!bg-slate-100 !text-slate-600 shadow-none" : "btn-sky"}`}
        >
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {showForm
            ? "Cancel Request"
            : editingId
              ? "Edit Mode Active"
              : "Add Institution"}
        </button>
      </SectionHeader>

      {showForm && (
        <div className="glass-card rounded-[2rem] p-10 shadow-xl animate-in zoom-in-95 duration-500 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 backdrop-blur-xl">
          <form onSubmit={handleCreate} className="space-y-10">
            {/* Institution Core Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  k: "name",
                  l: "Institution Name",
                  p: "e.g. Stanford University",
                  r: true,
                  i: Building2,
                },
                {
                  k: "location",
                  l: "Primary Location",
                  p: "e.g. California, USA",
                  i: Globe,
                },
                {
                  k: "domain",
                  l: "Official Domain",
                  p: "e.g. university.edu",
                  i: Mail,
                },
              ].map((f) => (
                <div key={f.k}>
                  <label className="text-[11px] font-bold text-slate-500 mb-2.5 block ml-1 uppercase tracking-wider">
                    {f.l} {f.r && "*"}
                  </label>
                  <div className="relative">
                    <f.i className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      required={f.r}
                      value={form[f.k]}
                      onChange={(e) =>
                        setForm({ ...form, [f.k]: e.target.value })
                      }
                      placeholder={f.p}
                      className="input-premium py-4 !pl-12 !text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Admin Assignment Section */}
            <div className="pt-10 border-t border-slate-100 dark:border-slate-800 bg-sky-50/30 dark:bg-sky-500/5 -mx-10 px-10 pb-10">
              <div className="mb-8 mt-4">
                <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />{" "}
                  Administrative Governance
                </h4>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Assign an institution head to manage this campus immediately.
                </p>
              </div>

              {!editingId && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 mb-2.5 block ml-1 uppercase tracking-wider">
                      Admin Name
                    </label>
                    <input
                      required
                      value={form.adminName}
                      onChange={(e) =>
                        setForm({ ...form, adminName: e.target.value })
                      }
                      placeholder="Full Name"
                      className="input-premium py-4 !text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 mb-2.5 block ml-1 uppercase tracking-wider">
                      Admin Email
                    </label>
                    <input
                      required
                      type="email"
                      value={form.adminEmail}
                      onChange={(e) =>
                        setForm({ ...form, adminEmail: e.target.value })
                      }
                      placeholder="email@college.edu"
                      className="input-premium py-4 !text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 mb-2.5 block ml-1 uppercase tracking-wider">
                      Temp Password
                    </label>
                    <input
                      required
                      type="password"
                      value={form.adminPassword}
                      onChange={(e) =>
                        setForm({ ...form, adminPassword: e.target.value })
                      }
                      placeholder="••••••••"
                      className="input-premium py-4 !text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <button
                disabled={busy}
                type="submit"
                className="btn-sky !px-12 !py-4 flex items-center gap-3 text-sm font-bold shadow-2xl hover:scale-[1.02] active:scale-95 transition-all"
              >
                {busy ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <ShieldCheck className="w-5 h-5" />
                )}
                {editingId
                  ? "Update Campus Details"
                  : "Authorize & Register Institution"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-card rounded-[2.5rem] overflow-hidden shadow-xl border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="relative w-full max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter institutions..."
              className="input-premium !pl-12 !py-3 !text-sm border-slate-200 dark:border-slate-800 focus:ring-sky-500/20"
            />
          </div>
          <p className="text-xs font-medium text-slate-400 px-4">
            {filtered.length} total institutions
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-950/50">
                {[
                  "Institution",
                  "Location",
                  "Domain",
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
              {filtered.map((c) => (
                <tr
                  key={c._id}
                  className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-lg border border-slate-200 dark:border-slate-600 group-hover:scale-105 transition-transform">
                        {c.name[0]}
                      </div>
                      <div
                        onClick={() => setViewTarget(c)}
                        className="cursor-pointer group/name relative"
                      >
                        <p className="font-bold text-slate-900 dark:text-white mb-0.5 group-hover/name:text-sky-600 transition-colors inline-block pb-0.5 border-b-2 border-transparent group-hover/name:border-sky-500/30">
                          {c.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          Ref: {c._id.slice(-8).toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-slate-500">
                    {c.location || "—"}
                  </td>
                  <td className="px-8 py-6 text-sky-600 font-medium underline decoration-sky-500/10 underline-offset-4">
                    {c.domain || "—"}
                  </td>
                  <td className="px-8 py-6">
                    {c.adminId ? (
                      <div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 rounded-lg w-fit border border-emerald-100 dark:border-emerald-500/20 text-[11px] font-bold mb-2">
                          <ShieldCheck className="w-3.5 h-3.5" /> Management
                          Active
                        </div>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                          {c.adminId.name}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[120px]">
                          {c.adminId.email}
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={() => setManageTarget(c)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-500/10 text-amber-600 hover:bg-amber-100 rounded-lg w-fit border border-amber-100 dark:border-amber-500/20 text-[11px] font-bold transition-all group/btn"
                      >
                        <UserPlus className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />{" "}
                        Assign Administrator
                      </button>
                    )}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setViewTarget(c)}
                        title="View Insights"
                        className="p-2 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-400 hover:text-sky-500 rounded-xl transition-all shadow-sm"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(c._id);
                          setForm({
                            name: c.name,
                            location: c.location || "",
                            domain: c.domain || "",
                            adminName: "",
                            adminEmail: "",
                            adminPassword: "",
                          });
                          setShowForm(true);
                        }}
                        title="Edit Institution Details"
                        className="p-2 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-400 hover:text-indigo-500 rounded-xl transition-all shadow-sm"
                      >
                        <PencilLine className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setManageTarget(c)}
                        title="Edit Administrator"
                        className="p-2 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-400 hover:text-emerald-500 rounded-xl transition-all shadow-sm"
                      >
                        <UserCog className="w-4 h-4" />
                      </button>
                      <button
                        onClick={async () => {
                          if (
                            !window.confirm(
                              `Delete Institution: Are you sure you want to permanently remove ${c.name}? This will also delete any strictly associated administrator account.`,
                            )
                          )
                            return;
                          try {
                            await api.delete(`/colleges/${c._id}`);
                            toast.success("Institution decommissioned");
                            onRefresh();
                          } catch (err) {
                            toast.error("Decommissioning failed");
                          }
                        }}
                        title="Delete Institution"
                        className="p-2 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-400 hover:text-rose-500 rounded-xl transition-all shadow-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-32 text-center text-slate-400 font-medium">
              No institutions matched your search.
            </div>
          )}
        </div>
      </div>
      {manageTarget && (
        <AdminManagementModal
          college={manageTarget}
          onClose={() => setManageTarget(null)}
          onRefresh={onRefresh}
        />
      )}
      {viewTarget && (
        <InstitutionViewModal
          college={viewTarget}
          onClose={() => setViewTarget(null)}
        />
      )}
    </div>
  );
};

const UsersSection = ({ allUsers, colleges, onRefresh }) => {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("All");
  const [busyId, setBusyId] = useState(null);
  const [promoTarget, setPromoTarget] = useState(null);

  const handleToggleBlock = async (user) => {
    if (
      !window.confirm(
        `Security Update: Are you sure you want to ${user.isBlocked ? "restore access for" : "suspend the account of"} ${user.name}?`,
      )
    )
      return;
    setBusyId(user._id);
    try {
      await api.put(`/users/${user._id}/block`);
      toast.success(`Access updated for ${user.name}`);
      onRefresh();
    } catch (err) {
      toast.error("Request failed");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (user) => {
    if (
      !window.confirm(
        `Delete User: This action will permanently remove all records for ${user.name}. This cannot be undone.`,
      )
    )
      return;
    setBusyId(user._id);
    try {
      await api.delete(`/users/${user._id}`);
      toast.success("User account successfully deleted");
      onRefresh();
    } catch (err) {
      toast.error("Account deletion failed");
    } finally {
      setBusyId(null);
    }
  };

  const filtered = allUsers.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = role === "All" || u.role === role;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <SectionHeader
        title="User Management"
        desc="Audit platform activities, manage user roles, and monitor account security statuses."
        icon={Users}
      >
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          {["All", "student", "alumni", "collegeAdmin"].map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${role === r ? "bg-white dark:bg-slate-700 text-sky-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              {r === "All"
                ? "All Roles"
                : r === "collegeAdmin"
                  ? "Admins"
                  : r.charAt(0).toUpperCase() + r.slice(1) + "s"}
            </button>
          ))}
        </div>
      </SectionHeader>

      <div className="glass-card rounded-[2.5rem] overflow-hidden shadow-xl border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800">
          <div className="relative max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users by name or email..."
              className="input-premium !pl-12 !py-3 !text-sm border-slate-200 dark:border-slate-800 focus:ring-sky-500/20"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-950/50">
                {[
                  "User Profile",
                  "User Role",
                  "Plan",
                  "Associated Institution",
                  "Account Status",
                  "Actions",
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
                      <div className="w-12 h-12 rounded-[1.2rem] overflow-hidden shrink-0 border-2 border-slate-100 dark:border-slate-700 shadow-sm">
                        {u.profilePicture ? (
                          <img
                            src={u.profilePicture}
                            className="w-full h-full object-cover"
                            alt=""
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 font-bold text-base">
                            {u.name[0]}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 dark:text-white truncate">
                          {u.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {u.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span
                      className={`px-2.5 py-1 text-[11px] font-semibold uppercase rounded-md border ${
                        u.role === "student"
                          ? "bg-sky-50 text-sky-600 border-sky-100"
                          : u.role === "alumni"
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                            : "bg-indigo-50 text-indigo-600 border-indigo-100"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {u.planName || "none"}
                    </p>
                  </td>
                  <td className="px-8 py-6 text-slate-500 font-medium truncate max-w-[200px]">
                    {u.collegeId?.name || u.pendingCollege || "System Access"}
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
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => handleToggleBlock(u)}
                        disabled={busyId === u._id}
                        title={
                          u.isBlocked ? "Restore Access" : "Suspend Account"
                        }
                        className={`p-2.5 rounded-xl transition-all ${u.isBlocked ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"}`}
                      >
                        {busyId === u._id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : u.isBlocked ? (
                          <UserCheck className="w-5 h-5" />
                        ) : (
                          <UserX className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(u)}
                        disabled={busyId === u._id}
                        title="Delete Account"
                        className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-32 text-center text-slate-400 text-sm font-medium">
              No users match your current search criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const RevenueSection = ({ analytics }) => {
  const donationData = analytics?.donations?.perCollege || [];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <SectionHeader
        title="Financial Overview"
        desc="Track platform subscription revenue and institutional contribution streams."
        icon={CreditCard}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card rounded-[2rem] p-12 overflow-hidden relative group bg-slate-900 border-none shadow-2xl text-white">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
            <IndianRupee className="w-64 h-64" />
          </div>
          <div className="relative z-10 flex items-center gap-8 mb-12">
            <div className="p-5 bg-emerald-500/20 rounded-2xl border border-emerald-500/30 shadow-2xl flex items-center justify-center shrink-0">
              <TrendingUp className="w-10 h-10 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-400 opacity-80 uppercase tracking-wider mb-1">
                Lifetime Revenue
              </p>
              <h2 className="text-5xl font-bold tracking-tight">
                ₹{analytics?.revenue?.allTime.toLocaleString()}
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xl">
              <p className="text-xs font-medium text-slate-400 mb-3">
                Subscription Income
              </p>
              <p className="text-2xl font-bold">
                ₹{analytics?.revenue?.allTime.toLocaleString()}
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold uppercase">
                <ArrowUpRight className="w-3 h-3" /> +24% growth
              </div>
            </div>
            <div className="p-6 bg-sky-500/10 rounded-2xl border border-sky-500/20 backdrop-blur-xl">
              <p className="text-xs font-medium text-sky-300 mb-3">
                Community Contributions
              </p>
              <p className="text-2xl font-bold text-sky-400">
                ₹{analytics?.donations?.total.toLocaleString()}
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-[10px] text-sky-400 font-semibold uppercase">
                <Globe className="w-3 h-3" /> Global support
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-[2rem] p-10 border-slate-200/50 dark:border-slate-800/50 shadow-xl bg-white/50 dark:bg-slate-900/50">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-10 flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-sky-500" /> Revenue by
            Institution
          </h3>
          {donationData.length === 0 ? (
            <div className="py-24 text-center text-slate-400 text-sm font-medium italic">
              No donation data available for the selected period.
            </div>
          ) : (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={donationData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#94a3b8"
                    strokeOpacity={0.1}
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 11 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 11 }}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(14,165,233, 0.05)", radius: 8 }}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar dataKey="total" radius={[6, 6, 0, 0]} barSize={40}>
                    {donationData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          [
                            "#0ea5e9",
                            "#10b981",
                            "#6366f1",
                            "#f59e0b",
                            "#ec4899",
                          ][index % 5]
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="glass-card rounded-[2.5rem] overflow-hidden shadow-xl border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50">
        <div className="px-10 py-6 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Subscription Tier Breakdown
          </h3>
        </div>
        <div className="p-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12">
            {[
              {
                label: "Starter Plan",
                users: analytics?.users?.planBreakdown?.free,
                price: 0,
                color: "text-slate-400",
                ic: Users,
              },
              {
                label: "Elite Monthly",
                users: analytics?.users?.planBreakdown?.monthly,
                price: 199,
                color: "text-sky-500",
                ic: Zap,
              },
              {
                label: "Pro Yearly",
                users: analytics?.users?.planBreakdown?.yearly,
                price: 1499,
                color: "text-emerald-500",
                ic: ShieldCheck,
              },
            ].map((p) => (
              <div key={p.label} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700 ${p.color}`}
                  >
                    <p.ic className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {p.label}
                  </p>
                </div>
                <div>
                  <p className={`text-4xl font-bold ${p.color} tracking-tight`}>
                    {p.users.toLocaleString()}
                  </p>
                  <p className="text-[11px] font-medium text-slate-400 mt-1 uppercase tracking-widest">
                    Active Members
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-1">
                  <p className="text-[11px] font-medium text-slate-500 uppercase">
                    Estimated Value
                  </p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    ₹{(p.users * p.price).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Requests Section ──────────────────────────────────────────────────────────

const RequestsSection = ({ requests, onRefresh }) => {
  const [busyId, setBusyId] = useState(null);

  const handleAction = async (id, action, reason = "") => {
    setBusyId(id);
    try {
      await api.put(`/super/requests/${id}/${action}`, { reason });
      toast.success(
        `Institution access request ${action === "approve" ? "approved" : "rejected"}`,
      );
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || "Access protocol failure");
    } finally {
      setBusyId(null);
    }
  };

  const pending = requests.filter((r) => r.status === "pending");

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <SectionHeader
        title="Access Requests"
        desc="Review and authorize new institutional participation requests."
        icon={Inbox}
      />

      <div className="glass-card rounded-[2.5rem] overflow-hidden shadow-xl border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50">
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Pending Authorizations
          </h3>
          <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[11px] font-bold rounded-full border border-amber-100 uppercase tracking-wider">
            {pending.length} pending items
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800">
                {["Institution", "Requester", "Submitted Date", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-8 py-5 text-xs font-semibold text-slate-400 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-sm">
              {pending.map((r) => (
                <tr
                  key={r._id}
                  className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-sky-500 font-bold text-lg border border-slate-200 dark:border-slate-700">
                        {r.collegeName[0]}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white mb-0.5">
                          {r.collegeName}
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                          <Globe className="w-3 h-3" />{" "}
                          {r.address || r.location || "Address missing"}
                        </p>
                        {r.website && (
                          <a
                            href={r.website}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-sky-500 hover:underline font-semibold mt-1 block"
                          >
                            Visit Official Website →
                          </a>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Users className="w-4 h-4 text-slate-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-700 dark:text-slate-300 mb-0.5">
                          {r.requester?.name}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate max-w-[150px]">
                          {r.requester?.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-slate-500 font-medium">
                    {new Date(r.createdAt).toLocaleDateString("en-US", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => handleAction(r._id, "approve")}
                        disabled={busyId === r._id}
                        className="px-5 py-2.5 bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center gap-2"
                      >
                        {busyId === r._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(r._id, "reject")}
                        disabled={busyId === r._id}
                        className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-semibold rounded-xl hover:text-rose-600 transition-all flex items-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {pending.length === 0 && (
            <div className="py-40 text-center">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300 dark:text-slate-700">
                <Inbox className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-400 mb-1">
                Queue is Clear
              </h3>
              <p className="text-sm text-slate-500">
                All access or registration requests have been resolved.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Root Dashboard Component ─────────────────────────────────────────────────

const SuperAdminDashboard = ({ section = "overview" }) => {
  const { user } = useContext(AuthContext);
  const [colleges, setColleges] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [c, u, a, r] = await Promise.all([
        api.get("/colleges"),
        api.get("/users/all"),
        api.get("/analytics"),
        api.get("/super/requests"),
      ]);
      setColleges(c.data);
      setAllUsers(u.data);
      setAnalytics(a.data);
      setRequests(r.data);
    } catch {
      toast.error("Unable to connect to administration server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading)
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-10">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-slate-100 border-t-sky-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 m-auto w-10 h-10 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg border border-slate-100 dark:border-slate-800">
            <Zap className="w-5 h-5 text-sky-500 animate-pulse fill-current" />
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-500 animate-pulse text-center">
            Loading platform metrics...
          </p>
        </div>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto pb-32 animate-in fade-in duration-700">
      {section === "overview" && (
        <Overview analytics={analytics} colleges={colleges} />
      )}
      {section === "colleges" && (
        <CollegesSection
          colleges={colleges}
          loading={loading}
          onRefresh={fetchData}
        />
      )}
      {section === "requests" && (
        <RequestsSection requests={requests} onRefresh={fetchData} />
      )}
      {section === "users" && (
        <UsersSection
          allUsers={allUsers}
          colleges={colleges}
          onRefresh={fetchData}
        />
      )}
      {section === "revenue" && <RevenueSection analytics={analytics} />}
    </div>
  );
};

export default SuperAdminDashboard;
