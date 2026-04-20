import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const getRoleHome = (role) => {
  switch (role) {
    case 'student':      return '/student/dashboard';
    case 'alumni':       return '/alumni/dashboard';
    case 'collegeAdmin': return '/admin/college';
    case 'superAdmin':   return '/admin/super';
    default:             return '/student/dashboard';
  }
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 m-auto w-6 h-6 bg-sky-500 rounded-full animate-pulse blur-sm"></div>
        </div>
        <p className="mt-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">Initializing Nexus Hub</p>
      </div>
    );
  }

  // If allowedRoles is null, this is a public-only route (like Login/Signup)
  // Authenticated users should be redirected home instead of seeing the login page again.
  if (allowedRoles === null) {
    if (user) return <Navigate to={getRoleHome(user.role)} replace />;
    return children || <Outlet />;
  }

  // Standard protection for all other routes
  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getRoleHome(user.role)} replace />;
  }

  return children || <Outlet />;
};

export default ProtectedRoute;
