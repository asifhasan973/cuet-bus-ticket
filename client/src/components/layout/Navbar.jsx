import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HiMenu, HiX } from 'react-icons/hi';
import { FaBus, FaUserCircle } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'supervisor') return '/supervisor/dashboard';
    return '/student/dashboard';
  };

  return (
    <nav className="bg-white/80 backdrop-blur-xl border-b border-dark-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group" onClick={() => setIsOpen(false)}>
            <div className="bg-gradient-to-br from-primary-500 to-primary-700 p-2 rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
              <FaBus className="text-white text-lg" />
            </div>
            <div>
              <span className="font-bold text-lg text-dark-900 tracking-tight">CUET Bus</span>
              <span className="text-[10px] block text-dark-400 -mt-1 font-medium">Seat Booking</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/" className="px-4 py-2 text-dark-600 hover:text-primary-600 rounded-lg hover:bg-primary-50 transition-all text-sm font-medium">
              Home
            </Link>
            <Link to="/routes" className="px-4 py-2 text-dark-600 hover:text-primary-600 rounded-lg hover:bg-primary-50 transition-all text-sm font-medium">
              Routes
            </Link>

            {user ? (
              <>
                <Link to={getDashboardLink()} className="px-4 py-2 text-dark-600 hover:text-primary-600 rounded-lg hover:bg-primary-50 transition-all text-sm font-medium">
                  Dashboard
                </Link>
                <div className="w-px h-6 bg-dark-200 mx-2" />
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-dark-50 px-3 py-1.5 rounded-full">
                    <FaUserCircle className="text-primary-500" />
                    <span className="text-sm font-medium text-dark-700">{user.name?.split(' ')[0]}</span>
                    <span className="text-[10px] bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-semibold uppercase">
                      {user.role}
                    </span>
                  </div>
                  <button onClick={handleLogout} className="text-sm text-dark-500 hover:text-danger-500 font-medium transition-colors">
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="w-px h-6 bg-dark-200 mx-2" />
                <Link to="/student/login" className="px-4 py-2 text-dark-600 hover:text-primary-600 rounded-lg hover:bg-primary-50 transition-all text-sm font-medium">
                  Student Login
                </Link>
                <Link to="/supervisor/login" className="btn-primary text-sm !px-4 !py-2">
                  Supervisor Login
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-dark-600 hover:bg-dark-100 transition-colors"
          >
            {isOpen ? <HiX className="text-xl" /> : <HiMenu className="text-xl" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-dark-100 bg-white/95 backdrop-blur-xl">
          <div className="px-4 py-3 space-y-1">
            <Link to="/" onClick={() => setIsOpen(false)} className="block px-4 py-2.5 text-dark-600 hover:text-primary-600 rounded-lg hover:bg-primary-50 transition-all text-sm font-medium">
              Home
            </Link>
            <Link to="/routes" onClick={() => setIsOpen(false)} className="block px-4 py-2.5 text-dark-600 hover:text-primary-600 rounded-lg hover:bg-primary-50 transition-all text-sm font-medium">
              Routes
            </Link>
            {user ? (
              <>
                <Link to={getDashboardLink()} onClick={() => setIsOpen(false)} className="block px-4 py-2.5 text-dark-600 hover:text-primary-600 rounded-lg hover:bg-primary-50 transition-all text-sm font-medium">
                  Dashboard
                </Link>
                <div className="border-t border-dark-100 my-2" />
                <div className="px-4 py-2 flex items-center gap-2">
                  <FaUserCircle className="text-primary-500" />
                  <span className="text-sm font-medium text-dark-700">{user.name}</span>
                  <span className="text-[10px] bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-semibold uppercase">
                    {user.role}
                  </span>
                </div>
                <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-danger-500 hover:bg-danger-50 rounded-lg transition-all text-sm font-medium">
                  Logout
                </button>
              </>
            ) : (
              <>
                <div className="border-t border-dark-100 my-2" />
                <Link to="/student/login" onClick={() => setIsOpen(false)} className="block px-4 py-2.5 text-dark-600 hover:text-primary-600 rounded-lg hover:bg-primary-50 transition-all text-sm font-medium">
                  Student Login
                </Link>
                <Link to="/supervisor/login" onClick={() => setIsOpen(false)} className="block px-4 py-2.5 text-dark-600 hover:text-primary-600 rounded-lg hover:bg-primary-50 transition-all text-sm font-medium">
                  Supervisor Login
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
