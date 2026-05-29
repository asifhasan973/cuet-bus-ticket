import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import { toLocalDateInputValue } from '../utils/date';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

export const useSeatBooking = () => {
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
      const dateStr = toLocalDateInputValue(d);
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

  useEffect(() => {
    const socketUrl =
      (import.meta.env.VITE_API_URL || '').replace('/api', '') || window.location.origin;
    const socket = io(socketUrl);

    socket.on(
      'seatBooked',
      ({ busId, seatNumber, travelDate, shift, studentName, studentId, bookedBy }) => {
        if (
          selectedBus &&
          selectedBus._id === busId &&
          selectedDate === travelDate &&
          selectedShift &&
          selectedShift.shift === shift
        ) {
          setSelectedBus((prev) => {
            if (!prev) return prev;
            const updatedSeats = prev.seats.map((s) => {
              if (s.number === seatNumber) {
                return { ...s, isBooked: true, studentName, studentId, bookedBy };
              }
              return s;
            });
            return {
              ...prev,
              seats: updatedSeats,
              availableSeats: updatedSeats.filter((s) => !s.isBooked).length,
            };
          });
        }
      }
    );

    socket.on('seatCancelled', ({ busId, seatNumber, travelDate, shift }) => {
      if (
        selectedBus &&
        selectedBus._id === busId &&
        selectedDate === travelDate &&
        selectedShift &&
        selectedShift.shift === shift
      ) {
        setSelectedBus((prev) => {
          if (!prev) return prev;
          const updatedSeats = prev.seats.map((s) => {
            if (s.number === seatNumber) {
              return { ...s, isBooked: false, studentName: '', studentId: '', bookedBy: null };
            }
            return s;
          });
          return {
            ...prev,
            seats: updatedSeats,
            availableSeats: updatedSeats.filter((s) => !s.isBooked).length,
          };
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [selectedBus, selectedDate, selectedShift]);

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
      const res = await API.get(
        `/buses/${busId}?date=${selectedDate}&shift=${selectedShift.shift}`
      );
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
      toast.success('Seat booked successfully!');
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

  const step = selectedBus ? 3 : selectedShift ? 2 : 1;

  return {
    user,
    buses,
    shifts,
    selectedBus,
    setSelectedBus,
    selectedSeat,
    selectedShift,
    loading,
    busLoading,
    booking,
    showConfirm,
    dateScrollRef,
    dates,
    selectedDate,
    setSelectedDate,
    setSelectedSeat,
    setShowConfirm,
    selectBus,
    handleShiftSelect,
    scrollDates,
    handleBookSeat,
    step,
  };
};
