import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { ChevronRight, ShieldCheck, Sparkles } from 'lucide-react';

const ResponsiveBackground = () => (
  <div className="cinematic-bg">
    <div 
      className="absolute inset-0 z-0 opacity-60 transition-opacity duration-1000"
      style={{ background: 'url(/assets/login-elite-bg.png) center/cover no-repeat' }}
    />
    <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] z-[1]" />
  </div>
);

const CampusNexusLogo = () => (
  <div className="flex items-center gap-3">
    <div className="w-8 h-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg flex items-center justify-center">
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 4L4 8L12 12L20 8L12 4Z" fill="currentColor" />
        <path d="M4 12L12 16L20 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
    <span className="text-lg font-bold text-white tracking-tight">Campus Nexus</span>
  </div>
);

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const getRoleHome = (role) => {
    switch (role) {
      case 'student':      return '/student/dashboard';
      case 'alumni':       return '/alumni/dashboard';
      case 'collegeAdmin': return '/admin/college';
      case 'superAdmin':   return '/admin/super';
      default:             return '/student/dashboard';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        navigate(getRoleHome(result.user?.role));
      } else {
        setError(result.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('Connection failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-6 font-inter overflow-hidden bg-slate-950">
      <ResponsiveBackground />

      <div className="relative z-10 w-full max-w-[520px] animate-in fade-in slide-in-from-bottom-6 duration-1000">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 px-4">
           <CampusNexusLogo />
           <p className="text-sm font-medium text-white/40">
              New here? <Link to="/signup" className="text-white hover:text-sky-400 transition-colors font-bold underline underline-offset-8 decoration-sky-500/50">Register</Link>
           </p>
        </div>

        {/* Login Card */}
        <div className="pristine-card luminous-card p-10 md:p-14 border border-white/10">
          <div className="space-y-10">
            <div className="space-y-1 text-center">
               <h1 className="text-3xl font-bold text-white tracking-tight">Welcome Back</h1>
               <p className="text-white/40 text-sm font-medium tracking-wide">Sign in to your professional portal</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-bold text-center animate-in zoom-in-95">
                  {error}
                </div>
              )}

              <div className="space-y-6">
                {/* Email Address */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-white/50 ml-2">Email Address</label>
                  <input
                    name="email" type="email" required value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="pristine-input px-4"
                  />
                </div>

                {/* Password Address */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center px-2">
                    <label className="text-xs font-medium text-white/50">Password</label>
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[10px] font-bold text-white/30 hover:text-white uppercase tracking-wider transition-colors"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  <input
                    name="password" type={showPassword ? 'text' : 'password'} required value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pristine-input px-4"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold text-base hover:from-sky-600 hover:to-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 group shadow-[0_10px_30px_rgba(14,165,233,0.3)]"
              >
                {isSubmitting ? "Autheticating..." : (
                  <>
                    <span>Sign In</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-[9px] font-bold text-white/40 uppercase tracking-widest leading-tight">
                  Secure<br /><span className="text-white/60">Access</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="text-[9px] font-bold text-white/40 uppercase tracking-widest leading-tight">
                  Verified<br /><span className="text-white/60">Profile</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-[10px] text-white/20 font-bold uppercase tracking-[0.3em]">
           Official Institutional Gateway
        </p>
      </div>
    </div>
  );
};

export default Login;
