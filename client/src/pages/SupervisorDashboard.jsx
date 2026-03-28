import { useState, useEffect } from 'react';
import API from '../utils/api';
import StatsCard from '../components/ui/StatsCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { FaBus, FaUsers } from 'react-icons/fa';
import { HiClipboardCheck, HiTicket } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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

  const totalBooked = buses.reduce((sum, bus) => {
    return sum + (bus.seats?.filter(s => s.isBooked)?.length || 0);
  }, 0);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-dark-900">
          Supervisor Dashboard 👨‍🏫
        </h1>
        <p className="text-dark-500 text-sm mt-1">Manage attendance and bus operations</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon={FaBus} label="Assigned Buses" value={buses.length} color="primary" />
        <StatsCard icon={HiTicket} label="Total Booked" value={totalBooked} color="accent" />
        <StatsCard icon={FaUsers} label="Total Seats" value={buses.reduce((s, b) => s + b.totalSeats, 0)} color="warning" />
        <StatsCard icon={HiClipboardCheck} label="Pending Attendance" value={totalBooked} color="danger" />
      </div>

      <div className="card !p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-dark-100">
          <h2 className="font-bold text-dark-900">Bus Overview</h2>
        </div>
        <div className="divide-y divide-dark-100">
          {buses.map(bus => (
            <div key={bus._id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-dark-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="bg-primary-100 p-2.5 rounded-xl">
                  <FaBus className="text-primary-600" />
                </div>
                <div>
                  <h3 className="font-bold text-dark-900">{bus.busNumber}</h3>
                  <p className="text-sm text-dark-500">{bus.route?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-dark-500">
                  <span className="font-bold text-dark-900">{bus.seats?.filter(s => s.isBooked)?.length || 0}</span>
                  /{bus.totalSeats} booked
                </div>
                <Link
                  to={`/supervisor/attendance?bus=${bus._id}`}
                  className="btn-primary text-sm !px-4 !py-1.5"
                >
                  Attendance
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SupervisorDashboard;
