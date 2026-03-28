import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/layout/Navbar';
import DashboardLayout from './components/layout/DashboardLayout';
import LoadingSpinner from './components/ui/LoadingSpinner';

// Pages
import Home from './pages/Home';
import StudentLogin from './pages/StudentLogin';
import StudentRegister from './pages/StudentRegister';
import SupervisorLogin from './pages/SupervisorLogin';
import SupervisorRegister from './pages/SupervisorRegister';
import StudentDashboard from './pages/StudentDashboard';
import SeatBooking from './pages/SeatBooking';
import RoutePage from './pages/RoutePage';
import ProfilePage from './pages/ProfilePage';
import SupervisorDashboard from './pages/SupervisorDashboard';
import AttendancePage from './pages/AttendancePage';
import AdminDashboard from './pages/AdminDashboard';
import AdminBusManagement from './pages/AdminBusManagement';

// Protected Route Component
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;
  if (!user) return <Navigate to="/" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  
  return children;
};

// Guest Route (redirect if logged in)
const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;
  if (user) {
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'supervisor') return <Navigate to="/supervisor/dashboard" replace />;
    return <Navigate to="/student/dashboard" replace />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-dark-50">
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/routes" element={<RoutePage />} />

            {/* Auth Routes */}
            <Route path="/student/login" element={<GuestRoute><StudentLogin /></GuestRoute>} />
            <Route path="/student/register" element={<GuestRoute><StudentRegister /></GuestRoute>} />
            <Route path="/supervisor/login" element={<GuestRoute><SupervisorLogin /></GuestRoute>} />
            <Route path="/supervisor/register" element={<GuestRoute><SupervisorRegister /></GuestRoute>} />

            {/* Student Routes */}
            <Route path="/student" element={<ProtectedRoute roles={['student']}><DashboardLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="booking" element={<SeatBooking />} />
              <Route path="routes" element={<RoutePage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>

            {/* Supervisor Routes */}
            <Route path="/supervisor" element={<ProtectedRoute roles={['supervisor']}><DashboardLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<SupervisorDashboard />} />
              <Route path="attendance" element={<AttendancePage />} />
              <Route path="routes" element={<RoutePage />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute roles={['admin']}><DashboardLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="buses" element={<AdminBusManagement />} />
              <Route path="routes" element={<RoutePage />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e293b',
            color: '#fff',
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
          },
        }}
      />
    </AuthProvider>
  );
}

export default App;
