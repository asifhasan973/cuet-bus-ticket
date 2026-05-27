import { useState, useEffect } from 'react';
import API from '../utils/api';
import StatsCard from '../components/ui/StatsCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { FaBus, FaUsers } from 'react-icons/fa';
import { HiClipboardCheck } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SHIFT_SCHEDULE = [
  { shift: 1, icon: '', label: 'Morning', weekday: '6:30 AM → 8:00 AM', weekend: '—', dir: 'CUET-bound' },
  { shift: 2, icon: '', label: 'Afternoon', weekday: '2:00 PM → 3:00 PM', weekend: '2:30 PM → 3:30 PM', dir: 'Outbound' },
  { shift: 3, icon: '', label: 'Evening', weekday: '5:00 PM → 7:00 PM', weekend: '—', dir: 'Outbound' },
  { shift: 4, icon: '', label: 'Night', weekday: '9:00 PM → 10:30 PM', weekend: '8:30 PM → 10:00 PM', dir: 'CUET-bound' },
];

const SupervisorDashboard = () => {
  const { user } = useAuth();
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBuses();
  }, []);

  const fetchBuses = async () => {
    try {
      const res = await API.get('/supervisor/buses');
      setBuses(res.data);
    } catch (error) {
      console.error('Failed to load buses');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-dark-900 dark:text-white">
          Supervisor Dashboard
        </h1>
        <p className="text-dark-500 dark:text-dark-400 text-sm mt-1">Manage attendance and bus operations</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard icon={FaBus} label="Assigned Buses" value={buses.length} color="primary" />
        <StatsCard icon={FaUsers} label="Total Capacity" value={buses.reduce((s, b) => s + b.totalSeats, 0)} color="warning" />
        <StatsCard icon={HiClipboardCheck} label="Attendance Tracker" value="Active" color="accent" />
      </div>

      {/* Shift Schedule Overview */}
      <div className="card !p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-dark-800 to-dark-900 px-6 py-3">
          <h2 className="font-bold text-white text-sm">Daily Shift Schedule</h2>
        </div>
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-100 dark:border-dark-600">
                  <th className="text-left py-2 px-3 text-xs font-bold text-dark-500 dark:text-dark-400 uppercase">Shift</th>
                  <th className="text-left py-2 px-3 text-xs font-bold text-dark-500 dark:text-dark-400 uppercase">Weekday</th>
                  <th className="text-left py-2 px-3 text-xs font-bold text-dark-500 dark:text-dark-400 uppercase">Weekend</th>
                  <th className="text-left py-2 px-3 text-xs font-bold text-dark-500 dark:text-dark-400 uppercase">Direction</th>
                </tr>
              </thead>
              <tbody>
                {SHIFT_SCHEDULE.map(s => (
                  <tr key={s.shift} className="border-b border-dark-50 dark:border-dark-600 hover:bg-dark-50 dark:hover:bg-dark-600/30 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-dark-900 dark:text-dark-100">
                      <span className="mr-1">{s.icon}</span> Shift {s.shift} — {s.label}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-dark-700 dark:text-dark-200">{s.weekday}</td>
                    <td className="py-2.5 px-3 font-semibold text-dark-500 dark:text-dark-400">{s.weekend}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        s.dir === 'CUET-bound' 
                          ? 'bg-accent-100 dark:bg-accent-950/40 text-accent-700 dark:text-accent-300' 
                          : 'bg-teal-100 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300'
                      }`}>
                        {s.dir}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bus Overview */}
      <div className="card !p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-dark-100 dark:border-dark-600">
          <h2 className="font-bold text-dark-900 dark:text-white">Your Assigned Buses</h2>
        </div>
        <div className="divide-y divide-dark-100 dark:divide-dark-600">
          {buses.map(bus => (
            <div key={bus._id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-dark-50 dark:hover:bg-dark-600/20 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${
                  bus.busType === 'flyover' 
                    ? 'bg-violet-100 dark:bg-violet-950/30' 
                    : 'bg-primary-100 dark:bg-primary-950/30'
                }`}>
                  <FaBus className={bus.busType === 'flyover' ? 'text-violet-600 dark:text-violet-400' : 'text-primary-600 dark:text-primary-400'} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-dark-900 dark:text-white">{bus.busName}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      bus.busType === 'flyover' 
                        ? 'bg-violet-100 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300' 
                        : 'bg-dark-100 dark:bg-dark-600 text-dark-500 dark:text-dark-300'
                    }`}>
                      {bus.busType}
                    </span>
                  </div>
                  <p className="text-sm text-dark-500 dark:text-dark-400 line-clamp-1">{bus.route?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-dark-400 dark:text-dark-500">{bus.totalSeats} seats</span>
                <Link
                  to={`/supervisor/attendance?bus=${bus._id}`}
                  className="btn-primary text-sm !px-4 !py-1.5"
                >
                  Manage Attendance
                </Link>
              </div>
            </div>
          ))}
          {buses.length === 0 && (
            <div className="px-6 py-8 text-center text-dark-400 dark:text-dark-500">
              No buses assigned to you yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupervisorDashboard;
