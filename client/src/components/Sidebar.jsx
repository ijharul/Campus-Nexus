import { useContext } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import {
  LayoutDashboard, Users, UserCheck, Inbox, Building, Brain,
  LogOut, Zap, CreditCard,
  ShieldCheck, MessageSquare, Target, X, Trophy, Bell, BookOpen, Gem,
  ShieldAlert,
} from 'lucide-react';

const NexusLogo = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 4L4 8L12 12L20 8L12 4Z" fill="currentColor" />
    <path d="M4 12L12 16L20 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="1.5" fill="white" opacity="0.8" />
  </svg>
);

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate         = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const role     = user?.role;
  const initials = user?.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?';

  /* nav item style */
  const navItem = ({ isActive }) =>
    `group flex items-center gap-3 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 relative ${
      isActive
        ? 'bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-200/70 dark:border-sky-500/20'
        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white border border-transparent'
    }`;

  /* Section label */
  const SectionLabel = ({ label }) => (
    <p className="px-4 pt-5 pb-1.5 text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.28em]">
      {label}
    </p>
  );

  /* Nav item */
  const NavItem = ({ to, icon: Icon, label, end = false, badge }) => (
    <NavLink to={to} className={navItem} end={end} onClick={() => setIsOpen(false)}>
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 inset-y-2.5 w-[3px] bg-sky-500 rounded-r-full" />
          )}
          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-sky-500' : ''}`} />
          <span className="flex-1">{label}</span>
          {badge && (
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-sky-500 text-white uppercase tracking-wide">
              {badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-40 w-72 flex flex-col
      bg-white dark:bg-[#0c1220]
      border-r border-slate-200 dark:border-white/[0.06]
      shadow-xl shadow-black/5 dark:shadow-black/50
      transform transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
      lg:relative lg:translate-x-0
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>

      {/* ── Brand Header ── */}
      <div className="px-5 pt-5 pb-4 flex items-center justify-between border-b border-slate-100 dark:border-white/5 shrink-0">
        <Link to="/" className="flex items-center gap-3 group" onClick={() => setIsOpen(false)}>
          <div className="relative w-9 h-9 shrink-0">
            <div className="absolute inset-0 rounded-xl bg-sky-500/20 blur-md group-hover:bg-sky-500/30 transition-all duration-300" />
            <div className="relative w-9 h-9 bg-gradient-to-br from-sky-400 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/25 group-hover:scale-105 transition-transform duration-200">
              <NexusLogo />
            </div>
          </div>
          <div>
            <span className="text-[15px] font-black text-slate-900 dark:text-white tracking-tight block leading-tight">Campus Nexus</span>
            <span className="text-[8px] text-sky-500 font-bold uppercase tracking-[0.25em] leading-none">Career Platform</span>
          </div>
        </Link>
        <button
          onClick={() => setIsOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 hide-scrollbar space-y-0.5">

        {/* ─── STUDENT NAV ─── */}
        {role === 'student' && (
          <>
            <SectionLabel label="Main" />
            <NavItem to="/student/dashboard" icon={LayoutDashboard} label="Dashboard" end />
            <NavItem to="/directory"         icon={Users}           label="Find Alumni" />
            <NavItem to="/mentorship"        icon={UserCheck}       label="Mentorship" />
            <NavItem to="/referrals"         icon={Inbox}           label="Referrals" />
            <NavItem to="/notices"           icon={Bell}            label="Notices" />

            <SectionLabel label="Tools" />
            <NavItem to="/ai"             icon={Brain}        label="Nexus AI"      badge="AI" />
            <NavItem to="/leaderboard"    icon={Trophy}       label="Leaderboard" />
            <NavItem to="/chat"           icon={MessageSquare} label="Chat" />
            <NavItem to="/student/planner" icon={BookOpen}   label="Study Planner" />
            <NavItem to="/pricing"          icon={Gem}        label="Upgrade Plan" />
          </>
        )}

        {/* ─── ALUMNI NAV ─── */}
        {role === 'alumni' && (
          <>
            <SectionLabel label="Main" />
            <NavItem to="/alumni/dashboard"  icon={LayoutDashboard} label="Dashboard" end />
            <NavItem to="/mentorship"        icon={UserCheck}       label="Guidance Hub" />
            <NavItem to="/referrals"         icon={Inbox}           label="Opportunity Hub" />
            <NavItem to="/directory"         icon={Users}           label="Directory" />
            <NavItem to="/notices"           icon={Bell}            label="Notices" />

            <SectionLabel label="Community" />
            <NavItem to="/leaderboard"      icon={Trophy}         label="Leaderboard" />
            <NavItem to="/chat"             icon={MessageSquare}  label="Chat" />
            <NavItem to="/alumni/donations" icon={Zap}            label="Donations" />
          </>
        )}

        {/* ─── COLLEGE ADMIN NAV ─── */}
        {role === 'collegeAdmin' && (
          <>
            <SectionLabel label="Administration" />
            <NavItem to="/admin/college"              icon={LayoutDashboard} label="Control Panel" end />
            <NavItem to="/admin/college/verification" icon={ShieldCheck}     label="Verify Members" />
            <NavItem to="/admin/college/users"        icon={Users}           label="Members" />
            <NavItem to="/admin/college/campaigns"    icon={Target}          label="Campaigns" />

            <SectionLabel label="Community" />
            <NavItem to="/notices"    icon={Bell}          label="Notices" />
            <NavItem to="/leaderboard" icon={Trophy}       label="Leaderboard" />
            <NavItem to="/admin/college/reports" icon={ShieldAlert} label="Flagged Issues" />
          </>
        )}

        {/* ─── SUPER ADMIN NAV ─── */}
        {role === 'superAdmin' && (
          <>
            <SectionLabel label="Platform" />
            <NavItem to="/admin/super"          icon={LayoutDashboard} label="Overview" end />
            <NavItem to="/admin/super/colleges" icon={Building}        label="Institutions" />
            <NavItem to="/admin/super/revenue"  icon={CreditCard}      label="Revenue" />
            <NavItem to="/admin/super/requests" icon={ShieldAlert}     label="Access Requests" />
            <NavItem to="/admin/super/users"    icon={Users}           label="Global Directory" />
          </>
        )}
      </nav>

      {/* ── Footer: Profile + Controls ── */}
      <div className="p-3 border-t border-slate-100 dark:border-white/[0.06] space-y-2 shrink-0">
        {/* Profile row */}
        <NavLink
          to="/profile"
          onClick={() => setIsOpen(false)}
          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all group border border-transparent hover:border-slate-200/70 dark:hover:border-white/10"
        >
          <div className="relative shrink-0">
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt={user.name} className="w-9 h-9 rounded-xl object-cover" />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-md shadow-sky-500/20">
                {initials}
              </div>
            )}
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-[#0c1220]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate leading-tight">{user?.name}</p>
            <p className="text-[9px] text-sky-500 font-bold uppercase tracking-wide">{role}</p>
          </div>
        </NavLink>

        {/* Sign Out - full width */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/20 hover:border-rose-500 transition-all text-[11px] font-bold"
        >
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
