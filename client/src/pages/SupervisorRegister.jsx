import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { FaBus, FaGoogle } from 'react-icons/fa';
import { HiMail, HiLockClosed, HiUser, HiIdentification, HiAcademicCap, HiArrowRight } from 'react-icons/hi';
import toast from 'react-hot-toast';

const SupervisorRegister = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    employeeId: '', department: '',
  });
  const [loading, setLoading] = useState(false);
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    setLoading(true);
    try {
      await register({ ...formData, role: 'supervisor' });
      toast.success('Registration successful!');
      navigate('/supervisor/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const credential = await result.user.getIdToken();
      const user = await googleLogin(credential, 'supervisor');
      toast.success('Welcome! Account created successfully');
      navigate('/supervisor/dashboard');
    } catch (error) {
      if (error.code !== 'auth/popup-closed-by-user') {
        toast.error(error.response?.data?.message || 'Google sign-up failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-dark-50 to-accent-50 p-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-accent-500 to-accent-700 rounded-2xl mb-4 shadow-lg">
            <FaBus className="text-white text-2xl" />
          </div>
          <h1 className="text-2xl font-extrabold text-dark-900">Supervisor Registration</h1>
          <p className="text-dark-500 mt-1 text-sm">Create your supervisor account</p>
        </div>

        <div className="card !p-8">
          {/* Google Sign Up */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            type="button"
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-dark-200 text-dark-700 hover:bg-dark-50 hover:border-dark-300 font-semibold py-3 px-4 rounded-xl transition-all shadow-sm"
          >
            <FaGoogle className="text-red-500 text-lg" />
            Sign up with Google
          </button>

          <div className="relative flex items-center my-6">
            <div className="flex-grow border-t border-dark-200"></div>
            <span className="flex-shrink-0 mx-4 text-dark-400 text-xs font-medium">OR</span>
            <div className="flex-grow border-t border-dark-200"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-dark-700 mb-1.5">Full Name</label>
              <div className="relative">
                <HiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
                <input name="name" type="text" value={formData.name} onChange={handleChange}
                  className="input-field !pl-10" placeholder="Your full name" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-dark-700 mb-1.5">Email</label>
              <div className="relative">
                <HiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
                <input name="email" type="email" value={formData.email} onChange={handleChange}
                  className="input-field !pl-10" placeholder="your.email@cuet.ac.bd" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-dark-700 mb-1.5">Employee ID</label>
                <div className="relative">
                  <HiIdentification className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
                  <input name="employeeId" type="text" value={formData.employeeId} onChange={handleChange}
                    className="input-field !pl-10" placeholder="EMP001" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-dark-700 mb-1.5">Department</label>
                <div className="relative">
                  <HiAcademicCap className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
                  <select name="department" value={formData.department} onChange={handleChange}
                    className="input-field !pl-10" required>
                    <option value="">Select</option>
                    {['CSE', 'EEE', 'ME', 'CE', 'URP', 'Arch', 'PME', 'BME'].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-dark-700 mb-1.5">Password</label>
              <div className="relative">
                <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
                <input name="password" type="password" value={formData.password} onChange={handleChange}
                  className="input-field !pl-10" placeholder="Min 6 characters" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-dark-700 mb-1.5">Confirm Password</label>
              <div className="relative">
                <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
                <input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange}
                  className="input-field !pl-10" placeholder="Repeat your password" required />
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="btn-success w-full flex items-center justify-center gap-2 !py-3 !mt-6">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Create Account <HiArrowRight /></>
              )}
            </button>
          </form>
          <p className="text-center text-sm text-dark-500 mt-6">
            Already have an account?{' '}
            <Link to="/supervisor/login" className="text-accent-600 font-semibold hover:text-accent-700">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SupervisorRegister;
