import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { ALLOWED_EMAIL_MESSAGE, isAllowedInstitutionEmail, normalizeEmail } from '../utils/emailDomain';
import { FaBus, FaGoogle } from 'react-icons/fa';
import { HiMail, HiLockClosed, HiArrowRight, HiEye, HiEyeOff } from 'react-icons/hi';
import toast from 'react-hot-toast';

const SupervisorLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const normalizedEmail = normalizeEmail(email);

    if (!isAllowedInstitutionEmail(normalizedEmail)) {
      return toast.error(ALLOWED_EMAIL_MESSAGE);
    }

    setLoading(true);
    try {
      const user = await login(normalizedEmail, password);
      if (user.role === 'admin') {
        toast.success('Welcome back, Admin!');
        navigate('/admin/dashboard');
      } else if (user.role === 'supervisor') {
        toast.success('Welcome back!');
        navigate('/supervisor/dashboard');
      } else {
        toast.error('Please use the student login portal');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      if (!isAllowedInstitutionEmail(result.user.email)) {
        await signOut(auth);
        toast.error(ALLOWED_EMAIL_MESSAGE);
        return;
      }
      const credential = await result.user.getIdToken();
      const user = await googleLogin(credential, 'supervisor');
      if (user.role === 'admin') {
        toast.success('Welcome back, Admin!');
        navigate('/admin/dashboard');
      } else if (user.role === 'supervisor') {
        toast.success('Welcome back!');
        navigate('/supervisor/dashboard');
      } else {
        toast.error('This account is registered as student. Use the Student Login portal.');
      }
    } catch (error) {
      if (error.code !== 'auth/popup-closed-by-user') {
        toast.error(error.response?.data?.message || 'Google login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-dark-50 to-accent-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-accent-500 to-accent-700 rounded-2xl mb-4 shadow-lg">
            <FaBus className="text-white text-2xl" />
          </div>
          <h1 className="text-2xl font-extrabold text-dark-900">Supervisor Login</h1>
          <p className="text-dark-500 mt-1 text-sm">Access the supervisor & admin dashboard</p>
        </div>

        <div className="card !p-8">
          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            type="button"
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-dark-200 text-dark-700 hover:bg-dark-50 hover:border-dark-300 font-semibold py-3 px-4 rounded-xl transition-all shadow-sm"
          >
            <FaGoogle className="text-red-500 text-lg" />
            Sign in with Google
          </button>

          <div className="relative flex items-center my-6">
            <div className="flex-grow border-t border-dark-200"></div>
            <span className="flex-shrink-0 mx-4 text-dark-400 text-xs font-medium">OR</span>
            <div className="flex-grow border-t border-dark-200"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-dark-700 mb-1.5">Email</label>
              <div className="relative">
                <HiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="input-field !pl-10" placeholder="your.email@cuet.ac.bd" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-dark-700 mb-1.5">Password</label>
              <div className="relative">
                <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                  className="input-field !pl-10 !pr-10" placeholder="Enter your password" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600 z-10 p-1">
                  {showPassword ? <HiEyeOff className="text-lg" /> : <HiEye className="text-lg" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="btn-success w-full flex items-center justify-center gap-2 !py-3">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In <HiArrowRight /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-dark-500 mt-6">
            Don't have an account?{' '}
            <Link to="/supervisor/register" className="text-accent-600 font-semibold hover:text-accent-700">Register here</Link>
          </p>
          <p className="text-center text-sm text-dark-400 mt-2">
            Are you a student?{' '}
            <Link to="/student/login" className="text-primary-600 font-medium hover:text-primary-700">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SupervisorLogin;
