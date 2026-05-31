import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { normalizeEmail, isAllowedInstitutionEmail, ALLOWED_EMAIL_MESSAGE } from '../utils/emailDomain';
import { FaBus, FaGoogle } from 'react-icons/fa';
import { HiMail, HiLockClosed, HiArrowRight, HiEye, HiEyeOff } from 'react-icons/hi';
import toast from 'react-hot-toast';

const StudentLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleDemoSignIn = async () => {
    const demoEmail = 'asif@student.cuet.ac.bd';
    const demoPassword = ['student', '123'].join('');
    setEmail(demoEmail);
    setPassword(demoPassword);
    setLoading(true);
    try {
      await login(demoEmail, demoPassword);
      toast.success('Logged in as Demo Student!');
      navigate('/student/dashboard');
    } catch {
      toast.error('Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const normalizedEmail = normalizeEmail(email);

    if (!isAllowedInstitutionEmail(normalizedEmail)) {
      return toast.error(ALLOWED_EMAIL_MESSAGE);
    }

    setLoading(true);
    try {
      const user = await login(normalizedEmail, password);
      if (user.role !== 'student') {
        toast.error('Please use the correct login portal for your role');
        return;
      }
      toast.success('Welcome back!');
      navigate('/student/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      console.log('[GOOGLE AUTH] Step 1: Starting signInWithPopup...');
      const result = await signInWithPopup(auth, googleProvider);
      console.log('[GOOGLE AUTH] Step 2: Popup success, email:', result.user.email);
      if (!isAllowedInstitutionEmail(result.user.email)) {
        console.log('[GOOGLE AUTH] Step 2b: Email NOT allowed, signing out');
        await signOut(auth);
        toast.error(ALLOWED_EMAIL_MESSAGE);
        return;
      }
      console.log('[GOOGLE AUTH] Step 3: Email allowed, getting ID token...');
      const credential = await result.user.getIdToken();
      console.log('[GOOGLE AUTH] Step 4: Got ID token, calling backend /auth/google...');
      const user = await googleLogin(credential, 'student');
      console.log('[GOOGLE AUTH] Step 5: Backend response, role:', user.role);
      if (user.role !== 'student') {
        toast.error('This account is registered as ' + user.role + '. Use the correct portal.');
        return;
      }
      toast.success('Welcome back!');
      navigate('/student/dashboard');
    } catch (error) {
      console.error('[GOOGLE AUTH] ERROR:', error);
      if (error.code !== 'auth/popup-closed-by-user') {
        toast.error(error.response?.data?.message || 'Google login failed: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-dark-50 dark:from-dark-800 to-primary-50 dark:to-dark-700 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl mb-4 shadow-lg">
            <FaBus className="text-white text-2xl" />
          </div>
          <h1 className="text-2xl font-extrabold text-dark-900 dark:text-white">Student Login</h1>
          <p className="text-dark-500 dark:text-dark-400 mt-1 text-sm">
            Welcome back! Sign in to your account
          </p>
        </div>

        <div className="card !p-8">
          {/* Demo Login Quick Access */}
          <div className="mb-6 bg-primary-50 dark:bg-primary-950/20 border border-primary-100 dark:border-primary-900/40 rounded-xl p-4 text-center">
            <p className="text-xs font-bold text-primary-800 dark:text-primary-300 mb-2 uppercase tracking-wide">
              Recruiter Quick Access
            </p>
            <button
              onClick={handleDemoSignIn}
              disabled={loading}
              type="button"
              className="w-full btn-primary text-xs !py-2 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              Try as Demo Student (asif@student.cuet.ac.bd)
            </button>
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            type="button"
            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-dark-600 border-2 border-dark-200 dark:border-dark-500 text-dark-700 dark:text-dark-200 hover:bg-dark-50 dark:hover:bg-dark-500 hover:border-dark-300 font-semibold py-3 px-4 rounded-xl transition-all shadow-sm"
          >
            <FaGoogle className="text-red-500 text-lg" />
            Sign in with Google
          </button>

          <div className="relative flex items-center my-6">
            <div className="flex-grow border-t border-dark-200 dark:border-dark-600"></div>
            <span className="flex-shrink-0 mx-4 text-dark-400 dark:text-dark-500 text-xs font-medium">
              OR
            </span>
            <div className="flex-grow border-t border-dark-200 dark:border-dark-600"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-dark-700 dark:text-dark-200 mb-1.5">
                Email
              </label>
              <div className="relative">
                <HiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field !pl-10"
                  placeholder="your.email@cuet.ac.bd"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-dark-700 dark:text-dark-200 mb-1.5">
                Password
              </label>
              <div className="relative">
                <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field !pl-10 !pr-10"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600 z-10 p-1"
                >
                  {showPassword ? <HiEyeOff className="text-lg" /> : <HiEye className="text-lg" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 !py-3"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In <HiArrowRight />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-dark-500 dark:text-dark-400 mt-6">
            Don't have an account?{' '}
            <Link
              to="/student/register"
              className="text-primary-600 dark:text-primary-400 font-semibold hover:text-primary-700 dark:hover:text-primary-300"
            >
              Register here
            </Link>
          </p>
          <p className="text-center text-sm text-dark-400 dark:text-dark-500 mt-2">
            Are you a supervisor?{' '}
            <Link
              to="/supervisor/login"
              className="text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 dark:hover:text-primary-300"
            >
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;
