import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBus, FaTicketAlt, FaRoute, FaShieldAlt, FaClock, FaMobileAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { HiArrowRight } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [buses, setBuses] = useState([]);
  const [loadingBuses, setLoadingBuses] = useState(true);

  useEffect(() => {
    fetchBuses();
  }, []);

  const fetchBuses = async () => {
    try {
      const res = await API.get('/buses');
      setBuses(res.data);
    } catch (error) {
      console.error('Failed to load buses');
    } finally {
      setLoadingBuses(false);
    }
  };

  const handleBusClick = (busId) => {
    if (!user) {
      navigate('/student/login');
      return;
    }
    if (user.role === 'student') navigate(`/student/booking?bus=${busId}`);
    else if (user.role === 'supervisor') navigate(`/supervisor/attendance?bus=${busId}`);
    else if (user.role === 'admin') navigate('/admin/buses');
  };

  const features = [
    {
      icon: FaTicketAlt,
      title: 'Easy Seat Booking',
      desc: 'Book your bus seat in seconds with our interactive seat map. Choose your preferred seat.',
      color: 'from-primary-500 to-primary-600',
    },
    {
      icon: FaRoute,
      title: 'Live Routes',
      desc: 'View all available routes, stops, and schedules. Never miss your bus again.',
      color: 'from-accent-500 to-accent-600',
    },
    {
      icon: FaShieldAlt,
      title: 'Secure & Reliable',
      desc: 'JWT-based authentication keeps your data safe. One-student-one-seat policy.',
      color: 'from-violet-500 to-violet-600',
    },
    {
      icon: FaClock,
      title: 'Real-time Updates',
      desc: 'Get instant updates on seat availability and booking confirmations.',
      color: 'from-amber-500 to-amber-600',
    },
    {
      icon: FaMobileAlt,
      title: 'Mobile Friendly',
      desc: 'Access the platform from any device. Fully responsive design for on-the-go booking.',
      color: 'from-rose-500 to-rose-600',
    },
    {
      icon: FaBus,
      title: 'Multiple Buses',
      desc: 'Choose from a fleet of buses covering multiple routes across Chittagong.',
      color: 'from-teal-500 to-teal-600',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-dark-900 via-primary-900 to-dark-900">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(59,130,246,0.3) 0%, transparent 50%),
                             radial-gradient(circle at 75% 75%, rgba(16,185,129,0.3) 0%, transparent 50%)`,
          }} />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
              <div className="w-2 h-2 bg-accent-400 rounded-full animate-pulse" />
              <span className="text-sm text-white/80 font-medium">University Bus Service</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight">
              Book Your
              <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent"> CUET Bus </span>
              Seat Online
            </h1>
            
            <p className="mt-6 text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
              Fast, easy, and reliable bus seat booking for CUET students. 
              Choose your seat, track your route, and travel hassle-free.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              {user?.role === 'student' ? (
                <Link to="/student/booking" className="group bg-white text-dark-900 px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-dark-50 transition-all shadow-lg hover:shadow-xl flex items-center gap-2">
                  Book Seat Now
                  <HiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : user ? (
                <Link to={`/${user.role}/dashboard`} className="group bg-white text-dark-900 px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-dark-50 transition-all shadow-lg hover:shadow-xl flex items-center gap-2">
                  Go to Dashboard
                  <HiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <Link to="/student/register" className="group bg-white text-dark-900 px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-dark-50 transition-all shadow-lg hover:shadow-xl flex items-center gap-2">
                  Get Started
                  <HiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
              <Link to="/routes" className="text-white/80 hover:text-white border border-white/20 px-8 py-3.5 rounded-xl font-semibold text-sm hover:bg-white/10 transition-all">
                View Routes
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="mt-16 grid grid-cols-3 gap-8 max-w-md mx-auto">
              {[
                { value: '4+', label: 'Active Buses' },
                { value: '150+', label: 'Seats Available' },
                { value: '10+', label: 'Routes' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-2xl sm:text-3xl font-extrabold text-white">{stat.value}</p>
                  <p className="text-xs text-white/50 mt-1 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,60 1440,40 L1440,80 L0,80 Z" fill="var(--color-dark-50)" />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-dark-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-dark-900 tracking-tight">
              Why Choose CUET Bus?
            </h2>
            <p className="mt-3 text-dark-500 max-w-lg mx-auto">
              Everything you need for a smooth bus commute to university
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card group hover:scale-[1.02] transition-all duration-300"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                  <feature.icon className="text-white text-lg" />
                </div>
                <h3 className="font-bold text-dark-900 text-lg">{feature.title}</h3>
                <p className="text-dark-500 text-sm mt-2 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Available Buses Section */}
      <section className="py-20 bg-dark-50 border-t border-dark-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-dark-900 tracking-tight">
              Available Bus Routes
            </h2>
            <p className="mt-3 text-dark-500 max-w-lg mx-auto">
              Check out our buses and their schedules
            </p>
          </div>

          {loadingBuses ? (
            <div className="flex justify-center py-10">
              <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
            </div>
          ) : buses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {buses.map(bus => (
                <div 
                  key={bus._id} 
                  className="card !p-0 overflow-hidden cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1 group bg-white border border-dark-100"
                  onClick={() => handleBusClick(bus._id)}
                >
                  <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FaBus className="text-white text-xl" />
                      <div>
                        <h3 className="font-bold text-white text-lg">{bus.busNumber}</h3>
                      </div>
                    </div>
                    <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">
                      {bus.availableSeats ?? bus.totalSeats} Seats Left
                    </span>
                  </div>
                  <div className="p-6">
                    <h4 className="font-bold text-dark-900 mb-4 text-lg">{bus.route?.name}</h4>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 text-dark-600 text-sm">
                        <FaClock className="text-primary-500" />
                        <span className="font-medium">{bus.schedule?.departure} - {bus.schedule?.arrival}</span>
                      </div>
                      <div className="flex items-center gap-3 text-dark-600 text-sm">
                        <FaMapMarkerAlt className="text-primary-500" />
                        <span className="font-medium">{bus.route?.stops?.length || 0} Stops</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {bus.schedule?.days?.slice(0, 3).map(day => (
                        <span key={day} className="text-[10px] bg-dark-50 text-dark-600 px-2 py-1 rounded-md font-bold uppercase tracking-wide border border-dark-100">
                          {day.substring(0, 3)}
                        </span>
                      ))}
                      {(bus.schedule?.days?.length || 0) > 3 && (
                        <span className="text-[10px] bg-dark-50 text-dark-600 px-2 py-1 rounded-md font-bold uppercase tracking-wide border border-dark-100">
                          +{bus.schedule.days.length - 3} More
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="px-6 py-4 border-t border-dark-100 bg-dark-50/50 group-hover:bg-primary-50 transition-colors flex items-center justify-between">
                    <span className="text-sm font-semibold text-primary-600">
                      {user ? 'View Details' : 'Login to Book'}
                    </span>
                    <HiArrowRight className="text-primary-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-white rounded-2xl shadow-sm border border-dark-100">
              <FaBus className="text-4xl text-dark-300 mx-auto mb-3" />
              <p className="text-dark-500 font-medium">No buses available at the moment</p>
            </div>
          )}
          
          <div className="text-center mt-10">
            <Link to="/routes" className="inline-flex items-center gap-2 bg-white text-dark-900 border border-dark-200 px-6 py-3 rounded-xl font-bold text-sm hover:bg-dark-50 transition-all shadow-sm">
              View All Routes
              <HiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-3xl p-10 sm:p-14 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            
            <h2 className="text-3xl font-extrabold text-white relative">
              Ready to Book Your Seat?
            </h2>
            <p className="text-white/70 mt-4 max-w-lg mx-auto relative">
              Join hundreds of CUET students who already use our platform for hassle-free commuting.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 relative">
              {user?.role === 'student' ? (
                <Link to="/student/booking" className="bg-white text-primary-700 px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-dark-50 transition-all shadow-lg">
                  Book Your Seat
                </Link>
              ) : user ? (
                <Link to={`/${user.role}/dashboard`} className="bg-white text-primary-700 px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-dark-50 transition-all shadow-lg">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/student/register" className="bg-white text-primary-700 px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-dark-50 transition-all shadow-lg">
                    Register as Student
                  </Link>
                  <Link to="/supervisor/register" className="text-white border border-white/30 px-8 py-3.5 rounded-xl font-semibold text-sm hover:bg-white/10 transition-all">
                    Register as Supervisor
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-900 text-white/60 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-primary-600 p-1.5 rounded-lg">
                <FaBus className="text-white text-sm" />
              </div>
              <span className="font-bold text-white">CUET Bus</span>
            </div>
            <p className="text-sm">© 2024 CUET Bus Booking System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
