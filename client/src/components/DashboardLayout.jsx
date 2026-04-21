import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import Sidebar from './Sidebar';
import NotificationCenter from './NotificationCenter';
import SearchBox from './SearchBox';
import { Menu, X, Search, Zap } from 'lucide-react';

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useContext(AuthContext);
  const location = useLocation();

  // Close sidebar automatically on mobile when route changes
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  return (
    <div className="flex h-screen overflow-hidden font-inter transition-colors duration-200">
      {/* Global Premium Background System */}
      <div className="premium-grainy-bg" />

      {/* Sidebar - Handles its own responsive visibility */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Mobile Header - Visible only on small screens */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-white/5 backdrop-blur-xl bg-white/70 dark:bg-slate-950/20 z-20">
          <div className="flex items-center gap-3">
             <button 
               onClick={() => setIsSidebarOpen(true)}
               className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400"
             >
               <Menu className="w-5 h-5" />
             </button>
             <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tighter">Nexus Hub</span>
          </div>

          <div className="flex items-center gap-3">
             <NotificationCenter />
             <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center text-[10px] font-black text-white shadow-lg shadow-sky-500/20">
               {user?.name?.[0].toUpperCase()}
             </div>
          </div>
        </header>

        {/* Mobile Search Bar - Visible only on small screens */}
        <div className="lg:hidden px-4 py-3 border-b border-slate-200 dark:border-white/5 bg-white/30 dark:bg-slate-950/10 backdrop-blur-sm">
           <SearchBox />
        </div>

        {/* ── Top Utility Bar (Desktop) ── */}
        <header className="hidden lg:flex items-center justify-between px-8 py-4 border-b border-white/[0.06] backdrop-blur-md bg-slate-950/10 z-10">
           <div className="flex-1">
             <SearchBox />
           </div>

           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
                 <Zap className="w-3 h-3 text-amber-500" />
                 <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Nexus IQ Ready</span>
              </div>
              <div className="h-4 w-px bg-white/5" />
              <NotificationCenter />
           </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto hide-scrollbar relative">
          <div className="max-w-[1600px] mx-auto w-full px-4 sm:px-8 py-6 md:py-10">
            <Outlet />
          </div>
        </main>
        
        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default DashboardLayout;
