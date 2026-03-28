import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import SeatGrid from '../components/ui/SeatGrid';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Modal from '../components/ui/Modal';
import { FaBus, FaClock, FaMapMarkerAlt } from 'react-icons/fa';
import { HiArrowRight } from 'react-icons/hi';
import toast from 'react-hot-toast';

const SeatBooking = () => {
  const { user, loadUser } = useAuth();
  const [searchParams] = useSearchParams();
  const busIdFromQuery = searchParams.get('bus');
  const [buses, setBuses] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const getSeatLabel = (number) => {
    if (!number) return '';
    const r = Math.floor((number - 1) / 5);
    const c = (number - 1) % 5 + 1;
    const rowLetter = String.fromCharCode(65 + r);
    return `${rowLetter}${c}`;
  };

  const cancelActiveBooking = async () => {
    try {
      setCancelling(true);
      const res = await API.get('/bookings/my');
      const active = res.data.find(b => b.status === 'confirmed');
      if (active) {
        await API.delete(`/bookings/${active._id}`);
        toast.success('Booking cancelled successfully');
        loadUser();
        if (selectedBus) selectBus(selectedBus._id);
        setShowCancelConfirm(false);
      }
    } catch (error) {
      toast.error('Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  useEffect(() => {
    fetchBuses();
  }, []);

  useEffect(() => {
    if (busIdFromQuery) {
      selectBus(busIdFromQuery);
    }
  }, [busIdFromQuery]);

  const fetchBuses = async () => {
    try {
      const res = await API.get('/buses');
      setBuses(res.data);
    } catch (error) {
      toast.error('Failed to load buses');
    } finally {
      setLoading(false);
    }
  };

  const selectBus = async (busId) => {
    try {
      setLoading(true);
      const res = await API.get(`/buses/${busId}`);
      setSelectedBus(res.data);
      setSelectedSeat(null);
    } catch (error) {
      toast.error('Failed to load bus details');
    } finally {
      setLoading(false);
    }
  };

  const handleBookSeat = async () => {
    if (!selectedSeat || !selectedBus) return;
    setBooking(true);
    try {
      await API.post('/bookings', {
        busId: selectedBus._id,
        seatNumber: selectedSeat,
      });
      toast.success('Seat booked successfully! 🎉');
      setShowConfirm(false);
      setSelectedSeat(null);
      selectBus(selectedBus._id); // Refresh seat data
      loadUser();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  if (loading && !selectedBus) return <LoadingSpinner />;

  // Check if user already has a booking
  const hasActiveBooking = user?.bookedSeat?.seatNumber;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-dark-900">Book a Seat</h1>
        <p className="text-dark-500 text-sm mt-1">Choose your bus and select a seat</p>
      </div>

      {hasActiveBooking && (
        <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent-500/20 rounded-full blur-xl transform -translate-x-5 translate-y-5" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
                <FaBus className="text-3xl text-white" />
              </div>
              <div>
                <span className="bg-accent-500 text-white text-[10px] font-extrabold uppercase px-2 py-1 rounded-full tracking-wider mb-2 inline-block">
                  Active Ticket
                </span>
                <h2 className="text-xl md:text-2xl font-bold mb-1">
                  You have a booked seat: <span className="text-accent-300 ml-1">Seat {getSeatLabel(hasActiveBooking)}</span>
                </h2>
                <p className="text-primary-100 text-sm max-w-lg">
                  You successfully secured your spot! If you want to change your seat or bus, you must cancel this active booking first.
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => setShowCancelConfirm(true)}
              className="px-6 py-3 bg-white text-primary-700 hover:bg-primary-50 hover:scale-105 active:scale-95 rounded-xl font-bold transition-all shadow-lg whitespace-nowrap"
            >
              Cancel Booking
            </button>
          </div>
        </div>
      )}

      {!selectedBus ? (
        /* Bus List */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {buses.map(bus => (
            <button
              key={bus._id}
              onClick={() => selectBus(bus._id)}
              className="card text-left group hover:scale-[1.02] transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-primary-100 p-3 rounded-xl group-hover:bg-primary-200 transition-colors">
                    <FaBus className="text-primary-600 text-lg" />
                  </div>
                  <div>
                    <h3 className="font-bold text-dark-900">{bus.busNumber}</h3>
                    <p className="text-sm text-dark-500">{bus.route?.name}</p>
                  </div>
                </div>
                <HiArrowRight className="text-dark-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
              </div>
              <div className="mt-4 flex items-center gap-4 text-xs text-dark-500">
                <span className="flex items-center gap-1">
                  <FaClock className="text-dark-400" />
                  {bus.schedule?.departure} - {bus.schedule?.arrival}
                </span>
                <span className="flex items-center gap-1">
                  <FaMapMarkerAlt className="text-dark-400" />
                  {bus.route?.stops?.length} stops
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 bg-dark-100 rounded-full overflow-hidden" style={{ width: '120px' }}>
                    <div 
                      className="h-full bg-accent-500 rounded-full transition-all"
                      style={{ width: `${((bus.totalSeats - (bus.availableSeats ?? bus.totalSeats)) / bus.totalSeats) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs font-bold text-accent-600">
                  {bus.availableSeats ?? bus.totalSeats}/{bus.totalSeats} available
                </span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        /* Seat Selection */
        <div>
          <button
            onClick={() => { setSelectedBus(null); setSelectedSeat(null); }}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium mb-4 flex items-center gap-1"
          >
            ← Back to bus list
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bus Info */}
            <div className="lg:col-span-1 space-y-4">
              <div className="card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-primary-100 p-3 rounded-xl">
                    <FaBus className="text-primary-600 text-lg" />
                  </div>
                  <div>
                    <h3 className="font-bold text-dark-900">{selectedBus.busNumber}</h3>
                    <p className="text-sm text-dark-500">{selectedBus.route?.name}</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-dark-100">
                    <span className="text-dark-500">Departure</span>
                    <span className="font-semibold">{selectedBus.schedule?.departure}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-dark-100">
                    <span className="text-dark-500">Arrival</span>
                    <span className="font-semibold">{selectedBus.schedule?.arrival}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-dark-100">
                    <span className="text-dark-500">Total Seats</span>
                    <span className="font-semibold">{selectedBus.totalSeats}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-dark-500">Available</span>
                    <span className="font-bold text-accent-600">{selectedBus.availableSeats}</span>
                  </div>
                </div>

                {/* Stops */}
                <div className="mt-4">
                  <p className="font-bold text-dark-900 text-sm mb-3">Route Stops</p>
                  <div className="space-y-2">
                    {selectedBus.route?.stops?.map((stop, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-accent-500' : i === selectedBus.route.stops.length - 1 ? 'bg-primary-500' : 'bg-dark-300'}`} />
                          {i < selectedBus.route.stops.length - 1 && <div className="w-0.5 h-4 bg-dark-200" />}
                        </div>
                        <div className="flex-1 flex justify-between items-center">
                          <span className="text-sm text-dark-700">{stop.name}</span>
                          <span className="text-xs text-dark-400 font-medium">{stop.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {selectedSeat && (
                <button
                  onClick={() => setShowConfirm(true)}
                  disabled={hasActiveBooking}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  Confirm Seat {getSeatLabel(selectedSeat)} <HiArrowRight />
                </button>
              )}
            </div>

            {/* Seat Grid */}
            <div className="lg:col-span-2">
              <div className="card">
                <h3 className="font-bold text-dark-900 text-center mb-4">Select Your Seat</h3>
                <SeatGrid
                  seats={selectedBus.seats}
                  selectedSeat={selectedSeat}
                  onSelectSeat={setSelectedSeat}
                  readOnly={hasActiveBooking}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)} title="Confirm Booking">
        <div className="space-y-4">
          <div className="bg-primary-50 rounded-xl p-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-dark-400">Bus:</span> <span className="font-bold">{selectedBus?.busNumber}</span></div>
              <div><span className="text-dark-400">Seat:</span> <span className="font-bold">{getSeatLabel(selectedSeat)}</span></div>
              <div><span className="text-dark-400">Route:</span> <span className="font-bold">{selectedBus?.route?.name}</span></div>
              <div><span className="text-dark-400">Time:</span> <span className="font-bold">{selectedBus?.schedule?.departure}</span></div>
            </div>
          </div>
          <p className="text-sm text-dark-500">
            By confirming, you agree to the one-seat-per-student policy. 1 Point will be deducted upon booking.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setShowConfirm(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleBookSeat} disabled={booking} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {booking ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : 'Confirm Booking'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal isOpen={showCancelConfirm} onClose={() => !cancelling && setShowCancelConfirm(false)} title="Cancel Seat">
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-2 text-danger-500 text-2xl">
            ⚠️
          </div>
          <h3 className="font-bold text-lg text-dark-900">Cancel Your Booking?</h3>
          <p className="text-sm text-dark-500 text-center">
            Are you sure you want to cancel your seat? This action cannot be undone and you might lose your spot.
          </p>
          <div className="flex gap-3 mt-6">
            <button 
              onClick={() => setShowCancelConfirm(false)} 
              disabled={cancelling}
              className="btn-secondary flex-1"
            >
              Keep Seat
            </button>
            <button 
              onClick={cancelActiveBooking} 
              disabled={cancelling} 
              className="btn-danger flex-1 flex items-center justify-center gap-2"
            >
              {cancelling ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : 'Yes, Cancel Seat'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SeatBooking;
