import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import {
  Check, Sparkles, Gem, Zap, ArrowRight, Brain,
  ShieldAlert, GraduationCap, Crown, Star, Shield, ChevronRight
} from 'lucide-react';

/* ── Razorpay loader ─────────────────────────────────────────────────────── */
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

/* ── Plan definitions ────────────────────────────────────────────────────── */
const plans = [
  {
    id: 'Free',
    name: 'Starter',
    tagline: 'Get started for free',
    price: '₹0',
    period: 'forever',
    tokens: 50,
    icon: Zap,
    accentFrom: '#64748b',
    accentTo: '#94a3b8',
    cardBg: 'bg-slate-50 dark:bg-slate-900/60',
    border: 'border-slate-200 dark:border-slate-800',
    iconBg: 'bg-slate-100 dark:bg-slate-800',
    iconColor: 'text-slate-500',
    checkColor: 'text-slate-500',
    btnClass: 'bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-not-allowed opacity-70',
    disabled: true,
    popular: false,
    features: [
      '50 AI Career Credits',
      'Student Directory Access',
      'Public Profile Listing',
      'Standard Mentorship Access',
    ],
  },
  {
    id: 'Monthly',
    name: 'Professional',
    tagline: 'Most popular for students',
    price: '₹199',
    period: '/ month',
    tokens: 300,
    icon: Brain,
    accentFrom: '#0ea5e9',
    accentTo: '#6366f1',
    cardBg: 'bg-white dark:bg-slate-900/80',
    border: 'border-sky-400/50 dark:border-sky-500/40',
    iconBg: 'bg-sky-50 dark:bg-sky-500/10',
    iconColor: 'text-sky-500',
    checkColor: 'text-sky-500',
    btnClass: 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white shadow-xl shadow-sky-500/25',
    disabled: false,
    popular: true,
    features: [
      '300 AI Credits / month',
      'AI Resume Optimization',
      'Career Roadmap Generator',
      'Unlimited Mentorship Access',
      'Priority Referral Processing',
    ],
  },
  {
    id: 'Yearly',
    name: 'Elite',
    tagline: 'Best value — save 37%',
    price: '₹1,499',
    period: '/ year',
    tokens: 1500,
    icon: Gem,
    accentFrom: '#10b981',
    accentTo: '#0d9488',
    cardBg: 'bg-white dark:bg-slate-900/80',
    border: 'border-emerald-400/50 dark:border-emerald-500/40',
    iconBg: 'bg-emerald-50 dark:bg-emerald-500/10',
    iconColor: 'text-emerald-600',
    checkColor: 'text-emerald-600',
    btnClass: 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-xl shadow-emerald-500/25',
    disabled: false,
    popular: false,
    features: [
      '1500 AI Credits / year',
      'All Professional Features',
      'Global Network Visibility',
      'Personal Career Analytics',
      'Dedicated Priority Support',
      'Early Feature Access',
    ],
  },
];

/* ── Restricted view ─────────────────────────────────────────────────────── */
const RestrictedView = ({ role }) => (
  <div className="max-w-3xl mx-auto py-32 px-6 text-center animate-in fade-in slide-in-from-bottom-6 duration-700">
    <div className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-amber-50 dark:bg-amber-500/10 border-2 border-amber-200 dark:border-amber-500/30 flex items-center justify-center shadow-xl shadow-amber-500/10">
      <ShieldAlert className="w-12 h-12 text-amber-500" />
    </div>
    <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-full text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest mb-6">
      <Shield className="w-3 h-3" /> Access Restricted
    </div>
    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-4">Student Plans Only</h1>
    <p className="text-base text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-lg mx-auto mb-10">
      Premium plans are exclusively for <span className="text-sky-500 font-bold">students</span>.
      As a <span className="text-slate-900 dark:text-white font-bold capitalize">{role}</span>,
      you already have full institutional access included.
    </p>
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
      <Link to="/" className="btn-primary px-8 py-3.5 flex items-center gap-2">
        Back to Dashboard <ArrowRight className="w-4 h-4" />
      </Link>
      <Link to="/directory" className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
        <GraduationCap className="w-4 h-4" /> Explore Network
      </Link>
    </div>
  </div>
);

