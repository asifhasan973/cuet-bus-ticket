import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { HiMenu, HiX, HiSun, HiMoon } from 'react-icons/hi';
import { FaBus, FaUserCircle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
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
    <nav className="bg-white/90 dark:bg-dark-800/90 backdrop-blur-xl border-b border-dark-100 dark:border-dark-600 sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group" onClick={() => setIsOpen(false)}>
            <motion.div
              className="bg-gradient-to-br from-primary-500 to-primary-700 p-2 rounded-xl shadow-sm group-hover:shadow-md transition-shadow"
              whileHover={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.5 }}
            >
              <FaBus className="text-white text-lg" />
            </motion.div>
            <div>
              <span className="font-bold text-lg text-dark-900 dark:text-white tracking-tight transition-colors">CUETGo</span>
              <span className="text-[10px] block text-dark-400 dark:text-dark-500 -mt-1 font-medium transition-colors">Seat Booking</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/" className="px-4 py-2 text-dark-600 dark:text-dark-300 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-all text-sm font-medium">
              Home
            </Link>
            <Link to="/routes" className="px-4 py-2 text-dark-600 dark:text-dark-300 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-all text-sm font-medium">
              Routes
            </Link>

            {user ? (
              <>
                <Link to={getDashboardLink()} className="px-4 py-2 text-dark-600 dark:text-dark-300 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-all text-sm font-medium">
                  Dashboard
                </Link>
                <div className="w-px h-6 bg-dark-200 dark:bg-dark-600 mx-2" />
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-dark-50 dark:bg-dark-800 px-3 py-1.5 rounded-full transition-colors">
                    <FaUserCircle className="text-primary-500" />
                    <span className="text-sm font-medium text-dark-700 dark:text-dark-200">{user.name?.split(' ')[0]}</span>
                    <span className="text-[10px] bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-full font-semibold uppercase">
                      {user.role}
                    </span>
                  </div>
                  <button onClick={handleLogout} className="text-sm text-dark-500 dark:text-dark-400 hover:text-danger-500 dark:hover:text-danger-400 font-medium transition-colors">
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="w-px h-6 bg-dark-200 dark:bg-dark-600 mx-2" />
                <Link to="/student/login" className="px-4 py-2 text-dark-600 dark:text-dark-300 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-all text-sm font-medium">
                  Student Login
                </Link>
                <Link to="/supervisor/login" className="btn-primary text-sm !px-4 !py-2">
                  Supervisor Login
                </Link>
              </>
            )}

            <div className="w-px h-6 bg-dark-200 dark:bg-dark-600 mx-2" />
            
            {/* Theme Toggle */}
            <motion.button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-dark-600 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <HiSun className="text-xl text-yellow-400" /> : <HiMoon className="text-xl" />}
            </motion.button>
          </div>

          {/* Mobile menu button */}
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-dark-600 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
            whileTap={{ scale: 0.9 }}
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <HiX className="text-xl" />
                </motion.div>
              ) : (
                <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <HiMenu className="text-xl" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="md:hidden border-t border-dark-100 dark:border-dark-600 bg-white/95 dark:bg-dark-800/95 backdrop-blur-xl overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="px-4 py-3 space-y-1">
              <Link to="/" onClick={() => setIsOpen(false)} className="block px-4 py-2.5 text-dark-600 dark:text-dark-300 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-all text-sm font-medium">
                Home
              </Link>
              <Link to="/routes" onClick={() => setIsOpen(false)} className="block px-4 py-2.5 text-dark-600 dark:text-dark-300 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-all text-sm font-medium">
                Routes
              </Link>
              {user ? (
                <>
                  <Link to={getDashboardLink()} onClick={() => setIsOpen(false)} className="block px-4 py-2.5 text-dark-600 dark:text-dark-300 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-all text-sm font-medium">
                    Dashboard
                  </Link>
                  <div className="border-t border-dark-100 dark:border-dark-600 my-2" />
                  <div className="px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FaUserCircle className="text-primary-500" />
                      <span className="text-sm font-medium text-dark-700 dark:text-dark-200">{user.name}</span>
                      <span className="text-[10px] bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-full font-semibold uppercase">
                        {user.role}
                      </span>
                    </div>
                    <button
                      onClick={toggleTheme}
                      className="p-2 rounded-lg bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300 transition-colors"
                    >
                      {theme === 'dark' ? <HiSun className="text-lg text-yellow-400" /> : <HiMoon className="text-lg" />}
                    </button>
                  </div>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-950/30 rounded-lg transition-all text-sm font-medium">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <div className="border-t border-dark-100 dark:border-dark-600 my-2" />
                  <Link to="/student/login" onClick={() => setIsOpen(false)} className="block px-4 py-2.5 text-dark-600 dark:text-dark-300 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-all text-sm font-medium">
                    Student Login
                  </Link>
                  <Link to="/supervisor/login" onClick={() => setIsOpen(false)} className="block px-4 py-2.5 text-dark-600 dark:text-dark-300 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-all text-sm font-medium">
                    Supervisor Login
                  </Link>
                  <div className="border-t border-dark-100 dark:border-dark-600 my-2" />
                  <div className="px-4 py-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-dark-600 dark:text-dark-300">Theme</span>
                    <button
                      onClick={toggleTheme}
                      className="p-2 rounded-lg bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300 transition-colors"
                    >
                      {theme === 'dark' ? <HiSun className="text-lg text-yellow-400" /> : <HiMoon className="text-lg" />}
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
