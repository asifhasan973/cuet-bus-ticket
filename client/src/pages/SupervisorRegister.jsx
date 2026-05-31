import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import { normalizeEmail, isAllowedInstitutionEmail, ALLOWED_EMAIL_MESSAGE } from '../utils/emailDomain';
import { FaBus, FaGoogle } from 'react-icons/fa';
import {
  HiMail,
  HiLockClosed,
  HiUser,
  HiIdentification,
  HiArrowRight,
  HiEye,
  HiEyeOff,
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const SupervisorRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    employeeId: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const { startGoogleSignIn, isProcessingRedirect } = useGoogleAuth('supervisor', (user) => {
    toast.success('Welcome! Account created successfully');
    navigate('/supervisor/dashboard');
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    const normalizedEmail = normalizeEmail(formData.email);
    if (!isAllowedInstitutionEmail(normalizedEmail)) {
      return toast.error(ALLOWED_EMAIL_MESSAGE);
    }

    setLoading(true);
    try {
      const res = await register({ ...formData, email: normalizedEmail, role: 'supervisor' });
      if (res && res.pendingApproval) {
        toast.success('Registration submitted! Account pending administrator approval.', {
          duration: 6000,
        });
        navigate('/supervisor/login');
      } else {
        toast.success('Registration successful!');
        navigate('/supervisor/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    startGoogleSignIn();
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-dark-50 dark:from-dark-800 to-accent-50 dark:to-dark-700 p-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-accent-500 to-accent-700 rounded-2xl mb-4 shadow-lg">
            <FaBus className="text-white text-2xl" />
          </div>
          <h1 className="text-2xl font-extrabold text-dark-900 dark:text-white">
            Supervisor Registration
          </h1>
          <p className="text-dark-500 dark:text-dark-400 mt-1 text-sm">
            Create your supervisor account
          </p>
        </div>

        {/* Disclaimer Alert */}
        <div className="bg-warning-50 dark:bg-warning-950/20 border border-warning-200 dark:border-warning-800/50 rounded-xl p-4 mb-6 text-sm text-warning-700 dark:text-warning-400">
          <p className="font-semibold flex items-center gap-2 mb-1">⚠️ Verification Disclaimer</p>
          Supervisor accounts must be verified and approved by an administrator before access to the
          manifest and scanning tools is granted.
        </div>

        <div className="card !p-8">
          {/* Google Sign Up */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading || isProcessingRedirect}
            type="button"
            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-dark-600 border-2 border-dark-200 dark:border-dark-500 text-dark-700 dark:text-dark-200 hover:bg-dark-50 dark:hover:bg-dark-500 hover:border-dark-300 font-semibold py-3 px-4 rounded-xl transition-all shadow-sm"
          >
            {isProcessingRedirect ? (
              <>
                <div className="w-5 h-5 border-2 border-dark-300 border-t-dark-600 rounded-full animate-spin" />
                Signing up...
              </>
            ) : (
              <>
                <FaGoogle className="text-red-500 text-lg" />
                Sign up with Google
              </>
            )}
          </button>

          <div className="relative flex items-center my-6">
            <div className="flex-grow border-t border-dark-200 dark:border-dark-600"></div>
            <span className="flex-shrink-0 mx-4 text-dark-400 dark:text-dark-500 text-xs font-medium">
              OR
            </span>
            <div className="flex-grow border-t border-dark-200 dark:border-dark-600"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-dark-700 dark:text-dark-200 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <HiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
                <input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field !pl-10"
                  placeholder="Your full name"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-dark-700 dark:text-dark-200 mb-1.5">
                Email
              </label>
              <div className="relative">
                <HiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field !pl-10"
                  placeholder="your.email@cuet.ac.bd"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-dark-700 dark:text-dark-200 mb-1.5">
                Employee ID
              </label>
              <div className="relative">
                <HiIdentification className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
                <input
                  name="employeeId"
                  type="text"
                  value={formData.employeeId}
                  onChange={handleChange}
                  className="input-field !pl-10"
                  placeholder="EMP001"
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
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field !pl-10 !pr-10"
                  placeholder="Min 6 characters"
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
            <div>
              <label className="block text-sm font-semibold text-dark-700 dark:text-dark-200 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input-field !pl-10 !pr-10"
                  placeholder="Repeat your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600 z-10 p-1"
                >
                  {showConfirmPassword ? (
                    <HiEyeOff className="text-lg" />
                  ) : (
                    <HiEye className="text-lg" />
                  )}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-success w-full flex items-center justify-center gap-2 !py-3 !mt-6"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Create Account <HiArrowRight />
                </>
              )}
            </button>
          </form>
          <p className="text-center text-sm text-dark-500 dark:text-dark-400 mt-6">
            Already have an account?{' '}
            <Link
              to="/supervisor/login"
              className="text-accent-600 dark:text-accent-400 font-semibold hover:text-accent-700 dark:hover:text-accent-300"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SupervisorRegister;
