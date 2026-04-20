import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import {
  Users,
  Building,
  Sparkles,
  UserCheck,
  Inbox,
  ArrowRight,
  Zap,
  TrendingUp,
  Star,
  FileText,
} from 'lucide-react';

// ── Stat chip ─────────────────────────────────────────────────────────────────
const StatChip = ({ label, value, color = 'indigo' }) => {
  const colors = {
    indigo: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20',
    purple: 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-100 dark:border-purple-500/20',
    emerald: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20',
  };
  return (
    <div className={`flex flex-col px-4 py-3 rounded-xl border text-center ${colors[color]}`}>
      <span className="text-lg font-bold leading-tight">{value}</span>
      <span className="text-xs mt-0.5 opacity-70 font-medium">{label}</span>
    </div>
  );
};

// ── Feature card ──────────────────────────────────────────────────────────────
const FeatureCard = ({ to, icon: Icon, iconBg, iconColor, title, description, badge }) => (
  <Link
    to={to}
    className="group relative flex flex-col bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
  >
    {/* Subtle hover glow */}
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/[0.03] group-hover:to-purple-500/[0.05] transition-all duration-300 rounded-xl" />

    <div className="relative">
      {/* Icon */}
      <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${iconBg} mb-4`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>

      {/* Badge */}
      {badge && (
        <span className="absolute top-0 right-0 text-[10px] font-bold bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}

      {/* Title */}
      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1.5">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
        {description}
      </p>

      {/* "Go" arrow */}
      <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:gap-2 transition-all">
        Get started <ArrowRight className="w-3.5 h-3.5" />
      </div>
    </div>
  </Link>
);

// ── Main Component ─────────────────────────────────────────────────────────────
const Dashboard = () => {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  const firstName = user.name?.split(' ')[0] ?? 'there';

  return (
    <div className="max-w-6xl mx-auto px-8 py-8 w-full space-y-8">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
        <div>
          {/* Greeting */}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Good {getTimeOfDay()},{' '}
            <span className="text-indigo-600 dark:text-indigo-400">{firstName}</span> 👋
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {user.role === 'Student'
              ? 'Your career acceleration hub is ready.'
              : 'Manage your mentorships and referral pipeline.'}
          </p>
        </div>

        {/* Stat chips */}
        <div className="flex items-center gap-3 shrink-0">
          <StatChip
            label="Active Plan"
            value={user.plan ?? 'Free'}
            color="purple"
          />
          {user.role === 'Student' && (
            <StatChip
              label="AI Tokens"
              value={`⚡ ${user.tokens ?? 0}`}
              color="indigo"
            />
          )}
        </div>
      </div>

      {/* ── Quick-action banner (Student only) ── */}
      {user.role === 'Student' && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white shadow-lg shadow-indigo-500/20">
          {/* Decorative circles */}
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-12 -right-4 w-56 h-56 rounded-full bg-white/5" />

          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-indigo-200 mb-1">
                🚀 Pro Tip
              </p>
              <h2 className="text-lg font-bold">
                Complete your profile to unlock referrals
              </h2>
              <p className="text-sm text-indigo-100 mt-1">
                Alumni are 3× more likely to refer students with a full profile.
              </p>
            </div>
            <Link
              to="/profile"
              className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-600 font-semibold text-sm rounded-xl shadow hover:bg-indigo-50 transition-colors"
            >
              Edit Profile <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* ── Feature cards ── */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4">
          {user.role === 'Student' ? 'What would you like to do?' : 'Your tools'}
        </h2>

        {user.role === 'Student' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              to="/directory"
              icon={Users}
              iconBg="bg-indigo-50 dark:bg-indigo-500/10"
              iconColor="text-indigo-600 dark:text-indigo-400"
              title="Find a Mentor"
              description="Browse our curated directory of active alumni. Send mentorship requests directly to industry leaders."
            />
            <FeatureCard
              to="/referrals"
              icon={Building}
              iconBg="bg-sky-50 dark:bg-sky-500/10"
              iconColor="text-sky-600 dark:text-sky-400"
              title="Request Referrals"
              description="Found your dream job? Drop your resume to alumni at that company and request an internal referral."
            />
            <FeatureCard
              to="/ai"
              icon={Sparkles}
              iconBg="bg-emerald-50 dark:bg-emerald-500/10"
              iconColor="text-emerald-600 dark:text-emerald-400"
              title="NexStep AI"
              description="Analyze your resume, generate personalized career roadmaps, and find your skills gap — powered by GenAI."
              badge="AI"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FeatureCard
              to="/mentorship"
              icon={UserCheck}
              iconBg="bg-purple-50 dark:bg-purple-500/10"
              iconColor="text-purple-600 dark:text-purple-400"
              title="Manage Mentorships"
              description="Review and approve incoming requests from students searching for guidance in your domain."
            />
            <FeatureCard
              to="/referrals"
              icon={Inbox}
              iconBg="bg-amber-50 dark:bg-amber-500/10"
              iconColor="text-amber-600 dark:text-amber-400"
              title="Evaluate Referrals"
              description="Audit incoming candidate resumes rapidly. Accept or reject candidates matching roles at your company."
            />
          </div>
        )}
      </div>

      {/* ── Secondary quick-links (Student only) ── */}
      {user.role === 'Student' && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { to: '/ai', icon: FileText, label: 'Analyze Resume', color: 'text-indigo-500 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
              { to: '/ai', icon: TrendingUp, label: 'Career Roadmap', color: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
              { to: '/directory', icon: Star, label: 'Top Alumni', color: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
              { to: '/pricing', icon: Zap, label: 'Upgrade Plan', color: 'text-purple-500 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/10' },
            ].map(({ to, icon: Icon, label, color, bg }) => (
              <Link
                key={label}
                to={to}
                className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-center group"
              >
                <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 leading-tight">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper: time-of-day greeting
function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

export default Dashboard;
