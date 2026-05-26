import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import StatsCard from '../components/ui/StatsCard';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { HiTicket, HiCurrencyDollar, HiClock, HiArrowRight, HiQrcode, HiPrinter } from 'react-icons/hi';
import { FaBus } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FadeIn, StaggerContainer, StaggerItem } from '../components/ui/AnimatedComponents';
import { QRCodeSVG } from 'qrcode.react';
import { SkeletonCardGrid, SkeletonTable, SkeletonLine } from '../components/ui/Skeleton';

const SHIFT_ICONS = { 1: '🌅', 2: '☀️', 3: '🌇', 4: '🌙' };
const SHIFT_LABELS = { 1: 'Morning', 2: 'Afternoon', 3: 'Evening', 4: 'Night' };
const SHIFT_COLORS = {
  1: 'bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400',
  2: 'bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400',
  3: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400',
  4: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
};

const StudentDashboard = () => {
  const { user, loadUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchBookings();
    loadUser();
  }, []);

  const getSeatLabel = (number) => {
    if (!number) return '';
    const r = Math.floor((number - 1) / 5);
    const c = (number - 1) % 5 + 1;
    const rowLetter = String.fromCharCode(65 + r);
    return `${rowLetter}${c}`;
  };

  const fetchBookings = async () => {
    try {
      const res = await API.get('/bookings/my');
      setBookings(res.data);
    } catch (error) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const confirmCancel = async () => {
    if (!bookingToCancel) return;
    try {
      setCancelling(true);
      await API.delete(`/bookings/${bookingToCancel}`);
      toast.success('Booking cancelled');
      fetchBookings();
      loadUser();
      setBookingToCancel(null);
    } catch (error) {
      toast.error('Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  const activeBookings = bookings.filter(b => b.status === 'confirmed');
  const todayStr = new Date().toISOString().split('T')[0];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <SkeletonLine className="h-8 w-64" />
          <SkeletonLine className="h-4 w-48" />
        </div>
        <SkeletonCardGrid count={4} />
        <div className="space-y-3 pt-2">
          <SkeletonLine className="h-6 w-32" />
          <SkeletonCardGrid count={2} className="grid grid-cols-1 md:grid-cols-2 gap-4" />
        </div>
        <div className="pt-2">
          <SkeletonTable rows={4} cols={6} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-2xl font-extrabold text-dark-900 dark:text-white">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-dark-500 dark:text-dark-400 text-sm mt-1">Here's your booking overview</p>
        </div>
      </FadeIn>

      {/* Stats */}
      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StaggerItem>
          <StatsCard icon={HiCurrencyDollar} label="Points" value={user?.points ?? 0} color="primary" />
        </StaggerItem>
        <StaggerItem>
          <StatsCard icon={HiTicket} label="Active Bookings" value={activeBookings.length} color="accent" />
        </StaggerItem>
        <StaggerItem>
          <StatsCard icon={FaBus} label="Total Trips" value={bookings.filter(b => b.attendance === 'present').length} color="warning" />
        </StaggerItem>
        <StaggerItem>
          <StatsCard icon={HiClock} label="Total Bookings" value={bookings.length} color="danger" />
        </StaggerItem>
      </StaggerContainer>

      {/* Active Bookings */}
      {activeBookings.length > 0 ? (
        <FadeIn delay={0.3}>
          <div className="space-y-3">
            <h2 className="font-bold text-dark-900 dark:text-white text-lg">Active Bookings</h2>
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-4" staggerDelay={0.1}>
              {activeBookings.map(booking => (
                <StaggerItem key={booking._id}>
                  <motion.div
                    className="card !p-0 overflow-hidden"
                    whileHover={{ y: -2 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-5 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FaBus className="text-white" />
                        <span className="font-bold text-white">{booking.bus?.busName}</span>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${SHIFT_COLORS[booking.shift]}`}>
                        {SHIFT_ICONS[booking.shift]} Shift {booking.shift} — {SHIFT_LABELS[booking.shift]}
                      </span>
                    </div>
                    <div className="p-5">
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-dark-400 dark:text-dark-500 font-medium">Seat</p>
                          <p className="font-bold text-dark-900 dark:text-white text-lg">{getSeatLabel(booking.seatNumber)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-dark-400 dark:text-dark-500 font-medium">Date</p>
                          <p className="font-bold text-accent-600 dark:text-accent-400">
                            {new Date(booking.travelDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-dark-400 dark:text-dark-500 font-medium">Status</p>
                          <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold bg-accent-100 dark:bg-accent-950/40 text-accent-700 dark:text-accent-400">
                            {booking.status}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-dark-400 dark:text-dark-500 mb-4 line-clamp-1">📍 {booking.bus?.route?.name}</p>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedTicket(booking)}
                          className="btn-primary text-sm !px-4 !py-2.5 flex-1 flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md transition-all duration-200"
                        >
                          <HiQrcode className="text-lg" /> View Ticket
                        </button>
                        <button
                          onClick={() => setBookingToCancel(booking._id)}
                          className="btn-danger !bg-transparent hover:!bg-danger-50 text-danger-500 dark:text-danger-400 border border-danger-200 dark:border-danger-900/50 text-sm !px-4 !py-2.5 rounded-xl font-semibold transition-all duration-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </FadeIn>
      ) : (
        <FadeIn delay={0.3}>
          <motion.div
            className="card text-center py-10"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <motion.div
              animate={{ y: [-4, 4, -4] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <FaBus className="text-4xl text-dark-300 dark:text-dark-600 mx-auto mb-3" />
            </motion.div>
            <h3 className="font-bold text-dark-900 dark:text-white text-lg">No Active Bookings</h3>
            <p className="text-dark-500 dark:text-dark-400 text-sm mt-1">Book a seat to get started</p>
            <Link to="/student/booking" className="btn-primary inline-flex items-center gap-2 mt-4 text-sm">
              Book Now <HiArrowRight />
            </Link>
          </motion.div>
        </FadeIn>
      )}

      {/* Booking History */}
      {bookings.length > 0 && (
        <FadeIn delay={0.5}>
          <div className="card !p-0 overflow-hidden dark:border-dark-800/80">
            <div className="px-6 py-4 border-b border-dark-100 dark:border-dark-800/80">
              <h2 className="font-bold text-dark-900 dark:text-white">Booking History</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-50 dark:bg-dark-900/60 border-b border-dark-100 dark:border-dark-800/60">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-bold text-dark-500 dark:text-dark-400 uppercase">Bus</th>
                    <th className="text-left px-6 py-3 text-xs font-bold text-dark-500 dark:text-dark-400 uppercase">Shift</th>
                    <th className="text-left px-6 py-3 text-xs font-bold text-dark-500 dark:text-dark-400 uppercase">Seat</th>
                    <th className="text-left px-6 py-3 text-xs font-bold text-dark-500 dark:text-dark-400 uppercase">Date</th>
                    <th className="text-left px-6 py-3 text-xs font-bold text-dark-500 dark:text-dark-400 uppercase">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-bold text-dark-500 dark:text-dark-400 uppercase">Attendance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-100 dark:divide-dark-800/50">
                  {bookings.map((booking, index) => (
                    <motion.tr
                      key={booking._id}
                      className="hover:bg-dark-50 dark:hover:bg-dark-800/30 transition-colors"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-dark-900 dark:text-dark-100">{booking.bus?.busName}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${SHIFT_COLORS[booking.shift]}`}>
                          {SHIFT_ICONS[booking.shift]} {SHIFT_LABELS[booking.shift]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-dark-600 dark:text-dark-300">{getSeatLabel(booking.seatNumber)}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-accent-700 dark:text-accent-400">
                        {new Date(booking.travelDate + 'T00:00:00').toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          booking.status === 'confirmed' ? 'bg-accent-100 dark:bg-accent-950/40 text-accent-700 dark:text-accent-400' :
                          booking.status === 'cancelled' ? 'bg-danger-100 dark:bg-danger-950/30 text-danger-700 dark:text-danger-400' :
                          'bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-400'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          booking.attendance === 'present' ? 'bg-accent-100 dark:bg-accent-950/40 text-accent-700 dark:text-accent-400' :
                          booking.attendance === 'absent' ? 'bg-danger-100 dark:bg-danger-950/30 text-danger-700 dark:text-danger-400' :
                          'bg-warning-50 dark:bg-warning-950/20 text-warning-600 dark:text-warning-400'
                        }`}>
                          {booking.attendance}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </FadeIn>
      )}

      {/* Cancel Confirmation Modal */}
      <Modal isOpen={!!bookingToCancel} onClose={() => !cancelling && setBookingToCancel(null)} title="Cancel Booking">
        <div className="space-y-4 text-center">
          <motion.div
            className="w-16 h-16 bg-danger-50 dark:bg-danger-950/30 rounded-full flex items-center justify-center mx-auto mb-2 text-danger-500 text-2xl"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            ⚠️
          </motion.div>
          <h3 className="font-bold text-lg text-dark-900 dark:text-white">Cancel Your Booking?</h3>
          <p className="text-sm text-dark-500 dark:text-dark-400 text-center">
            Are you sure you want to cancel this booking? 1 Point will be refunded.
          </p>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setBookingToCancel(null)}
              disabled={cancelling}
              className="btn-secondary flex-1 dark:bg-transparent dark:text-dark-300 dark:border-dark-800 hover:dark:bg-dark-800"
            >
              Keep Booking
            </button>
            <button
              onClick={confirmCancel}
              disabled={cancelling}
              className="btn-danger flex-1 flex items-center justify-center gap-2"
            >
              {cancelling ? (
                <motion.div
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                />
              ) : 'Yes, Cancel'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Ticket QR Modal */}
      <Modal isOpen={!!selectedTicket} onClose={() => setSelectedTicket(null)} title="Transit Ticket">
        {selectedTicket && (
          <div className="space-y-6">
            {/* Boarding Pass Ticket Layout */}
            <div className="border-2 border-dashed border-dark-200 dark:border-dark-800/80 rounded-2xl p-6 bg-gradient-to-b from-white to-dark-50/50 dark:from-dark-800 dark:to-dark-900/50 shadow-sm relative overflow-hidden">
              {/* Decorative side cutouts */}
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-dark-50 dark:bg-dark-900 border-r border-dark-200 dark:border-dark-800/80" />
              <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-dark-50 dark:bg-dark-900 border-l border-dark-200 dark:border-dark-800/80" />
              
              {/* Header */}
              <div className="flex justify-between items-center pb-4 border-b border-dark-100 dark:border-dark-800/80">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-primary-500">Official Ticket</span>
                  <h4 className="font-extrabold text-xl text-dark-900 dark:text-white">CUETGo</h4>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-dark-400 dark:text-dark-500 block">Ticket Code</span>
                  <span className="text-xs font-mono font-bold text-dark-700 dark:text-dark-300">
                    {selectedTicket._id.substring(selectedTicket._id.length - 8).toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Passenger Info */}
              <div className="py-4 grid grid-cols-2 gap-3 border-b border-dark-100 dark:border-dark-800/80">
                <div>
                  <span className="text-[10px] text-dark-400 dark:text-dark-500 block">Passenger</span>
                  <span className="text-sm font-bold text-dark-800 dark:text-dark-200">{user?.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-dark-400 dark:text-dark-500 block">Student ID / Dept</span>
                  <span className="text-sm font-semibold text-dark-700 dark:text-dark-300">
                    {user?.studentId || 'N/A'} • {user?.department || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Trip details */}
              <div className="py-4 grid grid-cols-2 gap-y-4 gap-x-3 border-b border-dark-100 dark:border-dark-800/80">
                <div>
                  <span className="text-[10px] text-dark-400 dark:text-dark-500 block">Bus</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <FaBus className="text-primary-500 text-xs" />
                    <span className="text-sm font-bold text-dark-800 dark:text-dark-200">{selectedTicket.bus?.busName}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-dark-400 dark:text-dark-500 block">Seat Number</span>
                  <span className="text-sm font-bold text-accent-600 dark:text-accent-400">{getSeatLabel(selectedTicket.seatNumber)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-dark-400 dark:text-dark-500 block">Travel Date</span>
                  <span className="text-sm font-bold text-dark-800 dark:text-dark-200">
                    {new Date(selectedTicket.travelDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-dark-400 dark:text-dark-500 block">Shift</span>
                  <span className="text-sm font-bold text-dark-800 dark:text-dark-200">
                    {SHIFT_ICONS[selectedTicket.shift]} {SHIFT_LABELS[selectedTicket.shift]} (Shift {selectedTicket.shift})
                  </span>
                </div>
              </div>

              {/* QR Code */}
              <div className="pt-6 flex flex-col items-center justify-center">
                <div className="bg-white p-3 rounded-xl shadow-sm border border-dark-100 dark:border-dark-800/80">
                  <QRCodeSVG 
                    value={selectedTicket._id} 
                    size={160}
                    level="H"
                    includeMargin={false}
                  />
                </div>
                <p className="text-[10px] text-dark-400 dark:text-dark-500 mt-3 text-center uppercase tracking-wider font-semibold">
                  Show to mark attendance
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => window.print()}
                className="btn-secondary flex-1 flex items-center justify-center gap-2 dark:bg-transparent dark:text-dark-300 dark:border-dark-800 hover:dark:bg-dark-800"
              >
                <HiPrinter className="text-lg" /> Print Ticket
              </button>
              <button
                onClick={() => setSelectedTicket(null)}
                className="btn-primary flex-1"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StudentDashboard;
