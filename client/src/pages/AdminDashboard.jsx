import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { AuthContext } from '../contexts/AuthContext';
import {
  Users, UserCheck, Zap, ShieldCheck, TrendingUp,
  Search, Ban, CheckCircle, XCircle, Eye,
} from 'lucide-react';

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, color }) => {
  const colors = {
    indigo: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    purple: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
  };
  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</span>
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{sub}</p>}
    </div>
  );
};

// ── Role Badge ────────────────────────────────────────────────────────────────
const RoleBadge = ({ role }) => {
  const styles = {
    Student: 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400',
    Alumni: 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    Admin: 'bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400',
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${styles[role] ?? styles.Student}`}>
      {role}
    </span>
  );
};

// ── Plan Badge ────────────────────────────────────────────────────────────────
const PlanBadge = ({ plan }) => {
  const styles = {
    Free: 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400',
    Monthly: 'bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400',
    Yearly: 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400',
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${styles[plan] ?? styles.Free}`}>
      {plan}
    </span>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  // Guard: only admin can access
  useEffect(() => {
    if (user && user.role !== 'Admin') {
      toast.error('Access denied.');
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get('/users');
        setUsers(data);
      } catch {
        toast.error('Failed to load users.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Derived stats
  const totalUsers = users.length;
  const totalStudents = users.filter((u) => u.role === 'Student').length;
  const totalAlumni = users.filter((u) => u.role === 'Alumni').length;
  const paidUsers = users.filter((u) => u.plan !== 'Free').length;
  const totalTokens = users.reduce((sum, u) => sum + (u.tokens ?? 0), 0);

  // Filtered list
  const filtered = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (user?.role !== 'Admin') return null;

  return (
    <div className="max-w-7xl mx-auto px-8 py-8 w-full space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
              Admin Panel
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Platform Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Full visibility into users, subscriptions, and platform activity.
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Users" value={totalUsers} sub={`${totalStudents} students · ${totalAlumni} alumni`} color="indigo" />
        <StatCard icon={UserCheck} label="Active Subscribers" value={paidUsers} sub="Monthly + Yearly plans" color="purple" />
        <StatCard icon={Zap} label="Total AI Tokens" value={totalTokens.toLocaleString()} sub="Across all accounts" color="amber" />
        <StatCard icon={TrendingUp} label="Conversion Rate" value={totalUsers > 0 ? `${Math.round((paidUsers / totalUsers) * 100)}%` : '0%'} sub="Free → Paid" color="emerald" />
      </div>

      {/* User Table */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">

        {/* Table Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-5 border-b border-gray-100 dark:border-slate-700">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            All Users <span className="text-sm font-normal text-gray-400 ml-1">({filtered.length})</span>
          </h2>
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm rounded-lg bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-purple-500 w-48"
              />
            </div>
            {/* Role filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-sm py-2 px-3 rounded-lg bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-purple-500 cursor-pointer"
            >
              <option value="All">All Roles</option>
              <option value="Student">Students</option>
              <option value="Alumni">Alumni</option>
              <option value="Admin">Admins</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-16 text-center text-gray-400 dark:text-gray-500 text-sm">Loading users...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400 dark:text-gray-500 text-sm">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-100 dark:border-slate-700">
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">User</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Role</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Plan</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Tokens</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Company</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
                {filtered.map((u) => {
                  const initials = u.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
                  return (
                    <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {u.profilePicture ? (
                            <img src={u.profilePicture} alt={u.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {initials}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{u.name}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5"><RoleBadge role={u.role} /></td>
                      <td className="px-5 py-3.5"><PlanBadge plan={u.plan} /></td>
                      <td className="px-5 py-3.5">
                        <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                          <Zap className="w-3.5 h-3.5" />{u.tokens ?? 0}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">{u.company || '—'}</td>
                      <td className="px-5 py-3.5 text-gray-400 dark:text-gray-500 text-xs">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
