import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import SeatGrid from '../components/ui/SeatGrid';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Modal from '../components/ui/Modal';
import { FaBus, FaClock, FaMapMarkerAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { HiArrowRight, HiArrowNarrowRight, HiSun, HiMoon } from 'react-icons/hi';
import toast from 'react-hot-toast';

const SHIFT_ICONS = {
  1: '',
  2: '',
  3: '',
  4: '',
};

const SHIFT_GRADIENTS = {
  1: 'from-teal-400 to-teal-600',
  2: 'from-sky-400 to-blue-500',
  3: 'from-indigo-400 to-purple-500',
  4: 'from-slate-600 to-slate-800',
};

const SHIFT_BG = {
  1: 'bg-teal-50 border-teal-200 hover:border-amber-400',
  2: 'bg-sky-50 border-sky-200 hover:border-sky-400',
  3: 'bg-indigo-50 border-indigo-200 hover:border-indigo-400',
  4: 'bg-slate-50 border-slate-200 hover:border-slate-400',
};

const SHIFT_SELECTED = {
  1: 'bg-teal-500 border-amber-500 text-white shadow-lg shadow-amber-500/25',
  2: 'bg-sky-500 border-sky-500 text-white shadow-lg shadow-sky-500/25',
  3: 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/25',
  4: 'bg-slate-700 border-slate-700 text-white shadow-lg shadow-slate-700/25',
};

const SeatBooking = () => {
  const { user, loadUser } = useAuth();
  const [searchParams] = useSearchParams();
  const busIdFromQuery = searchParams.get('bus');

  const [buses, setBuses] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [selectedShift, setSelectedShift] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busLoading, setBusLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const dateScrollRef = useRef(null);

  // Generate dates for the next 14 days
  const generateDates = () => {
    const dates = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.getDate();
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });
      const isToday = i === 0;
      dates.push({ dateStr, dayName, dayNum, monthName, isToday });
    }
    return dates;
  };

  const [dates] = useState(generateDates);
  const [selectedDate, setSelectedDate] = useState(dates[0].dateStr);

  const getSeatLabel = (number) => {
    if (!number) return '';
    const r = Math.floor((number - 1) / 5);
    const c = (number - 1) % 5 + 1;
    const rowLetter = String.fromCharCode(65 + r);
    return `${rowLetter}${c}`;
  };

  useEffect(() => {
    fetchBuses();
  }, []);

  useEffect(() => {
    fetchShifts(selectedDate);
    setSelectedShift(null);
    setSelectedBus(null);
    setSelectedSeat(null);
  }, [selectedDate]);

  useEffect(() => {
    if (busIdFromQuery && selectedShift) {
      selectBus(busIdFromQuery);
    }
  }, [busIdFromQuery, selectedShift]);

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

  const fetchShifts = async (dateStr) => {
    try {
      const res = await API.get(`/shifts?date=${dateStr}`);
      setShifts(res.data);
    } catch (error) {
      toast.error('Failed to load shifts');
    }
  };

  const selectBus = async (busId) => {
    if (!selectedShift) {
      toast.error('Please select a shift first');
      return;
    }
    try {
      setBusLoading(true);
      const res = await API.get(`/buses/${busId}?date=${selectedDate}&shift=${selectedShift.shift}`);
      setSelectedBus(res.data);
      setSelectedSeat(null);
    } catch (error) {
      toast.error('Failed to load bus details');
    } finally {
      setBusLoading(false);
    }
  };

  const handleShiftSelect = async (shift) => {
    setSelectedShift(shift);
    setSelectedBus(null);
    setSelectedSeat(null);
    try {
      setBusLoading(true);
      const res = await API.get(`/buses?date=${selectedDate}&shift=${shift.shift}`);
      setBuses(res.data);
    } catch (error) {
      toast.error('Failed to load bus availability');
    } finally {
      setBusLoading(false);
    }
  };

  const scrollDates = (direction) => {
    if (dateScrollRef.current) {
      dateScrollRef.current.scrollBy({ left: direction * 200, behavior: 'smooth' });
    }
  };

  const handleBookSeat = async () => {
    if (!selectedSeat || !selectedBus || !selectedShift) return;
    setBooking(true);
    try {
      await API.post('/bookings', {
        busId: selectedBus._id,
        seatNumber: selectedSeat,
        travelDate: selectedDate,
        shift: selectedShift.shift,
      });
      toast.success('Seat booked successfully!�');
      setShowConfirm(false);
      setSelectedSeat(null);
      selectBus(selectedBus._id);
      loadUser();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  // Step-based rendering
  const step = selectedBus ? 3 : selectedShift ? 2 : 1;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-dark-900">Book a Seat</h1>
        <p className="text-dark-500 text-sm mt-1">Select date → shift → bus → seat</p>
      </div>

      {/* ═══ DATE PAGINATION (Shohoz-style) ═══ */}
      <div className="relative">
        <div className="flex items-center gap-2">
          <button
            onClick={() => scrollDates(-1)}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white border border-dark-200 text-dark-500 hover:bg-dark-50 hover:text-dark-700 transition-all shadow-sm"
          >
            <FaChevronLeft className="text-xs" />
          </button>
          
          <div
            ref={dateScrollRef}
            className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth flex-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {dates.map(d => {
              const isSelected = selectedDate === d.dateStr;
              return (
                <button
                  key={d.dateStr}
                  onClick={() => setSelectedDate(d.dateStr)}
                  className={`flex-shrink-0 flex flex-col items-center px-4 py-3 rounded-xl border-2 transition-all duration-200 min-w-[72px] ${
                    isSelected
                      ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-600/25 scale-105'
                      : 'bg-white border-dark-100 text-dark-600 hover:border-primary-300 hover:bg-primary-50'
                  }`}
                >
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-white/80' : 'text-dark-400'}`}>
                    {d.isToday ? 'Today' : d.dayName}
                  </span>
                  <span className={`text-xl font-black ${isSelected ? 'text-white' : 'text-dark-900'}`}>
                    {d.dayNum}
                  </span>
                  <span className={`text-[10px] font-semibold ${isSelected ? 'text-white/70' : 'text-dark-400'}`}>
                    {d.monthName}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => scrollDates(1)}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white border border-dark-200 text-dark-500 hover:bg-dark-50 hover:text-dark-700 transition-all shadow-sm"
          >
            <FaChevronRight className="text-xs" />
          </button>
        </div>
      </div>

      {/* ═══ SHIFT SELECTION ═══ */}
      <div>
        <h2 className="text-sm font-bold text-dark-700 mb-3 flex items-center gap-2">
          <span className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-black">1</span>
          Select Shift
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {shifts.map(shift => {
            const isSelected = selectedShift?.shift === shift.shift;
            return (
              <button
                key={shift.shift}
                onClick={() => handleShiftSelect(shift)}
                className={`relative rounded-xl border-2 p-4 transition-all duration-200 text-left ${
                  isSelected
                    ? SHIFT_SELECTED[shift.shift]
                    : SHIFT_BG[shift.shift]
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{SHIFT_ICONS[shift.shift]}</span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    isSelected 
                      ? 'bg-white/20 text-white'
                      : shift.direction === 'inbound' 
                        ? 'bg-accent-100 text-accent-700' 
                        : 'bg-teal-100 text-teal-700'
                  }`}>
                    {shift.directionLabel}
                  </span>
                </div>
                <h3 className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-dark-900'}`}>
                  Shift {shift.shift} — {shift.label}
                </h3>
                <div className={`flex items-center gap-1 mt-1.5 text-xs font-semibold ${isSelected ? 'text-white/80' : 'text-dark-500'}`}>
                  <FaClock className="text-[10px]" />
                  {shift.departure} → {shift.arrival}
                </div>
                {shift.specialRoute && (
                  <p className={`mt-2 text-[11px] font-medium ${isSelected ? 'text-white/70' : 'text-dark-400'}`}>
                   � {shift.specialRoute}
                  </p>
                )}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-white/30 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
        {shifts.length === 0 && (
          <div className="card text-center py-8">
            <p className="text-dark-400 text-sm">No shifts available for this date</p>
          </div>
        )}
      </div>

      {/* ═══ BUS SELECTION ═══ */}
      {selectedShift && !selectedBus && !busLoading && (
        <div>
          <h2 className="text-sm font-bold text-dark-700 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-black">2</span>
            Select Bus
            <span className="text-xs font-normal text-dark-400">
              ({buses.length} buses available)
            </span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {buses.map(bus => (
              <button
                key={bus._id}
                onClick={() => selectBus(bus._id)}
                className="card text-left group hover:scale-[1.01] hover:shadow-lg transition-all duration-200 !p-0 overflow-hidden"
              >
                <div className={`bg-gradient-to-r ${SHIFT_GRADIENTS[selectedShift.shift]} px-4 py-2.5 flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <FaBus className="text-white text-sm" />
                    <h3 className="font-bold text-white text-sm">{bus.busName}</h3>
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    bus.busType === 'flyover' ? 'bg-white/30 text-white' : 'bg-white/20 text-white/90'
                  }`}>
                    {bus.busType}
                  </span>
                </div>
                <div className="p-4">
                  <p className="text-xs text-dark-500 mb-2 line-clamp-1">{bus.route?.name}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-dark-400">
                      <FaMapMarkerAlt className="text-[10px]" />
                      {bus.route?.stops?.length} stops
                    </div>
                    <span className="text-xs font-bold text-accent-600">
                      {bus.availableSeats !== undefined ? `${bus.availableSeats}/${bus.totalSeats} empty` : `${bus.totalSeats} seats`}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ═══ BUS LOADING ═══ */}
      {busLoading && (
        <div className="flex justify-center py-10">
          <LoadingSpinner />
        </div>
      )}

      {/* ═══ SEAT SELECTION ═══ */}
      {selectedBus && !busLoading && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => { setSelectedBus(null); setSelectedSeat(null); }}
              className="text-sm text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1 bg-primary-50 px-3 py-1.5 rounded-lg"
            >
              ← Change Bus
            </button>
            <h2 className="text-sm font-bold text-dark-700 flex items-center gap-2">
              <span className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-black">3</span>
              Select Your Seat
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bus Info Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              <div className="card !p-0 overflow-hidden">
                <div className={`bg-gradient-to-r ${SHIFT_GRADIENTS[selectedShift.shift]} px-5 py-4`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <FaBus className="text-white text-lg" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">{selectedBus.busName}</h3>
                      <span className="text-white/70 text-xs font-medium uppercase">{selectedBus.busType} Bus</span>
                    </div>
                  </div>
                </div>
                <div className="p-5 space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-dark-100">
                    <span className="text-dark-500">Shift</span>
                    <span className="font-bold text-dark-900">{SHIFT_ICONS[selectedShift.shift]} Shift {selectedShift.shift} — {selectedShift.label}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-dark-100">
                    <span className="text-dark-500">Departure</span>
                    <span className="font-semibold">{selectedShift.departure}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-dark-100">
                    <span className="text-dark-500">Arrival</span>
                    <span className="font-semibold">{selectedShift.arrival}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-dark-100">
                    <span className="text-dark-500">Direction</span>
                    <span className={`font-bold text-xs px-2 py-0.5 rounded-full ${
                      selectedShift.direction === 'inbound' 
                        ? 'bg-accent-100 text-accent-700' 
                        : 'bg-teal-100 text-teal-700'
                    }`}>
                      {selectedShift.directionLabel}
                    </span>
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

                {/* Route */}
                <div className="px-5 pb-5">
                  <p className="font-bold text-dark-900 text-sm mb-3">
                    {selectedShift.specialRoute ? '� Special Route' : '� Route'}
                  </p>
                  {selectedShift.specialRoute ? (
                    <div className="bg-teal-50 border border-teal-200 rounded-xl p-3">
                      <p className="text-sm font-semibold text-amber-800">{selectedShift.specialRoute}</p>
                      <p className="text-xs text-amber-600 mt-1">{selectedShift.description}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedBus.route?.stops?.map((stop, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-accent-500' : i === selectedBus.route.stops.length - 1 ? 'bg-primary-500' : 'bg-dark-300'}`} />
                            {i < selectedBus.route.stops.length - 1 && <div className="w-0.5 h-4 bg-dark-200" />}
                          </div>
                          <span className="text-sm text-dark-700">{stop.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {selectedSeat && (
                <button
                  onClick={() => setShowConfirm(true)}
                  className="btn-primary w-full flex items-center justify-center gap-2 text-base py-3"
                >
                  Confirm Seat {getSeatLabel(selectedSeat)} <HiArrowRight />
                </button>
              )}
            </div>

            {/* Seat Grid */}
            <div className="lg:col-span-2">
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-dark-900">Select Your Seat</h3>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded bg-dark-100 border border-dark-200" />
                      <span className="text-dark-500">Available</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded bg-primary-500" />
                      <span className="text-dark-500">Selected</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded bg-dark-400" />
                      <span className="text-dark-500">Booked</span>
                    </div>
                  </div>
                </div>
                <SeatGrid
                  seats={selectedBus.seats}
                  selectedSeat={selectedSeat}
                  onSelectSeat={setSelectedSeat}
                  readOnly={false}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ BOOKING SUMMARY BAR (mobile-friendly) ═══ */}
      {selectedDate && selectedShift && !selectedBus && (
        <div className="bg-gradient-to-r from-dark-800 to-dark-900 rounded-2xl p-4 flex flex-wrap items-center gap-4 text-white">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-white/50">Date:</span>
            <span className="font-bold">{new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          </div>
          <div className="w-px h-6 bg-white/20 hidden sm:block" />
          <div className="flex items-center gap-2 text-sm">
            <span className="text-white/50">{SHIFT_ICONS[selectedShift.shift]} Shift:</span>
            <span className="font-bold">Shift {selectedShift.shift} — {selectedShift.label}</span>
          </div>
          <div className="w-px h-6 bg-white/20 hidden sm:block" />
          <div className="flex items-center gap-2 text-sm">
            <span className="text-white/50">⏰ Time:</span>
            <span className="font-bold">{selectedShift.departure} → {selectedShift.arrival}</span>
          </div>
        </div>
      )}

      {/* ═══ CONFIRMATION MODAL ═══ */}
      <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)} title="Confirm Booking">
        <div className="space-y-4">
          <div className={`bg-gradient-to-r ${SHIFT_GRADIENTS[selectedShift?.shift]} rounded-xl p-4 text-white`}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{SHIFT_ICONS[selectedShift?.shift]}</span>
              <div>
                <h3 className="font-bold text-lg">Shift {selectedShift?.shift} — {selectedShift?.label}</h3>
                <p className="text-white/70 text-sm">{selectedShift?.departure} → {selectedShift?.arrival}</p>
              </div>
            </div>
          </div>
          <div className="bg-dark-50 rounded-xl p-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-dark-400">Bus:</span> <span className="font-bold">{selectedBus?.busName}</span></div>
              <div><span className="text-dark-400">Seat:</span> <span className="font-bold">{getSeatLabel(selectedSeat)}</span></div>
              <div><span className="text-dark-400">Route:</span> <span className="font-bold text-xs">{selectedShift?.specialRoute || selectedBus?.route?.name}</span></div>
              <div><span className="text-dark-400">Date:</span> <span className="font-bold text-accent-600">{new Date(selectedDate + 'T00:00:00').toLocaleDateString()}</span></div>
              <div><span className="text-dark-400">Direction:</span> <span className="font-bold">{selectedShift?.directionLabel}</span></div>
              <div><span className="text-dark-400">Points:</span> <span className="font-bold text-primary-600">{user?.points ?? 0} remaining</span></div>
            </div>
          </div>
          <p className="text-sm text-dark-500">
            1 Point will be deducted upon booking. You can cancel this booking from your dashboard.
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
    </div>
  );
};

export default SeatBooking;
