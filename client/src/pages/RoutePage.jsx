import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { FaBus, FaClock, FaMapMarkerAlt } from 'react-icons/fa';

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

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-dark-900">Routes & Schedule</h1>
        <p className="text-dark-500 mt-2">All available bus routes and timings</p>
      </div>

      <div className="space-y-6">
        {buses.map(bus => (
          <div 
            key={bus._id} 
            className="card !p-0 overflow-hidden cursor-pointer hover:shadow-lg transition-all"
            onClick={() => handleBusClick(bus._id)}
          >
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-3">
                <FaBus className="text-white text-lg" />
                <div>
                  <h2 className="font-bold text-white text-lg">{bus.busNumber}</h2>
                  <p className="text-white/70 text-sm">{bus.route?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-white/80 text-sm">
                <span className="flex items-center gap-1.5">
                  <FaClock className="text-xs" />
                  {bus.schedule?.departure} → {bus.schedule?.arrival}
                </span>
              </div>
            </div>

            <div className="p-6">
              {/* Route timeline */}
              <div className="relative">
                {bus.route?.stops?.map((stop, index) => (
                  <div key={index} className="flex gap-4 mb-0">
                    <div className="flex flex-col items-center">
                      <div className={`w-4 h-4 rounded-full border-2 z-10 ${
                        index === 0 ? 'bg-accent-500 border-accent-500' :
                        index === bus.route.stops.length - 1 ? 'bg-primary-500 border-primary-500' :
                        'bg-white border-dark-300'
                      }`} />
                      {index < bus.route.stops.length - 1 && (
                        <div className="w-0.5 h-10 bg-dark-200" />
                      )}
                    </div>
                    <div className="pb-6 flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-dark-900">{stop.name}</p>
                          {index === 0 && (
                            <span className="text-[10px] bg-accent-100 text-accent-700 px-2 py-0.5 rounded-full font-bold uppercase">
                              Starting Point
                            </span>
                          )}
                          {index === bus.route.stops.length - 1 && (
                            <span className="text-[10px] bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-bold uppercase">
                              Destination
                            </span>
                          )}
                        </div>
                        <span className="text-sm font-medium text-dark-500 bg-dark-50 px-3 py-1 rounded-lg">
                          {stop.time}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Schedule Info */}
              <div className="mt-2 pt-4 border-t border-dark-100 flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm text-dark-500">
                  <FaMapMarkerAlt className="text-dark-400" />
                  {bus.route?.stops?.length} stops
                </div>
                <div className="flex items-center gap-2 text-sm text-dark-500">
                  <FaBus className="text-dark-400" />
                  {bus.totalSeats} seats ({bus.availableSeats ?? bus.totalSeats} available)
                </div>
                <div className="flex flex-wrap gap-1">
                  {bus.schedule?.days?.map(day => (
                    <span key={day} className="text-[10px] bg-dark-100 text-dark-600 px-2 py-0.5 rounded font-medium">
                      {day.substring(0, 3)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}

        {buses.length === 0 && (
          <div className="text-center py-12">
            <FaBus className="text-4xl text-dark-300 mx-auto mb-3" />
            <p className="text-dark-500">No routes available at the moment</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoutePage;
