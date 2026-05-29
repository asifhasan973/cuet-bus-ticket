import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/layout/Navbar';
import DashboardLayout from './components/layout/DashboardLayout';
import LoadingSpinner from './components/ui/LoadingSpinner';
import ErrorBoundary from './components/ui/ErrorBoundary';

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
import NotFound from './pages/NotFound';

// Protected Route Component
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  if (!user) return <Navigate to="/" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
};

// Guest Route (redirect if logged in)
const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  if (user) {
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'supervisor') return <Navigate to="/supervisor/dashboard" replace />;
    return <Navigate to="/student/dashboard" replace />;
  }

  return children;
};

// Page transition wrapper
const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

// Animated Routes wrapper
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <PageWrapper>
              <Home />
            </PageWrapper>
          }
        />
        <Route
          path="/routes"
          element={
            <PageWrapper>
              <RoutePage />
            </PageWrapper>
          }
        />

        {/* Auth Routes */}
        <Route
          path="/student/login"
          element={
            <GuestRoute>
              <PageWrapper>
                <StudentLogin />
              </PageWrapper>
            </GuestRoute>
          }
        />
        <Route
          path="/student/register"
          element={
            <GuestRoute>
              <PageWrapper>
                <StudentRegister />
              </PageWrapper>
            </GuestRoute>
          }
        />
        <Route
          path="/supervisor/login"
          element={
            <GuestRoute>
              <PageWrapper>
                <SupervisorLogin />
              </PageWrapper>
            </GuestRoute>
          }
        />
        <Route
          path="/supervisor/register"
          element={
            <GuestRoute>
              <PageWrapper>
                <SupervisorRegister />
              </PageWrapper>
            </GuestRoute>
          }
        />

        {/* Student Routes */}
        <Route
          path="/student"
          element={
            <ProtectedRoute roles={['student']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="dashboard"
            element={
              <PageWrapper>
                <StudentDashboard />
              </PageWrapper>
            }
          />
          <Route
            path="booking"
            element={
              <PageWrapper>
                <SeatBooking />
              </PageWrapper>
            }
          />
          <Route
            path="routes"
            element={
              <PageWrapper>
                <RoutePage />
              </PageWrapper>
            }
          />
          <Route
            path="profile"
            element={
              <PageWrapper>
                <ProfilePage />
              </PageWrapper>
            }
          />
        </Route>

        {/* Supervisor Routes */}
        <Route
          path="/supervisor"
          element={
            <ProtectedRoute roles={['supervisor']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="dashboard"
            element={
              <PageWrapper>
                <SupervisorDashboard />
              </PageWrapper>
            }
          />
          <Route
            path="attendance"
            element={
              <PageWrapper>
                <AttendancePage />
              </PageWrapper>
            }
          />
          <Route
            path="routes"
            element={
              <PageWrapper>
                <RoutePage />
              </PageWrapper>
            }
          />
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['admin']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="dashboard"
            element={
              <PageWrapper>
                <AdminDashboard />
              </PageWrapper>
            }
          />
          <Route
            path="buses"
            element={
              <PageWrapper>
                <AdminBusManagement />
              </PageWrapper>
            }
          />
          <Route
            path="routes"
            element={
              <PageWrapper>
                <RoutePage />
              </PageWrapper>
            }
          />
        </Route>

        {/* Catch all */}
        <Route
          path="*"
          element={
            <PageWrapper>
              <NotFound />
            </PageWrapper>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-dark-50 dark:bg-dark-800 text-dark-800 dark:text-dark-100 transition-colors duration-300">
              <Navbar />
              <AnimatedRoutes />
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
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
