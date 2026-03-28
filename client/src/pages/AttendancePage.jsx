import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../utils/api';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { FaBus, FaUser, FaCheck, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';

const AttendancePage = () => {
  const [searchParams] = useSearchParams();
  const busIdFromQuery = searchParams.get('bus');
  
  const [buses, setBuses] = useState([]);
  const [selectedBus, setSelectedBus] = useState(busIdFromQuery || '');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});

  useEffect(() => {
    fetchBuses();
  }, []);

  useEffect(() => {
    if (selectedBus) {
      fetchStudents(selectedBus);
    }
  }, [selectedBus]);

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

  const fetchStudents = async (busId) => {
    try {
      setLoading(true);
      const res = await API.get(`/supervisor/bus/${busId}/students`);
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
      fetchStudents(selectedBus);
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
      fetchStudents(selectedBus);
    } catch (error) {
      toast.error('Failed to mark attendance');
    }
  };

  if (loading && buses.length === 0) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-dark-900">Attendance Management</h1>
        <p className="text-dark-500 text-sm mt-1">Mark student attendance and manage token deductions</p>
      </div>

      {/* Bus selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <FaBus className="text-primary-500" />
          <select
            value={selectedBus}
            onChange={(e) => setSelectedBus(e.target.value)}
            className="input-field !w-auto"
          >
            {buses.map(bus => (
              <option key={bus._id} value={bus._id}>{bus.busNumber} - {bus.route?.name}</option>
            ))}
          </select>
        </div>
        <button onClick={markAllPresent} className="btn-success text-sm !px-4 !py-2 flex items-center gap-2">
          <FaCheck /> Mark All Present
        </button>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-2xl font-bold text-dark-900">{students.length}</p>
          <p className="text-xs text-dark-500">Total Booked</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-accent-600">
            {students.filter(s => s.attendance === 'present').length}
          </p>
          <p className="text-xs text-dark-500">Present</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-danger-500">
            {students.filter(s => s.attendance === 'absent').length}
          </p>
          <p className="text-xs text-dark-500">Absent</p>
        </div>
      </div>

      {/* Student list */}
      {loading ? <LoadingSpinner size="sm" /> : (
        <div className="card !p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-bold text-dark-500 uppercase">Student</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-dark-500 uppercase">ID</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-dark-500 uppercase">Seat</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-dark-500 uppercase">Tokens</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-dark-500 uppercase">Status</th>
                  <th className="text-right px-6 py-3 text-xs font-bold text-dark-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-100">
                {students.map(booking => (
                  <tr key={booking._id} className="hover:bg-dark-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-xs font-bold text-primary-600">
                          {booking.student?.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-dark-900">{booking.student?.name}</p>
                          <p className="text-xs text-dark-400">{booking.student?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-dark-600">{booking.student?.studentId}</td>
                    <td className="px-6 py-4 text-sm font-bold text-dark-900">#{booking.seatNumber}</td>
                    <td className="px-6 py-4 text-sm font-bold text-primary-600">{booking.student?.points}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        booking.attendance === 'present' ? 'bg-accent-100 text-accent-700' :
                        booking.attendance === 'absent' ? 'bg-danger-100 text-danger-700' :
                        'bg-warning-50 text-warning-500'
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
                            className="bg-accent-500 text-white p-2 rounded-lg hover:bg-accent-600 transition-colors text-xs"
                            title="Mark Present (-1 token)"
                          >
                            <FaCheck />
                          </button>
                          <button
                            onClick={() => markAttendance(booking._id, 'absent')}
                            disabled={processing[booking._id]}
                            className="bg-danger-500 text-white p-2 rounded-lg hover:bg-danger-600 transition-colors text-xs"
                            title="Mark Absent (-3 tokens)"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-dark-400">Done</span>
                      )}
                    </td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-dark-400">
                      <FaUser className="text-3xl mx-auto mb-2 text-dark-300" />
                      No students booked for this bus
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="bg-primary-50 rounded-xl p-4 text-sm text-dark-600">
        <p className="font-bold text-dark-900 mb-1">Token Deduction Rules:</p>
        <p>✅ Present → <strong>-1 token</strong> | ❌ Absent → <strong>-3 tokens</strong></p>
      </div>
    </div>
  );
};

export default AttendancePage;
