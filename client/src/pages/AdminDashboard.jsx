import { useState, useEffect } from 'react';
import API from '../utils/api';
import StatsCard from '../components/ui/StatsCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { FaBus, FaUsers, FaUserTie, FaTrash, FaTimes, FaSave } from 'react-icons/fa';
import { HiTicket, HiChartBar } from 'react-icons/hi';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [userFilter, setUserFilter] = useState('');
  
  // Modal states for assigning buses
  const [showBusModal, setShowBusModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [buses, setBuses] = useState([]);
  const [selectedBuses, setSelectedBuses] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchBuses();
  }, []);

  const fetchBuses = async () => {
    try {
      const res = await API.get('/buses/all');
      setBuses(res.data);
    } catch (error) {
      console.error('Failed to load buses');
    }
  };

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

  const updatePoints = async (id, currentPoints, delta) => {
    try {
      await API.put(`/admin/users/${id}`, { points: currentPoints + delta });
      toast.success('Points updated');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update points');
    }
  };

  const updateRole = async (id, newRole) => {
    try {
      await API.put(`/admin/users/${id}`, { role: newRole });
      toast.success('Role updated');
      fetchUsers();
      if (newRole === 'supervisor') {
        setSelectedUserId(id);
        setSelectedBuses([]);
        setShowBusModal(true);
      }
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const handleAssignBuses = async () => {
    try {
      await API.post(`/admin/users/${selectedUserId}/assign-buses`, { busIds: selectedBuses });
      toast.success('Buses assigned successfully');
      setShowBusModal(false);
      setSelectedUserId(null);
      setSelectedBuses([]);
    } catch (error) {
      toast.error('Failed to assign buses');
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
                    <td className="px-6 py-4 text-sm font-bold text-dark-900">
                      {String.fromCharCode(65 + Math.floor((booking.seatNumber - 1) / 5))}{((booking.seatNumber - 1) % 5) + 1}
                    </td>
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
                        <select 
                          value={u.role}
                          onChange={(e) => updateRole(u._id, e.target.value)}
                          className={`px-2 py-1 rounded-lg text-xs font-bold uppercase border-2 focus:outline-none ${
                            u.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            u.role === 'supervisor' ? 'bg-accent-50 text-accent-700 border-accent-200' :
                            'bg-primary-50 text-primary-700 border-primary-200'
                          }`}
                        >
                          <option value="student">STUDENT</option>
                          <option value="supervisor">SUPERVISOR</option>
                          <option value="admin">ADMIN</option>
                        </select>
                        {u.role === 'supervisor' && (
                          <button onClick={() => { setSelectedUserId(u._id); setSelectedBuses([]); setShowBusModal(true); }}
                            className="block mt-1 text-[10px] text-primary-600 font-semibold hover:underline">
                            Assign Buses
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-dark-500">{u.studentId || u.employeeId || '-'}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <button onClick={() => updatePoints(u._id, u.points, -1)}
                            className="w-6 h-6 flex items-center justify-center bg-dark-100 hover:bg-dark-200 rounded text-dark-600 font-bold">-</button>
                          <span className="w-8 text-center text-sm font-bold text-dark-900">{u.points}</span>
                          <button onClick={() => updatePoints(u._id, u.points, 1)}
                            className="w-6 h-6 flex items-center justify-center bg-dark-100 hover:bg-dark-200 rounded text-dark-600 font-bold">+</button>
                        </div>
                      </td>
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

      {/* Assign Supervisor Buses Modal */}
      {showBusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4 flex items-center justify-between">
              <h2 className="font-bold text-white flex items-center gap-2">
                <FaBus /> Assign Supervised Buses
              </h2>
              <button onClick={() => setShowBusModal(false)} className="text-white/80 hover:text-white">
                <FaTimes />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm font-medium text-dark-600 mb-4">Select the buses this supervisor will manage:</p>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                {buses.map(bus => {
                  const isSelected = selectedBuses.includes(bus._id);
                  return (
                    <div key={bus._id} 
                      onClick={() => setSelectedBuses(prev => isSelected ? prev.filter(id => id !== bus._id) : [...prev, bus._id])}
                      className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        isSelected ? 'border-primary-500 bg-primary-50' : 'border-dark-100 hover:border-dark-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <FaBus className={isSelected ? 'text-primary-600' : 'text-dark-400'} />
                        <div>
                          <p className={`font-bold ${isSelected ? 'text-primary-900' : 'text-dark-900'}`}>{bus.busNumber}</p>
                          <p className="text-xs text-dark-500">{bus.route?.name}</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded flex items-center justify-center border-2 ${
                        isSelected ? 'bg-primary-500 border-primary-500' : 'border-dark-300'
                      }`}>
                        {isSelected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      </div>
                    </div>
                  );
                })}
                {buses.length === 0 && <p className="text-sm text-dark-400 text-center py-4">No buses currently active.</p>}
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setShowBusModal(false)} className="px-4 py-2 rounded-xl text-sm font-semibold bg-dark-100 text-dark-600 hover:bg-dark-200">
                  Cancel
                </button>
                <button onClick={handleAssignBuses} className="btn-primary flex items-center gap-2 text-sm !px-4 !py-2">
                  <FaSave /> Save Assignments
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
