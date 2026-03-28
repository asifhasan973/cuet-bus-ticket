import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HiHome, HiTicket, HiMap, HiUser, HiUsers, HiClipboardCheck,
  HiCog, HiChartBar,
} from 'react-icons/hi';
import { FaBus } from 'react-icons/fa';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const studentLinks = [
    { to: '/student/dashboard', icon: HiHome, label: 'Dashboard' },
    { to: '/student/booking', icon: HiTicket, label: 'Book Seat' },
    { to: '/student/routes', icon: HiMap, label: 'Routes & Schedule' },
    { to: '/student/profile', icon: HiUser, label: 'My Profile' },
  ];

  const supervisorLinks = [
    { to: '/supervisor/dashboard', icon: HiHome, label: 'Dashboard' },
    { to: '/supervisor/attendance', icon: HiClipboardCheck, label: 'Attendance' },
    { to: '/supervisor/routes', icon: HiMap, label: 'Routes & Schedule' },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', icon: HiHome, label: 'Dashboard' },
    { to: '/admin/buses', icon: FaBus, label: 'Manage Buses' },
    { to: '/admin/routes', icon: HiMap, label: 'Routes & Schedule' },
  ];

  const links = user?.role === 'admin' ? adminLinks 
    : user?.role === 'supervisor' ? supervisorLinks 
    : studentLinks;

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed lg:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)]
        w-64 bg-white border-r border-dark-100
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        overflow-y-auto
      `}>
        {/* User Info Card */}
        <div className="p-4 border-b border-dark-100">
          <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl p-4 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-lg font-bold">
                {user?.name?.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-sm">{user?.name}</p>
                <p className="text-xs text-white/70 capitalize">{user?.role}</p>
              </div>
            </div>
            {user?.role === 'student' && (
              <div className="mt-3 flex items-center justify-between bg-white/10 rounded-lg px-3 py-2">
                <span className="text-xs text-white/70">Points</span>
                <span className="font-bold text-lg">{user?.points ?? 0}</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          <p className="text-[10px] font-bold uppercase text-dark-400 tracking-wider px-3 py-2">
            Navigation
          </p>
          {links.map((link, index) => (
            <NavLink
              key={index}
              to={link.to}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-200
                ${isActive 
                  ? 'bg-primary-50 text-primary-700 shadow-sm' 
                  : 'text-dark-500 hover:text-dark-800 hover:bg-dark-50'}
              `}
            >
              <link.icon className="text-lg flex-shrink-0" />
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
