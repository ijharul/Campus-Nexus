import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Building2,
  GraduationCap,
  UserPlus,
  ChevronRight
} from "lucide-react";

const ResponsiveBackground = ({ role }) => (
  <div className="cinematic-bg">
    {/* Student Background */}
    <div 
      className={`absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out ${role === 'student' ? 'opacity-60' : 'opacity-0'}`}
      style={{ background: 'url(/assets/signup-student.png) center/cover no-repeat' }}
    />
    {/* Alumni Background */}
    <div 
      className={`absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out ${role === 'alumni' ? 'opacity-60' : 'opacity-0'}`}
      style={{ background: 'url(/assets/signup-alumni.png) center/cover no-repeat' }}
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

const Signup = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    batch: '',
    collegeId: '',
    pendingCollege: '',
    pendingCollegeAddress: ''
  });

  const [colleges, setColleges] = useState([]);
  const [loadingColleges, setLoadingColleges] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const res = await api.get('/colleges');
        setColleges(res.data);
      } catch (err) {
        console.error("Error fetching colleges:", err);
      } finally {
        setLoadingColleges(false);
      }
    };
    fetchColleges();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Email validation
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(form.email)) {
      return setError("Please enter a valid email address.");
    }

    // Password validation
    if (form.password.length < 6) {
      return setError("Password must be at least 6 characters long.");
    }
    
    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match. Please try again.");
    }

    setIsSubmitting(true);
    try {
      const signupData = { ...form };
      if (form.role === 'student') delete signupData.batch;
      
      const res = await api.post('/auth/signup', signupData);
      // Backend returns buildUserPayload directly, not wrapped in { success: true }
      if (res.data && res.data._id) {
        toast.success("Account created successfully! Please login to your new dashboard.", {
          duration: 6000,
          icon: '🚀'
        });
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || "Sign up failed. Please check your details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-6 font-inter overflow-y-auto bg-slate-950 custom-scrollbar">
      <ResponsiveBackground role={form.role} />

      <div className="relative z-10 w-full max-w-[580px] animate-in fade-in slide-in-from-bottom-6 duration-1000">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 px-4">
           <CampusNexusLogo />
           <p className="text-sm font-medium text-white/40">
              Already have an account? <Link to="/login" className="text-white hover:text-sky-400 transition-colors font-bold underline underline-offset-8 decoration-sky-500/50">Login here</Link>
           </p>
        </div>

        {/* Signup Card */}
        <div className="pristine-card luminous-card p-10 md:p-14 border border-white/10 max-h-[85vh] overflow-y-auto custom-scrollbar">
          <div className="space-y-10">
            <div className="space-y-1 text-center">
               <h1 className="text-3xl font-bold text-white tracking-tight">Create Account</h1>
               <p className="text-white/40 text-sm font-medium tracking-wide">Join the official college and alumni network</p>
            </div>

            {/* Role Switcher */}
            <div className="liquid-switcher relative group">
               <div 
                 className="liquid-switcher-pill"
                 style={{ 
                   left: '4px', 
                   width: 'calc(50% - 4px)', 
                   transform: `translateX(${form.role === 'alumni' ? '100%' : '0%'})` 
                 }}
               />
               <button 
                 type="button" 
                 onClick={() => setForm({...form, role: 'student'})}
                 className={`liquid-switcher-btn ${form.role === 'student' ? 'text-slate-900 dark:text-white' : 'text-white/40 hover:text-white'}`}
               >
                  Student
               </button>
               <button 
                 type="button" 
                 onClick={() => setForm({...form, role: 'alumni'})}
                 className={`liquid-switcher-btn ${form.role === 'alumni' ? 'text-slate-900 dark:text-white' : 'text-white/40 hover:text-white'}`}
               >
                  Alumni
               </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-bold text-center animate-in zoom-in-95">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-white/50 ml-2">Full Name</label>
                  <input
                    name="name" required onChange={handleChange}
                    placeholder="Enter your name"
                    className="pristine-input px-4"
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-white/50 ml-2">Email Address</label>
                  <input
                    name="email" type="email" required onChange={handleChange}
                    placeholder="yourname@example.com"
                    className="pristine-input px-4"
                  />
                </div>

                {/* College Selection */}
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-medium text-white/50 ml-2">Select Your College</label>
                  <select 
                    name="collegeId" value={form.collegeId} onChange={handleChange} 
                    className="pristine-input px-4 appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-slate-900">Select your college</option>
                    {colleges.map((c) => (<option key={c._id} value={c._id} className="bg-slate-900">{c.name}</option>))}
                    <option value="other" className="bg-slate-900">+ Add my college</option>
                  </select>
                </div>

                {form.collegeId === "other" && (
                   <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3 animate-in zoom-in-95">
                      <input name="pendingCollege" onChange={handleChange} placeholder="College Name" className="pristine-input px-4 shadow-inner" />
                      <input name="pendingCollegeAddress" onChange={handleChange} placeholder="Location" className="pristine-input px-4 shadow-inner" />
                   </div>
                )}

                {/* Graduation Year */}
                {form.role === "alumni" && (
                  <div className="space-y-1 md:col-span-2 animate-in slide-in-from-top-2 duration-500">
                    <label className="text-xs font-medium text-white/50 ml-2">Graduation Year</label>
                    <input
                      name="batch" type="number" required onChange={handleChange}
                      placeholder="e.g. 2018"
                      className="pristine-input px-4"
                    />
                  </div>
                )}

                {/* Password Fields */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-white/50 ml-2">Password</label>
                  <input
                    name="password" type={showPassword ? 'text' : 'password'} required onChange={handleChange}
                    placeholder="••••••••"
                    className="pristine-input px-4"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-white/50 ml-2">Confirm Password</label>
                  <input
                    name="confirmPassword" type={showPassword ? 'text' : 'password'} required onChange={handleChange}
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
                {isSubmitting ? "Creating account..." : (
                  <>
                    <span>Sign Up</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Simple Footer */}
        <p className="mt-6 text-center text-[10px] text-white/20 font-medium tracking-wide px-8">
           Official College and Alumni Network
        </p>
      </div>
    </div>
  );
};

export default Signup;
