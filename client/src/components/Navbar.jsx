import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, LogOut, User, Brain, Bell } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import NotificationCenter from './NotificationCenter';
import SearchBox from './SearchBox';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
                   <svg viewBox="0 0 32 32" fill="none" className="w-5 h-5 shrink-0" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="16" cy="8" r="2.5" fill="white" />
                    <circle cx="7" cy="24" r="2.5" fill="white" />
                    <circle cx="25" cy="24" r="2.5" fill="white" />
                    <circle cx="16" cy="18" r="2" fill="white" fillOpacity="0.75" />
                    <line x1="16" y1="10.5" x2="16" y2="16" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="14.5" y1="19.5" x2="8.5" y2="22" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="17.5" y1="19.5" x2="23.5" y2="22" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Campus Nexus</span>
              </Link>
            </div>
            
            {user && (
              <div className="hidden lg:block flex-1 max-w-md mx-8">
                <SearchBox />
              </div>
            )}
            
            {user && (
              <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
                {/* Common Community Discovery */}
                <Link to="/" className="text-slate-500 hover:text-brand-600 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-brand-500 text-sm font-medium transition-all">Overview</Link>
                <Link to="/directory" className="text-slate-500 hover:text-brand-600 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-brand-500 text-sm font-medium transition-all">Directory</Link>
                
                {/* Student & Alumni Professional Mesh */}
                {(user.role === 'student' || user.role === 'alumni') && (
                  <>
                    <Link to="/mentorship" className="text-slate-500 hover:text-brand-600 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-brand-500 text-sm font-medium transition-all">Mentorship</Link>
                    <Link to="/referrals" className="text-slate-500 hover:text-brand-600 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-brand-500 text-sm font-medium transition-all">Referrals</Link>
                    <Link to="/ai" className="text-brand-500 hover:text-brand-600 inline-flex items-center gap-1.5 px-1 pt-1 border-b-2 border-transparent hover:border-brand-500 text-sm font-semibold group">
                        <Brain className="h-4 w-4 transition-transform group-hover:scale-110" />
                        <span>Career Assistant</span>
                    </Link>
                  </>
                )}

                {/* College Admin Operations */}
                {user.role === 'collegeAdmin' && (
                  <>
                    <Link to="/admin/members" className="text-slate-500 hover:text-brand-600 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-brand-500 text-sm font-medium transition-all">Member Board</Link>
                    <Link to="/admin/campaigns" className="text-slate-500 hover:text-brand-600 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-brand-500 text-sm font-medium transition-all">Giving Hub</Link>
                  </>
                )}

                {/* Super Admin Control Center */}
                {user.role === 'superAdmin' && (
                  <>
                    <Link to="/admin/super/colleges" className="text-slate-500 hover:text-brand-600 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-brand-500 text-sm font-medium transition-all">Colleges</Link>
                    <Link to="/admin/super/requests" className="text-slate-500 hover:text-brand-600 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-brand-500 text-sm font-medium transition-all">Requests</Link>
                    <Link to="/admin/super/revenue" className="text-emerald-600 hover:text-emerald-700 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-brand-500 text-sm font-bold transition-all">Revenue</Link>
                  </>
                )}
              </div>
            )}
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-1">
            {user ? (
              <>
                <div className="flex flex-col items-end mr-6">
                   <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">{user.role} Portal</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <NotificationCenter />
                  
                  <Link to="/profile" className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <User className="h-5 w-5" />
                  </Link>
                  
                  <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-2"></div>

                  <button
                    onClick={handleLogout}
                    className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </>
            ) : (
                <div className="flex items-center space-x-6">
                  <Link to="/login" className="text-slate-500 hover:text-slate-900 font-medium text-sm transition-colors">Log in</Link>
                  <Link to="/signup" className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-brand-500/20 active:scale-95">Get Started</Link>
                </div>
            )}
          </div>

          <div className="-mr-2 flex items-center sm:hidden">
            <button
               onClick={() => setIsMenuOpen(!isMenuOpen)}
               className="inline-flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
      
      {isMenuOpen && user && (
         <div className="sm:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 p-6 space-y-3 animate-in fade-in slide-in-from-top-4 duration-300">
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 rounded-xl text-base font-medium text-slate-600 hover:text-brand-600 hover:bg-brand-50 transition-all font-semibold italic">Dashboard</Link>
            <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 rounded-xl text-base font-medium text-slate-600 hover:text-brand-600 hover:bg-brand-50 transition-all font-semibold italic">Account Profile</Link>
            <button onClick={() => { setIsMenuOpen(false); handleLogout(); }} className="block w-full text-left px-4 py-3 rounded-xl text-base font-medium text-rose-500 hover:bg-rose-50 transition-all font-bold">Sign Out</button>
         </div>
      )}
    </nav>
  );
};

export default Navbar;
