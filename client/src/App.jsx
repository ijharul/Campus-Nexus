import { useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, AuthContext } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SocketProvider } from "./contexts/SocketContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/DashboardLayout";

// Pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import StudentDashboard from "./pages/StudentDashboard";
import AlumniDashboard from "./pages/AlumniDashboard";
import AlumniDonations from "./pages/AlumniDonations";
import CollegeAdminDashboard from "./pages/CollegeAdminDashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import Profile from "./pages/Profile";
import Directory from "./pages/Directory";
import Mentorship from "./pages/Mentorship";
import Referrals from "./pages/Referrals";
import StudentPlanner from "./pages/StudentPlanner";
import CareerAssistant from "./pages/NexusIQ";
import Pricing from "./pages/Pricing";
import Chat from "./pages/Chat";
import Notices from "./pages/Notices";
import Leaderboard from "./pages/Leaderboard";
import PublicProfile from "./pages/PublicProfile";

const RoleRedirect = () => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  switch (user.role) {
    case "student": return <Navigate to="/student/dashboard" replace />;
    case "alumni": return <Navigate to="/alumni/dashboard" replace />;
    case "collegeAdmin": return <Navigate to="/admin/college" replace />;
    case "superAdmin": return <Navigate to="/admin/super" replace />;
    default: return <Navigate to="/login" replace />;
  }
};

const ALL_ROLES = ["student", "alumni", "collegeAdmin", "superAdmin"];
const USER_ROLES = ["student", "alumni", "collegeAdmin"];
const CONSUMER_ROLES = ["student", "alumni"];
const MSG_ROLES = ["student", "alumni", "collegeAdmin"];

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <Toaster position="top-right" />
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<ProtectedRoute allowedRoles={null}><Login /></ProtectedRoute>} />
              <Route path="/signup" element={<ProtectedRoute allowedRoles={null}><Signup /></ProtectedRoute>} />
              <Route path="/u/:username" element={<PublicProfile />} />
              <Route path="/" element={<RoleRedirect />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute allowedRoles={ALL_ROLES} />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/student/dashboard" element={<StudentDashboard />} />
                  <Route path="/alumni/dashboard" element={<AlumniDashboard />} />
                  <Route path="/alumni/donations" element={<AlumniDonations />} />
                  <Route path="/admin/college" element={<CollegeAdminDashboard section="overview" />} />
                  <Route path="/admin/college/users" element={<CollegeAdminDashboard section="users" />} />
                  <Route path="/admin/college/reports" element={<CollegeAdminDashboard section="reports" />} />
                  <Route path="/admin/college/campaigns" element={<CollegeAdminDashboard section="campaigns" />} />
                  <Route path="/admin/college/verification" element={<CollegeAdminDashboard section="verification" />} />
                  <Route path="/admin/super" element={<SuperAdminDashboard section="overview" />} />
                  <Route path="/admin/super/colleges" element={<SuperAdminDashboard section="colleges" />} />
                  <Route path="/admin/super/revenue" element={<SuperAdminDashboard section="revenue" />} />
                  <Route path="/admin/super/requests" element={<SuperAdminDashboard section="requests" />} />
                  <Route path="/admin/super/users" element={<SuperAdminDashboard section="users" />} />

                  {/* Shared Pages */}
                  <Route element={<ProtectedRoute allowedRoles={USER_ROLES} />}>
                    <Route path="/profile/:userId" element={<Profile />} />
                    <Route path="/directory" element={<Directory />} />
                    <Route path="/leaderboard" element={<Leaderboard />} />
                    <Route path="/notices" element={<Notices />} />
                  </Route>

                  <Route element={<ProtectedRoute allowedRoles={CONSUMER_ROLES} />}>
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/mentorship" element={<Mentorship />} />
                    <Route path="/referrals" element={<Referrals />} />
                    <Route path="/student/planner" element={<StudentPlanner />} />
                    <Route path="/ai" element={<CareerAssistant />} />
                    <Route path="/pricing" element={<Pricing />} />
                  </Route>

                  <Route element={<ProtectedRoute allowedRoles={MSG_ROLES} />}>
                    <Route path="/chat" element={<Chat />} />
                  </Route>
                </Route>
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
