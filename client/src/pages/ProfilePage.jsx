import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import { HiUser, HiMail, HiIdentification, HiAcademicCap } from 'react-icons/hi';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    department: user?.department || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.put('/auth/profile', formData);
      updateUser(res.data);
      toast.success('Profile updated');
      setEditing(false);
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-extrabold text-dark-900 dark:text-white">My Profile</h1>

      {/* Profile Header */}
      <div className="card !p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 h-32 relative">
          <div className="absolute -bottom-10 left-6">
            <div className="w-20 h-20 bg-white dark:bg-dark-600 rounded-2xl shadow-lg flex items-center justify-center text-3xl font-bold text-primary-600 border-4 border-white dark:border-dark-700">
              {user?.name?.charAt(0)}
            </div>
          </div>
        </div>
        <div className="pt-14 pb-6 px-6">
          <h2 className="text-xl font-bold text-dark-900 dark:text-white">{user?.name}</h2>
          <p className="text-dark-500 dark:text-dark-400 text-sm capitalize">
            {user?.role} • {user?.department}
          </p>
        </div>
      </div>

      {/* Profile Details */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-dark-900 dark:text-white">Profile Information</h3>
          <button
            onClick={() => setEditing(!editing)}
            className="btn-secondary text-sm !px-4 !py-1.5"
          >
            {editing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {editing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-dark-700 dark:text-dark-200 mb-1.5">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-dark-700 dark:text-dark-200 mb-1.5">
                Department
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="input-field"
              >
                {['CSE', 'EEE', 'ME', 'CE', 'URP', 'Arch', 'PME', 'BME'].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            {[
              { icon: HiUser, label: 'Name', value: user?.name },
              { icon: HiMail, label: 'Email', value: user?.email },
              {
                icon: HiIdentification,
                label: user?.role === 'student' ? 'Student ID' : 'Employee ID',
                value: user?.studentId || user?.employeeId,
              },
              { icon: HiAcademicCap, label: 'Department', value: user?.department },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-4 py-3 border-b border-dark-100 dark:border-dark-600 last:border-0"
              >
                <div className="bg-primary-50 dark:bg-primary-900/20 p-2.5 rounded-xl">
                  <item.icon className="text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="text-xs text-dark-400 dark:text-dark-500 font-medium">
                    {item.label}
                  </p>
                  <p className="font-semibold text-dark-900 dark:text-dark-100">
                    {item.value || 'N/A'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Token Balance Card */}
      {user?.role === 'student' && (
        <div className="card bg-gradient-to-br from-primary-600 to-primary-800 !border-0 text-white">
          <p className="text-white/70 text-sm font-medium">Points</p>
          <p className="text-4xl font-extrabold mt-1">{user?.points ?? 0}</p>
          <p className="text-white/60 text-xs mt-2">
            Booking = 1 point • Present = 0 extra points • Absent = 2 extra penalty points
          </p>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
