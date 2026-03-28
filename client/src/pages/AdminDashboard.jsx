import { useState, useEffect } from 'react';
import API from '../utils/api';
import StatsCard from '../components/ui/StatsCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { FaBus, FaUsers, FaUserTie, FaTrash } from 'react-icons/fa';
import { HiTicket, HiChartBar } from 'react-icons/hi';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [userFilter, setUserFilter] = useState('');

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await API.get('/admin/stats');
      setStats(res.data);
    } catch (error) {
      toast.error('Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const url = userFilter ? `/admin/users?role=${userFilter}` : '/admin/users';
      const res = await API.get(url);
      setUsers(res.data);
    } catch (error) {
      toast.error('Failed to load users');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [userFilter]);

  const deleteUser = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await API.delete(`/admin/users/${id}`);
      toast.success('User deleted');
      fetchUsers();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-dark-900">Admin Dashboard 🛡️</h1>
        <p className="text-dark-500 text-sm mt-1">System overview and management</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard icon={FaUsers} label="Students" value={stats?.totalStudents || 0} color="primary" />
        <StatsCard icon={FaUserTie} label="Supervisors" value={stats?.totalSupervisors || 0} color="accent" />
        <StatsCard icon={FaBus} label="Total Buses" value={stats?.totalBuses || 0} color="warning" />
        <StatsCard icon={FaBus} label="Active Buses" value={stats?.activeBuses || 0} color="accent" />
        <StatsCard icon={HiTicket} label="Active Bookings" value={stats?.totalBookings || 0} color="danger" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-dark-100 p-1 rounded-xl w-fit">
        {['overview', 'users'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              activeTab === tab ? 'bg-white text-dark-900 shadow-sm' : 'text-dark-500 hover:text-dark-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        /* Recent Bookings */
        <div className="card !p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-dark-100">
            <h2 className="font-bold text-dark-900">Recent Bookings</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-bold text-dark-500 uppercase">Student</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-dark-500 uppercase">Bus</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-dark-500 uppercase">Seat</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-dark-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-100">
                {stats?.recentBookings?.map(booking => (
                  <tr key={booking._id} className="hover:bg-dark-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-dark-900">
                      {booking.student?.name} <span className="text-dark-400">({booking.student?.studentId})</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-dark-600">{booking.bus?.busNumber}</td>
                    <td className="px-6 py-4 text-sm font-bold text-dark-900">#{booking.seatNumber}</td>
                    <td className="px-6 py-4 text-sm text-dark-500">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {(!stats?.recentBookings || stats.recentBookings.length === 0) && (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-dark-400 text-sm">No recent bookings</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div>
          {/* Filter */}
          <div className="flex gap-2 mb-4">
            {['', 'student', 'supervisor'].map(filter => (
              <button
                key={filter}
                onClick={() => setUserFilter(filter)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
                  userFilter === filter ? 'bg-primary-600 text-white' : 'bg-dark-100 text-dark-600 hover:bg-dark-200'
                }`}
              >
                {filter || 'All'}
              </button>
            ))}
          </div>

          <div className="card !p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-50">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-bold text-dark-500 uppercase">Name</th>
                    <th className="text-left px-6 py-3 text-xs font-bold text-dark-500 uppercase">Email</th>
                    <th className="text-left px-6 py-3 text-xs font-bold text-dark-500 uppercase">Role</th>
                    <th className="text-left px-6 py-3 text-xs font-bold text-dark-500 uppercase">ID</th>
                    <th className="text-left px-6 py-3 text-xs font-bold text-dark-500 uppercase">Points</th>
                    <th className="text-right px-6 py-3 text-xs font-bold text-dark-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-100">
                  {users.map(u => (
                    <tr key={u._id} className="hover:bg-dark-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-dark-900">{u.name}</td>
                      <td className="px-6 py-4 text-sm text-dark-600">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                          u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                          u.role === 'supervisor' ? 'bg-accent-100 text-accent-700' :
                          'bg-primary-100 text-primary-700'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-dark-500">{u.studentId || u.employeeId || '-'}</td>
                      <td className="px-6 py-4 text-sm font-bold text-dark-900">{u.points}</td>
                      <td className="px-6 py-4 text-right">
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => deleteUser(u._id, u.name)}
                            className="text-danger-500 hover:text-danger-600 p-2 rounded-lg hover:bg-danger-50 transition-colors"
                          >
                            <FaTrash className="text-sm" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
