import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBus, FaTicketAlt, FaRoute, FaShieldAlt, FaClock, FaMobileAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { HiArrowRight } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import { motion } from 'framer-motion';
import {
  FadeIn, StaggerContainer, StaggerItem, AnimatedCounter, ScaleOnHover, FloatingElement
} from '../components/ui/AnimatedComponents';

const SHIFT_SCHEDULE = [
  { shift: 1, icon: '🌅', label: 'Morning', time: '6:30 AM → 8:00 AM', dir: 'CUET-bound', note: 'Weekdays', color: 'from-teal-400 to-teal-600' },
  { shift: 2, icon: '☀️', label: 'Afternoon', time: '2:00 PM → 3:00 PM', dir: 'Outbound', note: 'All days', color: 'from-sky-400 to-blue-500' },
  { shift: 3, icon: '🌇', label: 'Evening', time: '5:00 PM → 7:00 PM', dir: 'Outbound', note: 'Weekdays', color: 'from-indigo-400 to-purple-500' },
  { shift: 4, icon: '🌙', label: 'Night', time: '9:00 PM → 10:30 PM', dir: 'CUET-bound', note: 'All days', color: 'from-slate-600 to-slate-800' },
];

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
      desc: 'Book your bus seat in seconds. Select date, shift, bus, and seat — all in a smooth flow.',
      color: 'from-primary-500 to-primary-600',
    },
    {
      icon: FaRoute,
      title: '4 Daily Shifts',
      desc: 'Morning, Afternoon, Evening, and Night shifts cover your entire day of commuting.',
      color: 'from-accent-500 to-accent-600',
    },
    {
      icon: FaShieldAlt,
      title: 'Secure & Reliable',
      desc: 'JWT-based authentication keeps your data safe. One-student-one-seat-per-shift policy.',
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
      title: '14 University Buses',
      desc: 'Choose from a fleet of 14 buses covering multiple routes across Chittagong.',
      color: 'from-teal-500 to-teal-600',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-dark-900 via-primary-900 to-dark-900">
        {/* Animated background blobs */}
        <div className="absolute inset-0 opacity-10">
          <motion.div
            className="absolute inset-0"
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, rgba(59,130,246,0.3) 0%, transparent 50%),
                               radial-gradient(circle at 75% 75%, rgba(16,185,129,0.3) 0%, transparent 50%)`,
            }}
          />
        </div>

        {/* Floating decorative elements */}
        <FloatingElement className="absolute top-20 left-[10%] opacity-10" duration={5}>
          <FaBus className="text-white text-6xl" />
        </FloatingElement>
        <FloatingElement className="absolute top-40 right-[15%] opacity-5" duration={7}>
          <FaTicketAlt className="text-white text-8xl" />
        </FloatingElement>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
          <div className="text-center max-w-3xl mx-auto">
            <FadeIn delay={0.1}>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
                <motion.div
                  className="w-2 h-2 bg-accent-400 rounded-full"
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-sm text-white/80 font-medium">CUET University Bus Service</span>
              </div>
            </FadeIn>
            
            <FadeIn delay={0.2}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight">
                Book Your
                <motion.span
                  className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent inline-block"
                  animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
                  transition={{ duration: 5, repeat: Infinity }}
                >
                  {' '}CUETGo{' '}
                </motion.span>
                Seat Online
              </h1>
            </FadeIn>
            
            <FadeIn delay={0.35}>
              <p className="mt-6 text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
                14 buses, 4 daily shifts, seamless booking. Choose your date, shift, bus, and seat — travel hassle-free.
              </p>
            </FadeIn>

            <FadeIn delay={0.5}>
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
            </FadeIn>

            {/* Quick Stats with Animated Counters */}
            <FadeIn delay={0.65}>
              <div className="mt-16 grid grid-cols-3 gap-8 max-w-md mx-auto">
                {[
                  { value: '14', label: 'Buses' },
                  { value: '4', label: 'Daily Shifts' },
                  { value: '700+', label: 'Seats' },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    className="text-center"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <p className="text-2xl sm:text-3xl font-extrabold text-white">
                      <AnimatedCounter value={stat.value} duration={1.5} />
                    </p>
                    <p className="text-xs text-white/50 mt-1 font-medium">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,60 1440,40 L1440,80 L0,80 Z" className="fill-dark-50 dark:fill-dark-800" />
          </svg>
        </div>
      </section>

      {/* Shift Schedule Section */}
      <section className="py-16 bg-dark-50 dark:bg-dark-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold text-dark-900 dark:text-white tracking-tight">
                Daily Shift Schedule
              </h2>
              <p className="mt-3 text-dark-500 dark:text-dark-400 max-w-lg mx-auto">
                4 shifts covering morning to night — plan your commute
              </p>
            </div>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SHIFT_SCHEDULE.map(s => (
              <StaggerItem key={s.shift}>
                <ScaleOnHover>
                  <div className="card !p-0 overflow-hidden">
                    <div className={`bg-gradient-to-r ${s.color} px-5 py-4 text-white`}>
                      <span className="text-3xl">{s.icon}</span>
                      <h3 className="font-bold text-lg mt-2">Shift {s.shift}</h3>
                      <p className="text-sm text-white/80">{s.label}</p>
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-dark-500 dark:text-dark-400">Time</span>
                        <span className="font-bold text-dark-900 dark:text-dark-100">{s.time}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-dark-500 dark:text-dark-400">Direction</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          s.dir === 'CUET-bound' ? 'bg-accent-100 text-accent-700' : 'bg-teal-100 text-teal-700'
                        }`}>
                          {s.dir}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-dark-500 dark:text-dark-400">Days</span>
                        <span className="font-semibold text-dark-700 dark:text-dark-200">{s.note}</span>
                      </div>
                    </div>
                  </div>
                </ScaleOnHover>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <FadeIn delay={0.4}>
            <p className="text-center text-sm text-dark-400 dark:text-dark-500 mt-4">
             On weekends (Fri-Sat): Only Shifts 2 & 4 operate. Timings adjusted by ±30 min.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-dark-800 transition-colors duration-250">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-14">
              <h2 className="text-3xl font-extrabold text-dark-900 dark:text-white tracking-tight">
                Why Choose CUETGo?
              </h2>
              <p className="mt-3 text-dark-500 dark:text-dark-400 max-w-lg mx-auto">
                Everything you need for a smooth bus commute to university
              </p>
            </div>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <StaggerItem key={index}>
                <ScaleOnHover>
                  <div className="card group">
                    <motion.div
                      className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 shadow-sm`}
                      whileHover={{ scale: 1.15, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <feature.icon className="text-white text-lg" />
                    </motion.div>
                    <h3 className="font-bold text-dark-900 dark:text-white text-lg">{feature.title}</h3>
                    <p className="text-dark-500 dark:text-dark-300 text-sm mt-2 leading-relaxed">{feature.desc}</p>
                  </div>
                </ScaleOnHover>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Available Buses Section */}
      <section className="py-20 bg-dark-50 dark:bg-dark-800/40 border-t border-dark-100 dark:border-dark-700/60 transition-colors duration-250">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-14">
              <h2 className="text-3xl font-extrabold text-dark-900 dark:text-white tracking-tight">
                Our Bus Fleet
              </h2>
              <p className="mt-3 text-dark-500 dark:text-dark-400 max-w-lg mx-auto">
                14 buses serving multiple routes across Chittagong
              </p>
            </div>
          </FadeIn>

          {loadingBuses ? (
            <div className="flex justify-center py-10">
              <motion.div
                className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            </div>
          ) : buses.length > 0 ? (
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {buses.map(bus => (
                <StaggerItem key={bus._id}>
                  <motion.div 
                    className="card !p-0 overflow-hidden cursor-pointer group bg-white dark:bg-dark-700 border border-dark-100 dark:border-dark-600/50"
                    onClick={() => handleBusClick(bus._id)}
                    whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-5 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FaBus className="text-white" />
                        <h3 className="font-bold text-white">{bus.busName}</h3>
                      </div>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        bus.busType === 'flyover' ? 'bg-white/30 text-white' : 'bg-white/20 text-white/90'
                      }`}>
                        {bus.busType}
                      </span>
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-dark-500 dark:text-dark-400 mb-3 line-clamp-2">{bus.route?.name}</p>
                      <div className="flex items-center justify-between text-xs text-dark-400 dark:text-dark-500">
                        <span className="flex items-center gap-1">
                          <FaMapMarkerAlt className="text-[10px]" />
                          {bus.route?.stops?.length} stops
                        </span>
                        <span className="font-bold text-accent-600 dark:text-accent-400">{bus.totalSeats} seats</span>
                      </div>
                    </div>
                    <div className="px-4 py-3 border-t border-dark-100 dark:border-dark-600/50 bg-dark-50/50 dark:bg-dark-800/30 group-hover:bg-primary-50 dark:group-hover:bg-primary-950/20 transition-colors flex items-center justify-between">
                      <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">
                        {user ? 'View Details' : 'Login to Book'}
                      </span>
                      <HiArrowRight className="text-primary-600 dark:text-primary-400 group-hover:translate-x-1 transition-transform text-sm" />
                    </div>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          ) : (
            <div className="text-center py-10 bg-white dark:bg-dark-700 rounded-2xl shadow-sm border border-dark-100 dark:border-dark-600/50">
              <FaBus className="text-4xl text-dark-300 dark:text-dark-600 mx-auto mb-3" />
              <p className="text-dark-500 dark:text-dark-400 font-medium">No buses available at the moment</p>
            </div>
          )}
          
          <FadeIn delay={0.3}>
            <div className="text-center mt-10">
              <Link to="/routes" className="inline-flex items-center gap-2 bg-white dark:bg-dark-700 text-dark-900 dark:text-white border border-dark-200 dark:border-dark-600/50 px-6 py-3 rounded-xl font-bold text-sm hover:bg-dark-50 dark:hover:bg-dark-600 transition-all shadow-sm">
                View All Routes
                <HiArrowRight />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white dark:bg-dark-800 transition-colors duration-250">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <motion.div
              className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-3xl p-10 sm:p-14 shadow-xl relative overflow-hidden"
              whileHover={{ scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <motion.div
                className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"
                animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"
                animate={{ scale: [1.2, 1, 1.2], rotate: [0, -90, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              />
              
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
            </motion.div>
          </FadeIn>
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
              <span className="font-bold text-white">CUETGo</span>
            </div>
            <p className="text-sm">© 2026 CUETGo Booking System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