/* ── Main Pricing Component ─────────────────────────────────────────────── */
const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(null);
  const [hoveredPlan, setHoveredPlan] = useState(null);

  if (user && user.role !== 'student') return <RestrictedView role={user.role} />;

  const handleUpgrade = async (planId) => {
    if (planId === 'Free') return;
    setLoading(planId);
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.error('Payment system failed to initialize.');
        setLoading(null);
        return;
      }
      const orderRes = await api.post('/payment/create-order', { planId });
      const orderToken = orderRes.data;
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || '',
        amount: orderToken.amount,
        currency: orderToken.currency,
        name: 'Campus Nexus',
        description: `Upgrade to ${planId} Plan`,
        order_id: orderToken.id,
        handler: async (response) => {
          toast.success('Payment received. Verifying...');
          try {
            await api.post('/payment/verify', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_signature:  response.razorpay_signature,
              planId,
            });
            toast.success(`${planId} Plan activated! 🎉`);
            window.location.href = '/';
          } catch {
            toast.error('Payment verification failed. Contact support.');
          }
        },
        theme: { color: '#0ea5e9' },
        modal: {
          ondismiss: () => setLoading(null),
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (r) => toast.error(r.error.description || 'Payment failed.'));
      rzp.open();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to start checkout. Try again.');
      setLoading(null);
    }
  };

  const currentTokens = user?.tokens ?? 0;
  const currentPlan   = user?.planName || 'Free';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-20 animate-in fade-in slide-in-from-bottom-6 duration-700">

      {/* ── Hero Header ── */}
      <div className="text-center pt-12 pb-14 space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/25">
          <Sparkles className="w-4 h-4 text-sky-500" />
          <span className="text-[10px] font-black text-sky-600 dark:text-sky-400 uppercase tracking-widest">Membership Plans</span>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
          Accelerate Your<br />
          <span className="gradient-text-sky">Career Journey</span>
        </h1>
        <p className="text-base text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto leading-relaxed">
          Unlock AI-powered career tools, priority referrals, and unlimited mentorship from top professionals.
        </p>

        {/* Current Status Bar */}
        <div className="inline-flex items-center gap-6 px-6 py-3 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="text-sm font-bold text-slate-900 dark:text-white">{currentTokens} tokens</span>
            <span className="text-xs text-slate-400 font-medium">remaining</span>
          </div>
          <div className="w-px h-4 bg-slate-200 dark:bg-white/10" />
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-bold text-slate-900 dark:text-white">{currentPlan}</span>
            <span className="text-xs text-slate-400 font-medium">plan</span>
          </div>
        </div>
      </div>

      {/* ── Plan Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start">
        {plans.map((plan) => {
          const Icon      = plan.icon;
          const isPopular = plan.popular;
          const isLoading = loading === plan.id;
          const isCurrent = currentPlan === plan.id || (currentPlan === 'Starter' && plan.id === 'Free');

          return (
            <div
              key={plan.id}
              onMouseEnter={() => setHoveredPlan(plan.id)}
              onMouseLeave={() => setHoveredPlan(null)}
              className={`
                relative flex flex-col rounded-3xl border p-8 transition-all duration-400
                ${plan.cardBg} ${plan.border}
                ${isPopular ? 'shadow-2xl shadow-sky-500/10 scale-[1.02] md:scale-[1.03]' : 'hover:shadow-xl hover:-translate-y-1'}
                ${hoveredPlan === plan.id && !isPopular ? 'border-sky-300/50 dark:border-sky-500/30' : ''}
              `}
            >
              {/* Popular badge */}
              {isPopular && (
                <div className="absolute -top-4 inset-x-0 flex justify-center">
                  <div className="flex items-center gap-1.5 px-5 py-1.5 rounded-full text-white text-[10px] font-black uppercase tracking-widest shadow-lg"
                    style={{ background: 'linear-gradient(90deg, #0ea5e9, #6366f1)' }}>
                    <Star className="w-3 h-3 fill-white" /> Most Popular
                  </div>
                </div>
              )}

              {/* Current plan indicator */}
              {isCurrent && (
                <div className="absolute top-4 right-4 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase tracking-widest">
                  ✓ Current
                </div>
              )}

              {/* Icon */}
              <div className={`w-12 h-12 rounded-2xl ${plan.iconBg} flex items-center justify-center mb-5 shadow-sm`}>
                <Icon className={`w-6 h-6 ${plan.iconColor}`} />
              </div>

              {/* Plan name & tagline */}
              <div className="mb-5">
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-1">{plan.name}</h3>
                <p className="text-xs text-slate-400 font-medium">{plan.tagline}</p>
              </div>

              {/* Price */}
              <div className="mb-5 pb-5 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-baseline gap-1.5">
                  <span
                    className="text-4xl font-black tracking-tight"
                    style={{ background: `linear-gradient(135deg, ${plan.accentFrom}, ${plan.accentTo})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
                  >
                    {plan.price}
                  </span>
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{plan.period}</span>
                </div>
                {/* Token badge */}
                <div className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${plan.iconBg} text-[10px] font-black uppercase tracking-widest`}>
                  <Zap className={`w-3 h-3 ${plan.iconColor} fill-current`} />
                  <span className={plan.iconColor}>{plan.tokens.toLocaleString()} AI Credits</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400 font-medium">
                    <div className={`shrink-0 mt-0.5 w-4 h-4 rounded-full ${plan.iconBg} flex items-center justify-center`}>
                      <Check className={`w-2.5 h-2.5 ${plan.checkColor}`} strokeWidth={3} />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={plan.disabled || isLoading || isCurrent}
                className={`
                  w-full py-3.5 rounded-2xl flex items-center justify-center gap-2.5 font-bold text-sm
                  transition-all duration-300 hover:scale-[1.02] active:scale-[0.97]
                  ${isCurrent
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    : plan.disabled
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                      : plan.btnClass
                  }
                `}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {isCurrent ? '✓ Active Plan' : plan.id === 'Free' ? 'Free Forever' : `Get ${plan.name}`}
                    {!plan.disabled && !isCurrent && <ChevronRight className="w-4 h-4" />}
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* ── Trust Bar ── */}
      <div className="mt-16 pt-10 border-t border-slate-200 dark:border-white/5">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16 text-center">
          {[
            { icon: Shield,   label: 'Secure Payments',    sub: 'Encrypted & processed by Razorpay' },
            { icon: Zap,      label: 'Instant Activation',  sub: 'Tokens credited immediately' },
            { icon: Star,     label: 'Cancel Anytime',      sub: 'No long-term commitment' },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{label}</p>
                <p className="text-xs text-slate-400 font-medium">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;
