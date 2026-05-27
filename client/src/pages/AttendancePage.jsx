import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../utils/api';
import { getSeatLabel } from '../utils/seat';
import { SHIFT_ICONS, SHIFT_LABELS } from '../utils/shifts';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Modal from '../components/ui/Modal';
import { toLocalDateInputValue } from '../utils/date';
import { FaBus, FaUser, FaCheck, FaTimes } from 'react-icons/fa';
import { HiQrcode } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { Html5Qrcode } from 'html5-qrcode';



const AttendancePage = () => {
  const [searchParams] = useSearchParams();
  const busIdFromQuery = searchParams.get('bus');
  
  const [buses, setBuses] = useState([]);
  const [selectedBus, setSelectedBus] = useState(busIdFromQuery || '');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});
  const [shifts, setShifts] = useState([]);
  const [selectedShift, setSelectedShift] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => toLocalDateInputValue());
  const [scannerOpen, setScannerOpen] = useState(false);

  useEffect(() => {
    if (!scannerOpen) return;

    let html5QrCode;
    let isActive = true;

    const startScanner = async () => {
      try {
        // Wait a short moment to ensure the modal DOM is rendered
        await new Promise(resolve => setTimeout(resolve, 250));
        if (!isActive) return;

        html5QrCode = new Html5Qrcode("qr-reader");
        
        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 220, height: 220 },
            aspectRatio: 1.0
          },
          async (decodedText) => {
            try {
              if (html5QrCode && html5QrCode.isScanning) {
                await html5QrCode.stop();
              }
              setScannerOpen(false);
              
              toast.loading('Verifying ticket...', { id: 'qr-scan' });
              const res = await API.post('/supervisor/attendance', { bookingId: decodedText, status: 'present' });
              toast.success(res.data.message || 'Attendance marked present!', { id: 'qr-scan' });
              
              if (selectedBus && selectedShift) {
                fetchStudents(selectedBus, selectedDate, selectedShift);
              }
            } catch (error) {
              toast.error(error.response?.data?.message || 'Failed to verify ticket', { id: 'qr-scan' });
            }
          },
          (errorMessage) => {
            // Ignore scan errors
          }
        );
      } catch (err) {
        console.error("Camera start error:", err);
        toast.error("Could not start camera. Please verify permission settings.", { id: 'qr-scan-err' });
        setScannerOpen(false);
      }
    };

    startScanner();

    return () => {
      isActive = false;
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(err => console.error("Error stopping scanner", err));
      }
    };
  }, [scannerOpen, selectedBus, selectedShift, selectedDate]);

  useEffect(() => {
    fetchBuses();
  }, []);

  useEffect(() => {
    fetchShifts(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    if (selectedBus && selectedShift) {
      fetchStudents(selectedBus, selectedDate, selectedShift);
    } else {
      setStudents([]);
    }
  }, [selectedBus, selectedDate, selectedShift]);

  const fetchBuses = async () => {
    try {
      const res = await API.get('/supervisor/buses');
      setBuses(res.data);
      if (busIdFromQuery) setSelectedBus(busIdFromQuery);
      else if (res.data.length > 0) setSelectedBus(res.data[0]._id);
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
      // Auto-select first shift if none selected
      if (res.data.length > 0 && !selectedShift) {
        setSelectedShift(res.data[0].shift);
      }
    } catch (error) {
      console.error('Failed to load shifts');
    }
  };

  const fetchStudents = async (busId, dateStr, shift) => {
    try {
      setLoading(true);
      const res = await API.get(`/supervisor/bus/${busId}/students?date=${dateStr}&shift=${shift}`);
      setStudents(res.data);
    } catch (error) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async (bookingId, status) => {
    setProcessing(prev => ({ ...prev, [bookingId]: true }));
    try {
      const res = await API.post('/supervisor/attendance', { bookingId, status });
      toast.success(res.data.message);
      if (selectedBus && selectedShift) {
        fetchStudents(selectedBus, selectedDate, selectedShift);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setProcessing(prev => ({ ...prev, [bookingId]: false }));
    }
  };

  const markAllPresent = async () => {
    const pendingStudents = students.filter(s => s.attendance === 'pending');
    if (pendingStudents.length === 0) return toast('No pending attendance');
    
    try {
      const attendanceList = pendingStudents.map(s => ({
        bookingId: s._id,
        status: 'present',
      }));
      await API.post('/supervisor/attendance/bulk', { attendanceList });
      toast.success('All students marked present');
      if (selectedBus && selectedShift) {
        fetchStudents(selectedBus, selectedDate, selectedShift);
      }
    } catch (error) {
      toast.error('Failed to mark attendance');
    }
  };

  if (loading && buses.length === 0) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-dark-900 dark:text-white">Attendance Management</h1>
        <p className="text-dark-500 dark:text-dark-400 text-sm mt-1">Mark student attendance by date, shift, and bus</p>
      </div>

      {/* Filters */}
      <div className="card !p-4">
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(180px,220px)_minmax(0,1fr)] gap-4">
            <label className="block">
              <span className="block text-xs font-bold text-dark-500 dark:text-dark-400 uppercase mb-1">Travel Date</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => { setSelectedDate(e.target.value); setSelectedShift(''); }}
                className="input-field !py-2 !px-3 text-sm font-semibold text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/20 border-primary-100 dark:border-primary-900/40 cursor-pointer"
              />
            </label>

            <label className="block">
              <span className="block text-xs font-bold text-dark-500 dark:text-dark-400 uppercase mb-1">Bus</span>
              <div className="relative">
                <FaBus className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-500" />
                <select
                  value={selectedBus}
                  onChange={(e) => setSelectedBus(e.target.value)}
                  className="input-field !py-2 !pl-9 text-sm"
                >
                  {buses.map(bus => (
                    <option key={bus._id} value={bus._id} className="dark:bg-dark-900">{bus.busName} - {bus.route?.name}</option>
                  ))}
                </select>
              </div>
            </label>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end gap-4">
            <div className="flex-1 min-w-0">
              <span className="block text-xs font-bold text-dark-500 dark:text-dark-400 uppercase mb-1">Shift</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {shifts.map(s => (
                  <button
                    key={s.shift}
                    onClick={() => setSelectedShift(s.shift)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all text-center ${
                      selectedShift === s.shift
                        ? 'bg-primary-600 text-white shadow-sm'
                        : 'bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-700'
                    }`}
                  >
                    <span className="block">Shift {s.shift}</span>
                    <span className="block text-[10px] font-semibold opacity-80">{SHIFT_LABELS[s.shift]}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 lg:min-w-[320px] w-full lg:w-auto">
              <button
                onClick={() => setScannerOpen(true)}
                className="btn-primary text-sm !px-4 !py-2.5 flex items-center justify-center gap-2 flex-1"
              >
                <HiQrcode className="text-lg" /> Scan Ticket QR
              </button>
              <button
                onClick={markAllPresent}
                className="btn-success text-sm !px-4 !py-2.5 flex items-center justify-center gap-2 flex-1"
              >
                <FaCheck /> Mark All Present
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-2xl font-bold text-dark-900 dark:text-white">{students.length}</p>
          <p className="text-xs text-dark-500 dark:text-dark-400">Total Booked</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-accent-600 dark:text-accent-400">
            {students.filter(s => s.attendance === 'present').length}
          </p>
          <p className="text-xs text-dark-500 dark:text-dark-400">Present</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-danger-500 dark:text-danger-400">
            {students.filter(s => s.attendance === 'absent').length}
          </p>
          <p className="text-xs text-dark-500 dark:text-dark-400">Absent</p>
        </div>
      </div>

      {/* Student list */}
      {!selectedShift ? (
        <div className="card text-center py-10">
          <p className="text-dark-400 dark:text-dark-500 text-sm">Please select a shift to view booked students</p>
        </div>
      ) : loading ? <LoadingSpinner size="sm" /> : (
        <div className="card !p-0 overflow-hidden dark:border-dark-600">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-50 dark:bg-dark-800 border-b border-dark-100 dark:border-dark-600">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-bold text-dark-500 dark:text-dark-400 uppercase">Student</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-dark-500 dark:text-dark-400 uppercase">ID</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-dark-500 dark:text-dark-400 uppercase">Seat</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-dark-500 dark:text-dark-400 uppercase">Shift</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-dark-500 dark:text-dark-400 uppercase">Tokens</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-dark-500 dark:text-dark-400 uppercase">Status</th>
                  <th className="text-right px-6 py-3 text-xs font-bold text-dark-500 dark:text-dark-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-100 dark:divide-dark-600">
                {students.map(booking => (
                  <tr key={booking._id} className="hover:bg-dark-50 dark:hover:bg-dark-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-100 dark:bg-primary-950/40 rounded-full flex items-center justify-center text-xs font-bold text-primary-600 dark:text-primary-400">
                          {booking.student?.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-dark-900 dark:text-dark-100">{booking.student?.name}</p>
                          <p className="text-xs text-dark-400 dark:text-dark-500">{booking.student?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-dark-600 dark:text-dark-300">{booking.student?.studentId}</td>
                    <td className="px-6 py-4 text-sm font-bold text-dark-900 dark:text-white">{getSeatLabel(booking.seatNumber)}</td>
                    <td className="px-6 py-4 text-sm text-dark-800 dark:text-dark-200">
                      {SHIFT_ICONS[booking.shift]} {SHIFT_LABELS[booking.shift]}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-primary-600 dark:text-primary-400">{booking.student?.points}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        booking.attendance === 'present' ? 'bg-accent-100 dark:bg-accent-950/40 text-accent-700 dark:text-accent-400' :
                        booking.attendance === 'absent' ? 'bg-danger-100 dark:bg-danger-950/30 text-danger-700 dark:text-danger-400' :
                        'bg-warning-50 dark:bg-warning-950/20 text-warning-600 dark:text-warning-400'
                      }`}>
                        {booking.attendance}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {booking.attendance === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => markAttendance(booking._id, 'present')}
                            disabled={processing[booking._id]}
                            className="bg-accent-500 text-white p-2 rounded-lg hover:bg-accent-600 transition-colors text-xs shadow-sm hover:shadow"
                            title="Mark Present (-1 token)"
                            aria-label={`Mark ${booking.student?.name || 'student'} Present`}
                          >
                            <FaCheck />
                          </button>
                          <button
                            onClick={() => markAttendance(booking._id, 'absent')}
                            disabled={processing[booking._id]}
                            className="bg-danger-500 text-white p-2 rounded-lg hover:bg-danger-600 transition-colors text-xs shadow-sm hover:shadow"
                            title="Mark Absent (-3 tokens)"
                            aria-label={`Mark ${booking.student?.name || 'student'} Absent`}
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-dark-400 dark:text-dark-500 font-medium">Done</span>
                      )}
                    </td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-dark-400 dark:text-dark-500">
                      <FaBus className="text-3xl mx-auto mb-2 text-dark-300 dark:text-dark-700" />
                      No students booked for this bus on this shift
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="bg-primary-50 dark:bg-primary-950/20 rounded-xl p-4 text-sm text-dark-600 dark:text-dark-400 border border-primary-100/50 dark:border-primary-900/30">
        <p className="font-bold text-dark-900 dark:text-white mb-1">Token Deduction Rules:</p>
        <p>✅ Present → <strong>-1 token</strong> | ❌ Absent → <strong>-3 tokens</strong></p>
      </div>

      {/* QR Scanner Modal */}
      <Modal isOpen={scannerOpen} onClose={() => setScannerOpen(false)} title="Scan Ticket QR">
        <div className="space-y-4">
          <p className="text-sm text-dark-500 dark:text-dark-400 text-center">
            Point your camera at the student's ticket QR code.
          </p>
          <div className="relative overflow-hidden rounded-xl bg-dark-900 border dark:border-dark-600">
            <div id="qr-reader" className="w-full mx-auto overflow-hidden" />
          </div>
          <button
            onClick={() => setScannerOpen(false)}
            className="btn-secondary w-full"
          >
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default AttendancePage;
