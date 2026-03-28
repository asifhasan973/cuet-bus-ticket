import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { FaBus, FaGoogle } from 'react-icons/fa';
import { HiMail, HiLockClosed, HiArrowRight } from 'react-icons/hi';
import toast from 'react-hot-toast';

const StudentLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
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
      const result = await signInWithPopup(auth, googleProvider);
      const credential = await result.user.getIdToken();
      const user = await googleLogin(credential, 'student');
      if (user.role !== 'student') {
        toast.error('This account is registered as ' + user.role + '. Use the correct portal.');
        return;
      }
      toast.success('Welcome back!');
      navigate('/student/dashboard');
    } catch (error) {
      if (error.code !== 'auth/popup-closed-by-user') {
        toast.error(error.response?.data?.message || 'Google login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-dark-50 to-primary-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl mb-4 shadow-lg">
            <FaBus className="text-white text-2xl" />
          </div>
          <h1 className="text-2xl font-extrabold text-dark-900">Student Login</h1>
          <p className="text-dark-500 mt-1 text-sm">Welcome back! Sign in to your account</p>
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
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="input-field !pl-10" placeholder="Enter your password" required />
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 !py-3">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In <HiArrowRight /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-dark-500 mt-6">
            Don't have an account?{' '}
            <Link to="/student/register" className="text-primary-600 font-semibold hover:text-primary-700">Register here</Link>
          </p>
          <p className="text-center text-sm text-dark-400 mt-2">
            Are you a supervisor?{' '}
            <Link to="/supervisor/login" className="text-primary-600 font-medium hover:text-primary-700">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;
