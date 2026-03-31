import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { FaBus, FaMapMarkerAlt } from 'react-icons/fa';

const ROUTE_GROUPS = [
  { label: 'Flyover Route', type: 'flyover' },
  { label: 'Regular Routes', type: 'regular' },
];

const SHIFT_SCHEDULE = [
  { shift: 1, icon: '', label: 'Morning', weekday: '6:30 AM → 8:00 AM', weekend: '—', dir: 'CUET-bound', desc: 'Each bus from its own route endpoint' },
  { shift: 2, icon: '', label: 'Afternoon', weekday: '2:00 PM → 3:00 PM', weekend: '2:30 PM → 3:30 PM', dir: 'Outbound', desc: 'All buses → Kaptai Rastar Matha' },
  { shift: 3, icon: '', label: 'Evening', weekday: '5:00 PM → 7:00 PM', weekend: '—', dir: 'Outbound', desc: 'Each bus follows own normal route' },
  { shift: 4, icon: '', label: 'Night', weekday: '9:00 PM → 10:30 PM', weekend: '8:30 PM → 10:00 PM', dir: 'CUET-bound', desc: 'All buses from New Market' },
];

const RoutePage = () => {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleBusClick = (busId) => {
    if (!user) return;
    if (user.role === 'student') {
      navigate(`/student/booking?bus=${busId}`);
    } else if (user.role === 'supervisor') {
      navigate(`/supervisor/attendance?bus=${busId}`);
    } else if (user.role === 'admin') {
      navigate('/admin/buses');
    }
  };

  useEffect(() => {
    fetchBuses();
  }, []);

  const fetchBuses = async () => {
    try {
      const res = await API.get('/buses');
      setBuses(res.data);
    } catch (error) {
      console.error('Failed to load routes');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const flyoverBuses = buses.filter(b => b.busType === 'flyover');
  const regularBuses = buses.filter(b => b.busType === 'regular');

  // Group regular buses by route name
  const routeGroups = {};
  regularBuses.forEach(bus => {
    const routeName = bus.route?.name || 'Unknown Route';
    if (!routeGroups[routeName]) {
      routeGroups[routeName] = [];
    }
    routeGroups[routeName].push(bus);
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-dark-900">Routes & Schedule</h1>
        <p className="text-dark-500 mt-2">All bus routes and shift schedule</p>
      </div>

      {/* Shift Schedule Table */}
      <div className="card !p-0 overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-dark-800 to-dark-900 px-6 py-4">
          <h2 className="font-bold text-white text-lg">Shift Schedule</h2>
          <p className="text-white/60 text-sm mt-1">All buses follow the same shift timings</p>
        </div>
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-dark-100">
                  <th className="text-left py-3 px-4 text-xs font-bold text-dark-500 uppercase">Shift</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-dark-500 uppercase">Weekday (Sun-Thu)</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-dark-500 uppercase">Weekend (Fri-Sat)</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-dark-500 uppercase">Direction</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-dark-500 uppercase">Note</th>
                </tr>
              </thead>
              <tbody>
                {SHIFT_SCHEDULE.map(s => (
                  <tr key={s.shift} className="border-b border-dark-50 hover:bg-dark-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-dark-900">
                      <span className="mr-1.5">{s.icon}</span>
                      Shift {s.shift} — {s.label}
                    </td>
                    <td className="py-3 px-4 font-semibold text-dark-700">{s.weekday}</td>
                    <td className="py-3 px-4 font-semibold text-dark-500">{s.weekend}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        s.dir === 'CUET-bound' ? 'bg-accent-100 text-accent-700' : 'bg-teal-100 text-teal-700'
                      }`}>
                        {s.dir}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-dark-500">{s.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Flyover Buses */}
      {flyoverBuses.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-dark-900 mb-4 flex items-center gap-2">
           Flyover Buses
            <span className="text-xs font-normal text-dark-400">({flyoverBuses.length} buses)</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {flyoverBuses.map(bus => (
              <div 
                key={bus._id}
                className="card !p-0 overflow-hidden cursor-pointer hover:shadow-lg transition-all group"
                onClick={() => handleBusClick(bus._id)}
              >
                <div className="bg-gradient-to-r from-violet-500 to-violet-700 px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FaBus className="text-white" />
                    <h3 className="font-bold text-white">{bus.busName}</h3>
                  </div>
                  <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">FLYOVER</span>
                </div>
                <div className="p-4">
                  <p className="text-sm text-dark-600 font-medium mb-3">{bus.route?.name}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {bus.route?.stops?.map((stop, i) => (
                      <span key={i} className="text-xs bg-dark-50 text-dark-600 px-2 py-1 rounded-md font-medium border border-dark-100">
                        {stop.name}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-dark-400">
                    <span className="flex items-center gap-1"><FaMapMarkerAlt /> {bus.route?.stops?.length} stops</span>
                    <span className="font-bold text-dark-600">{bus.totalSeats} seats</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regular Buses grouped by route */}
      <div>
        <h2 className="text-lg font-bold text-dark-900 mb-4 flex items-center gap-2">
         Regular Buses
          <span className="text-xs font-normal text-dark-400">({regularBuses.length} buses)</span>
        </h2>
        {Object.entries(routeGroups).map(([routeName, routeBuses]) => (
          <div key={routeName} className="mb-6">
            <div className="card !p-0 overflow-hidden">
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
                <div className="flex items-center gap-2">
                  <FaBus className="text-white" />
                  <div>
                    <h3 className="font-bold text-white">{routeName}</h3>
                    <p className="text-white/60 text-xs">{routeBuses.length} buses on this route</p>
                  </div>
                </div>
              </div>
              <div className="p-5">
                {/* Route stops timeline */}
                <div className="mb-5">
                  <p className="text-xs font-bold text-dark-500 uppercase mb-3">Route Stops</p>
                  <div className="flex flex-wrap items-center gap-2">
                    {routeBuses[0]?.route?.stops?.map((stop, i) => (
                      <div key={i} className="flex items-center">
                        <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-dark-100">
                          <div className={`w-2.5 h-2.5 rounded-full ${
                            i === 0 ? 'bg-accent-500' :
                            i === routeBuses[0].route.stops.length - 1 ? 'bg-primary-500' :
                            'bg-dark-300'
                          }`} />
                          <span className="text-sm font-medium text-dark-800">{stop.name}</span>
                        </div>
                        {i < routeBuses[0].route.stops.length - 1 && (
                          <span className="text-dark-300 mx-1">→</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bus names */}
                <p className="text-xs font-bold text-dark-500 uppercase mb-2">Buses</p>
                <div className="flex flex-wrap gap-2">
                  {routeBuses.map(bus => (
                    <button
                      key={bus._id}
                      onClick={() => handleBusClick(bus._id)}
                      className="flex items-center gap-2 bg-dark-50 hover:bg-primary-50 hover:border-primary-200 px-3 py-2 rounded-xl border border-dark-100 transition-all group"
                    >
                      <FaBus className="text-dark-400 group-hover:text-primary-600 text-xs" />
                      <span className="text-sm font-bold text-dark-700 group-hover:text-primary-700">{bus.busName}</span>
                      <span className="text-[10px] text-dark-400">{bus.totalSeats}s</span>
                    </button>
                  ))}
                </div>

                {/* Supervisor info */}
                {routeBuses.some(b => b.supervisors?.length > 0) && (
                  <div className="mt-4 pt-3 border-t border-dark-100">
                    <span className="text-xs font-bold text-dark-500">Supervisors: </span>
                    <span className="text-xs text-dark-600">
                      {[...new Set(routeBuses.flatMap(b => b.supervisors?.map(s => s.name) || []))].join(', ') || 'None assigned'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {buses.length === 0 && (
        <div className="text-center py-12">
          <FaBus className="text-4xl text-dark-300 mx-auto mb-3" />
          <p className="text-dark-500">No routes available at the moment</p>
        </div>
      )}
    </div>
  );
};

export default RoutePage;
