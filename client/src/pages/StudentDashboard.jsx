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

  const activeBooking = bookings.find(b => b.status === 'confirmed');

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-dark-900">
          Welcome back, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-dark-500 text-sm mt-1">Here's your booking overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon={HiCurrencyDollar} label="Points" value={user?.points ?? 0} color="primary" />
        <StatsCard icon={HiTicket} label="Active Booking" value={activeBooking ? '1' : '0'} color="accent" />
        <StatsCard icon={FaBus} label="Total Trips" value={bookings.filter(b => b.attendance === 'present').length} color="warning" />
        <StatsCard icon={HiClock} label="Total Bookings" value={bookings.length} color="danger" />
      </div>

      {/* Active Booking Card */}
      {activeBooking ? (
        <div className="card !p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
            <h2 className="font-bold text-white flex items-center gap-2">
              <FaBus /> Active Booking
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-dark-400 font-medium">Bus</p>
                <p className="font-bold text-dark-900">{activeBooking.bus?.busNumber}</p>
              </div>
              <div>
                <p className="text-xs text-dark-400 font-medium">Seat</p>
                <p className="font-bold text-dark-900">{getSeatLabel(activeBooking.seatNumber)}</p>
              </div>
              <div>
                <p className="text-xs text-dark-400 font-medium">Route</p>
                <p className="font-bold text-dark-900">{activeBooking.bus?.route?.name}</p>
              </div>
              <div>
                <p className="text-xs text-dark-400 font-medium">Status</p>
                <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold bg-accent-100 text-accent-700">
                  {activeBooking.status}
                </span>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button onClick={() => setBookingToCancel(activeBooking._id)} className="btn-danger text-sm !px-4 !py-2">
                Cancel Booking
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="card text-center py-10">
          <FaBus className="text-4xl text-dark-300 mx-auto mb-3" />
          <h3 className="font-bold text-dark-900 text-lg">No Active Booking</h3>
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
                  <th className="text-left px-6 py-3 text-xs font-bold text-dark-500 uppercase">Seat</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-dark-500 uppercase">Date</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-dark-500 uppercase">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-dark-500 uppercase">Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-100">
                {bookings.map(booking => (
                  <tr key={booking._id} className="hover:bg-dark-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-dark-900">{booking.bus?.busNumber}</td>
                    <td className="px-6 py-4 text-sm text-dark-600">{getSeatLabel(booking.seatNumber)}</td>
                    <td className="px-6 py-4 text-sm text-dark-600">
                      {new Date(booking.createdAt).toLocaleDateString()}
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
            ⚠️
          </div>
          <h3 className="font-bold text-lg text-dark-900">Cancel Your Booking?</h3>
          <p className="text-sm text-dark-500 text-center">
            Are you sure you want to cancel this booking? This action is permanent.
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
