import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import StatsCard from '../components/ui/StatsCard';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { HiTicket, HiCurrencyDollar, HiClock, HiArrowRight } from 'react-icons/hi';
import { FaBus } from 'react-icons/fa';
import toast from 'react-hot-toast';

const SHIFT_ICONS = { 1: '', 2: '', 3: '', 4: '' };
const SHIFT_LABELS = { 1: 'Morning', 2: 'Afternoon', 3: 'Evening', 4: 'Night' };
const SHIFT_COLORS = {
  1: 'bg-teal-100 text-teal-700',
  2: 'bg-sky-100 text-sky-700',
  3: 'bg-indigo-100 text-indigo-700',
  4: 'bg-slate-200 text-slate-700',
};

const StudentDashboard = () => {
  const { user, loadUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingToCancel, setBookingToCancel] = useState(null);
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

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-dark-900">
          Welcome back, {user?.name?.split(' ')[0]}!
        </h1>
        <p className="text-dark-500 text-sm mt-1">Here's your booking overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon={HiCurrencyDollar} label="Points" value={user?.points ?? 0} color="primary" />
        <StatsCard icon={HiTicket} label="Active Bookings" value={activeBookings.length} color="accent" />
        <StatsCard icon={FaBus} label="Total Trips" value={bookings.filter(b => b.attendance === 'present').length} color="warning" />
        <StatsCard icon={HiClock} label="Total Bookings" value={bookings.length} color="danger" />
      </div>

      {/* Active Bookings */}
      {activeBookings.length > 0 ? (
        <div className="space-y-3">
          <h2 className="font-bold text-dark-900 text-lg">Active Bookings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeBookings.map(booking => (
              <div key={booking._id} className="card !p-0 overflow-hidden">
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
                      <p className="text-xs text-dark-400 font-medium">Seat</p>
                      <p className="font-bold text-dark-900 text-lg">{getSeatLabel(booking.seatNumber)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-dark-400 font-medium">Date</p>
                      <p className="font-bold text-accent-600">
                        {new Date(booking.travelDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-dark-400 font-medium">Status</p>
                      <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold bg-accent-100 text-accent-700">
                        {booking.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-dark-400 mb-3 line-clamp-1">� {booking.bus?.route?.name}</p>
                  <button
                    onClick={() => setBookingToCancel(booking._id)}
                    className="btn-danger text-sm !px-4 !py-2 w-full"
                  >
                    Cancel Booking
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card text-center py-10">
          <FaBus className="text-4xl text-dark-300 mx-auto mb-3" />
          <h3 className="font-bold text-dark-900 text-lg">No Active Bookings</h3>
          <p className="text-dark-500 text-sm mt-1">Book a seat to get started</p>
          <Link to="/student/booking" className="btn-primary inline-flex items-center gap-2 mt-4 text-sm">
            Book Now <HiArrowRight />
          </Link>
        </div>
      )}

      {/* Booking History */}
      {bookings.length > 0 && (
        <div className="card !p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-dark-100">
            <h2 className="font-bold text-dark-900">Booking History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-bold text-dark-500 uppercase">Bus</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-dark-500 uppercase">Shift</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-dark-500 uppercase">Seat</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-dark-500 uppercase">Date</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-dark-500 uppercase">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-dark-500 uppercase">Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-100">
                {bookings.map(booking => (
                  <tr key={booking._id} className="hover:bg-dark-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-dark-900">{booking.bus?.busName}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${SHIFT_COLORS[booking.shift]}`}>
                        {SHIFT_ICONS[booking.shift]} {SHIFT_LABELS[booking.shift]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-dark-600">{getSeatLabel(booking.seatNumber)}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-accent-700">
                      {new Date(booking.travelDate + 'T00:00:00').toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        booking.status === 'confirmed' ? 'bg-accent-100 text-accent-700' :
                        booking.status === 'cancelled' ? 'bg-danger-100 text-danger-700' :
                        'bg-dark-100 text-dark-600'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        booking.attendance === 'present' ? 'bg-accent-100 text-accent-700' :
                        booking.attendance === 'absent' ? 'bg-danger-100 text-danger-700' :
                        'bg-warning-50 text-warning-500'
                      }`}>
                        {booking.attendance}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      <Modal isOpen={!!bookingToCancel} onClose={() => !cancelling && setBookingToCancel(null)} title="Cancel Booking">
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-2 text-danger-500 text-2xl">
           
          </div>
          <h3 className="font-bold text-lg text-dark-900">Cancel Your Booking?</h3>
          <p className="text-sm text-dark-500 text-center">
            Are you sure you want to cancel this booking? 1 Point will be refunded.
          </p>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setBookingToCancel(null)}
              disabled={cancelling}
              className="btn-secondary flex-1"
            >
              Keep Booking
            </button>
            <button
              onClick={confirmCancel}
              disabled={cancelling}
              className="btn-danger flex-1 flex items-center justify-center gap-2"
            >
              {cancelling ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : 'Yes, Cancel'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StudentDashboard;
