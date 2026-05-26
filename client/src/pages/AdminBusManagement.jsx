import { useState, useEffect } from 'react';
import API from '../utils/api';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { FaBus, FaPlus, FaEdit, FaTrash, FaTimes, FaSave } from 'react-icons/fa';
import { HiChevronDown, HiChevronUp } from 'react-icons/hi';
import toast from 'react-hot-toast';

const AdminBusManagement = () => {
  const [buses, setBuses] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBus, setEditingBus] = useState(null);
  const [expandedBus, setExpandedBus] = useState(null);

  // New bus form state
  const [formData, setFormData] = useState({
    busName: '',
    busType: 'regular',
    routeName: '',
    totalSeats: 50,
    supervisors: [],
    stops: [{ name: '', order: 1 }],
  });

  // Edit form state
  const [editData, setEditData] = useState({
    busName: '',
    busType: 'regular',
    routeName: '',
    totalSeats: 50,
    status: 'active',
    supervisors: [],
    stops: [],
  });

  useEffect(() => {
    fetchBuses();
    fetchSupervisors();
  }, []);

  const fetchBuses = async () => {
    try {
      const res = await API.get('/buses/all');
      setBuses(res.data);
    } catch (error) {
      toast.error('Failed to load buses');
    } finally {
      setLoading(false);
    }
  };

  const fetchSupervisors = async () => {
    try {
      const res = await API.get('/admin/users?role=supervisor');
      setSupervisors(res.data);
    } catch (error) {
      console.error('Failed to load supervisors');
    }
  };

  // ─── Add Bus ───
  const addStop = () => {
    setFormData({
      ...formData,
      stops: [...formData.stops, { name: '', order: formData.stops.length + 1 }],
    });
  };

  const removeStop = (index) => {
    const newStops = formData.stops.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i + 1 }));
    setFormData({ ...formData, stops: newStops });
  };

  const updateStop = (index, field, value) => {
    const newStops = [...formData.stops];
    newStops[index] = { ...newStops[index], [field]: value };
    setFormData({ ...formData, stops: newStops });
  };

  const handleAddBus = async (e) => {
    e.preventDefault();
    try {
      await API.post('/buses', {
        busName: formData.busName,
        busType: formData.busType,
        route: {
          name: formData.routeName,
          stops: formData.stops,
        },
        totalSeats: formData.totalSeats,
        supervisors: formData.supervisors,
      });
      toast.success('Bus added successfully!');
      setShowAddForm(false);
      setFormData({
        busName: '', busType: 'regular', routeName: '', totalSeats: 50,
        supervisors: [], stops: [{ name: '', order: 1 }],
      });
      fetchBuses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add bus');
    }
  };

  // ─── Edit Bus ───
  const startEdit = (bus) => {
    setEditingBus(bus._id);
    setExpandedBus(bus._id);
    setEditData({
      busName: bus.busName || '',
      busType: bus.busType || 'regular',
      routeName: bus.route?.name || '',
      totalSeats: bus.totalSeats || 50,
      status: bus.status,
      supervisors: bus.supervisors ? bus.supervisors.map(s => s._id) : [],
      stops: bus.route?.stops || [],
    });
  };

  const addEditStop = () => {
    setEditData({
      ...editData,
      stops: [...editData.stops, { name: '', order: editData.stops.length + 1 }],
    });
  };

  const removeEditStop = (index) => {
    const newStops = editData.stops.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i + 1 }));
    setEditData({ ...editData, stops: newStops });
  };

  const updateEditStop = (index, field, value) => {
    const newStops = [...editData.stops];
    newStops[index] = { ...newStops[index], [field]: value };
    setEditData({ ...editData, stops: newStops });
  };

  const handleSaveEdit = async (busId) => {
    try {
      await API.put(`/buses/${busId}`, {
        busName: editData.busName,
        busType: editData.busType,
        route: {
          name: editData.routeName,
          stops: editData.stops,
        },
        totalSeats: editData.totalSeats,
        status: editData.status,
        supervisors: editData.supervisors,
      });
      toast.success('Bus updated successfully!');
      setEditingBus(null);
      fetchBuses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update bus');
    }
  };

  // ─── Delete Bus ───
  const handleDeleteBus = async (busId, busName) => {
    if (!window.confirm(`Are you sure you want to delete bus "${busName}"? This action cannot be undone.`)) return;
    try {
      await API.delete(`/buses/${busId}`);
      toast.success('Bus deleted');
      fetchBuses();
    } catch (error) {
      toast.error('Failed to delete bus');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-dark-900 dark:text-white">Bus Management</h1>
          <p className="text-dark-500 dark:text-dark-400 text-sm mt-1">Manage {buses.length} buses • Schedules are shift-based (system-level)</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            showAddForm
              ? 'bg-dark-200 dark:bg-dark-600 text-dark-700 dark:text-dark-200 hover:bg-dark-300 dark:hover:bg-dark-500'
              : 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm'
          }`}
        >
          {showAddForm ? <><FaTimes /> Cancel</> : <><FaPlus /> Add New Bus</>}
        </button>
      </div>

      {/* Shift Schedule Info */}
      <div className="card !p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-dark-800 to-dark-900 px-6 py-3">
          <h2 className="font-bold text-white text-sm">System Shift Schedule</h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { shift: 1, icon: '', label: 'Morning', time: '6:30 AM → 8:00 AM', dir: 'CUET-bound', note: 'Weekdays only', color: 'bg-teal-50 dark:bg-teal-950/20 border-teal-200 dark:border-teal-800/40 text-teal-700 dark:text-teal-300' },
              { shift: 2, icon: '', label: 'Afternoon', time: '2:00 PM → 3:00 PM', dir: 'Outbound', note: 'All days • Kaptai Rastar Matha', color: 'bg-sky-50 dark:bg-sky-950/20 border-sky-200 dark:border-sky-800/40 text-sky-700 dark:text-sky-300' },
              { shift: 3, icon: '', label: 'Evening', time: '5:00 PM → 7:00 PM', dir: 'Outbound', note: 'Weekdays only', color: 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800/40 text-indigo-700 dark:text-indigo-300' },
              { shift: 4, icon: '', label: 'Night', time: '9:00 PM → 10:30 PM', dir: 'CUET-bound', note: 'All days • From New Market', color: 'bg-slate-50 dark:bg-dark-800/40 border-slate-200 dark:border-dark-700 text-slate-700 dark:text-dark-300' },
            ].map(s => (
              <div key={s.shift} className={`rounded-xl border-2 p-3 ${s.color}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{s.icon}</span>
                  <span className="font-bold text-sm text-dark-900 dark:text-white">Shift {s.shift}</span>
                </div>
                <p className="text-xs font-semibold text-dark-700 dark:text-dark-200">{s.label}</p>
                <p className="text-[11px] text-dark-500 dark:text-dark-400 mt-1">{s.time}</p>
                <p className="text-[10px] text-dark-400 dark:text-dark-500 mt-0.5">{s.note}</p>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-dark-400 dark:text-dark-500 mt-3">
           Weekend shifts (Fri-Sat): Shift 2 → 2:30 PM, Shift 4 → 8:30 PM. Shifts 1 & 3 don't run.
          </p>
        </div>
      </div>

      {/* Add Bus Form */}
      {showAddForm && (
        <div className="card !p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
            <h2 className="font-bold text-white flex items-center gap-2">
              <FaPlus /> Add New Bus
            </h2>
          </div>
          <form onSubmit={handleAddBus} className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-dark-700 dark:text-dark-200 mb-1.5">Bus Name *</label>
                <input type="text" value={formData.busName}
                  onChange={(e) => setFormData({ ...formData, busName: e.target.value })}
                  className="input-field" placeholder="e.g. Halda" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-dark-700 dark:text-dark-200 mb-1.5">Bus Type *</label>
                <div className="flex gap-2 mt-1">
                  {['regular', 'flyover'].map(t => (
                    <button key={t} type="button"
                      onClick={() => setFormData({ ...formData, busType: t })}
                      className={`px-4 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all flex-1 ${
                        formData.busType === t 
                          ? 'bg-primary-600 text-white' 
                          : 'bg-dark-100 dark:bg-dark-800 text-dark-500 dark:text-dark-400 hover:bg-dark-200 dark:hover:bg-dark-700'
                      }`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-dark-700 dark:text-dark-200 mb-1.5">Route Name *</label>
                <input type="text" value={formData.routeName}
                  onChange={(e) => setFormData({ ...formData, routeName: e.target.value })}
                  className="input-field" placeholder="e.g. CUET → GEC → New Market" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-dark-700 dark:text-dark-200 mb-1.5">Total Seats</label>
                <input type="number" value={formData.totalSeats} min="10" max="80"
                  onChange={(e) => setFormData({ ...formData, totalSeats: parseInt(e.target.value) })}
                  className="input-field" />
              </div>
            </div>

            {/* Supervisors */}
            <div>
              <label className="block text-sm font-semibold text-dark-700 dark:text-dark-200 mb-1.5">Assign Supervisors</label>
              <div className="flex flex-wrap gap-2">
                {supervisors.map(s => {
                  const isSelected = formData.supervisors.includes(s._id);
                  return (
                    <button key={s._id} type="button"
                      onClick={() => {
                        setFormData({ ...formData, supervisors: isSelected
                          ? formData.supervisors.filter(id => id !== s._id)
                          : [...formData.supervisors, s._id]
                        });
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        isSelected 
                          ? 'bg-primary-600 text-white' 
                          : 'bg-dark-100 dark:bg-dark-800 text-dark-500 dark:text-dark-400 hover:bg-dark-200 dark:hover:bg-dark-700'
                      }`}>
                      {s.name}
                    </button>
                  );
                })}
                {supervisors.length === 0 && <span className="text-xs text-dark-400 dark:text-dark-500">No supervisors available</span>}
              </div>
            </div>

            {/* Stops */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-dark-700 dark:text-dark-200">Route Stops</label>
                <button type="button" onClick={addStop}
                  className="text-xs text-primary-600 dark:text-primary-400 font-semibold hover:text-primary-700 flex items-center gap-1">
                  <FaPlus className="text-[10px]" /> Add Stop
                </button>
              </div>
              <div className="space-y-2">
                {formData.stops.map((stop, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-6 h-6 flex items-center justify-center bg-primary-100 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 rounded-full text-xs font-bold flex-shrink-0">
                      {i + 1}
                    </span>
                    <input type="text" value={stop.name} placeholder="Stop name"
                      onChange={(e) => updateStop(i, 'name', e.target.value)}
                      className="input-field !py-2 text-sm flex-1" required />
                    {formData.stops.length > 1 && (
                      <button type="button" onClick={() => removeStop(i)}
                        className="text-danger-500 hover:text-danger-600 p-1.5">
                        <FaTimes className="text-xs" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowAddForm(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-700 transition-all">
                Cancel
              </button>
              <button type="submit"
                className="btn-primary flex items-center gap-2 text-sm !px-5 !py-2.5">
                <FaPlus /> Create Bus
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bus List */}
      <div className="space-y-3">
        {buses.map(bus => (
          <div key={bus._id} className="card !p-0 overflow-hidden border border-dark-100 dark:border-dark-600/50">
            {/* Header Row */}
            <div className="flex items-center justify-between px-5 py-4">
              <div
                className="flex items-center gap-4 flex-1 cursor-pointer"
                onClick={() => setExpandedBus(expandedBus === bus._id ? null : bus._id)}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  bus.status === 'active' ? 'bg-accent-100 dark:bg-accent-950/40 text-accent-600 dark:text-accent-400' :
                  bus.status === 'maintenance' ? 'bg-warning-50 dark:bg-warning-950/20 text-warning-500 dark:text-warning-400' :
                  'bg-dark-100 dark:bg-dark-800 text-dark-400 dark:text-dark-500'
                }`}>
                  <FaBus />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-dark-900 dark:text-white">{bus.busName}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      bus.busType === 'flyover' 
                        ? 'bg-violet-100 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300' 
                        : 'bg-dark-100 dark:bg-dark-600 text-dark-500 dark:text-dark-300'
                    }`}>
                      {bus.busType}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      bus.status === 'active' ? 'bg-accent-100 dark:bg-accent-950/40 text-accent-700 dark:text-accent-300' :
                      bus.status === 'maintenance' ? 'bg-warning-50 dark:bg-warning-950/30 text-warning-600 dark:text-warning-400' :
                      'bg-dark-100 dark:bg-dark-600 text-dark-500 dark:text-dark-300'
                    }`}>
                      {bus.status}
                    </span>
                  </div>
                  <p className="text-sm text-dark-500 dark:text-dark-400 line-clamp-1">{bus.route?.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-4 text-sm text-dark-500 dark:text-dark-400 mr-4">
                  <span>{bus.totalSeats} seats</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => startEdit(bus)}
                    className="p-2 rounded-lg text-dark-400 dark:text-dark-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/20 transition-all">
                    <FaEdit />
                  </button>
                  <button onClick={() => handleDeleteBus(bus._id, bus.busName)}
                    className="p-2 rounded-lg text-dark-400 dark:text-dark-500 hover:text-danger-500 dark:hover:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-950/20 transition-all">
                    <FaTrash />
                  </button>
                  <button onClick={() => setExpandedBus(expandedBus === bus._id ? null : bus._id)}
                    className="p-2 rounded-lg text-dark-400 dark:text-dark-500 hover:text-dark-600 dark:hover:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-800 transition-all">
                    {expandedBus === bus._id ? <HiChevronUp /> : <HiChevronDown />}
                  </button>
                </div>
              </div>
            </div>

            {/* Expanded Section */}
            {expandedBus === bus._id && (
              <div className="border-t border-dark-100 dark:border-dark-600/50 px-5 py-4 bg-dark-50/50 dark:bg-dark-800/30">
                {editingBus === bus._id ? (
                  /* ─── Edit Mode ─── */
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-dark-500 dark:text-dark-400 mb-1">Bus Name</label>
                        <input type="text" value={editData.busName}
                          onChange={(e) => setEditData({ ...editData, busName: e.target.value })}
                          className="input-field text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-dark-500 dark:text-dark-400 mb-1">Bus Type</label>
                        <div className="flex gap-2">
                          {['regular', 'flyover'].map(t => (
                            <button key={t} type="button"
                              onClick={() => setEditData({ ...editData, busType: t })}
                              className={`px-3 py-2 rounded-lg text-xs font-semibold capitalize transition-all flex-1 ${
                                editData.busType === t 
                                  ? 'bg-primary-600 text-white' 
                                  : 'bg-dark-100 dark:bg-dark-800 text-dark-500 dark:text-dark-400 hover:bg-dark-200 dark:hover:bg-dark-700'
                              }`}>
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-dark-500 dark:text-dark-400 mb-1">Route Name</label>
                        <input type="text" value={editData.routeName}
                          onChange={(e) => setEditData({ ...editData, routeName: e.target.value })}
                          className="input-field text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-dark-500 dark:text-dark-400 mb-1">Total Seats</label>
                        <input type="number" min="10" max="80" value={editData.totalSeats}
                          onChange={(e) => setEditData({ ...editData, totalSeats: parseInt(e.target.value) })}
                          className="input-field text-sm" />
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-xs font-semibold text-dark-500 dark:text-dark-400 mb-1">Status</label>
                      <div className="flex gap-2">
                        {['active', 'inactive', 'maintenance'].map(s => (
                          <button key={s} type="button"
                            onClick={() => setEditData({ ...editData, status: s })}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                              editData.status === s
                                ? s === 'active' ? 'bg-accent-600 text-white'
                                : s === 'maintenance' ? 'bg-warning-500 text-white'
                                : 'bg-dark-600 text-white'
                                : 'bg-dark-100 dark:bg-dark-800 text-dark-500 dark:text-dark-400 hover:bg-dark-200 dark:hover:bg-dark-700'
                            }`}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Supervisors */}
                    <div>
                      <label className="block text-xs font-semibold text-dark-500 dark:text-dark-400 mb-1">Assign Supervisors</label>
                      <div className="flex flex-wrap gap-2">
                        {supervisors.map(s => {
                          const isSelected = editData.supervisors.includes(s._id);
                          return (
                            <button key={s._id} type="button"
                              onClick={() => {
                                setEditData({ ...editData, supervisors: isSelected
                                  ? editData.supervisors.filter(id => id !== s._id)
                                  : [...editData.supervisors, s._id]
                                });
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                isSelected 
                                  ? 'bg-primary-600 text-white' 
                                  : 'bg-dark-100 dark:bg-dark-800 text-dark-500 dark:text-dark-400 hover:bg-dark-200 dark:hover:bg-dark-700'
                              }`}>
                              {s.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Editable Stops */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-semibold text-dark-500 dark:text-dark-400">Route Stops</label>
                        <button type="button" onClick={addEditStop}
                          className="text-xs text-primary-600 dark:text-primary-400 font-semibold hover:text-primary-700 flex items-center gap-1">
                          <FaPlus className="text-[10px]" /> Add Stop
                        </button>
                      </div>
                      <div className="space-y-2">
                        {editData.stops.map((stop, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="w-5 h-5 flex items-center justify-center bg-primary-100 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 rounded-full text-[10px] font-bold flex-shrink-0">
                              {i + 1}
                            </span>
                            <input type="text" value={stop.name} placeholder="Stop name"
                              onChange={(e) => updateEditStop(i, 'name', e.target.value)}
                              className="input-field !py-1.5 text-sm flex-1" />
                            {editData.stops.length > 1 && (
                              <button type="button" onClick={() => removeEditStop(i)}
                                className="text-danger-500 hover:text-danger-600 p-1">
                                <FaTimes className="text-xs" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-1">
                      <button onClick={() => handleSaveEdit(bus._id)}
                        className="btn-primary flex items-center gap-2 text-sm !px-4 !py-2">
                        <FaSave /> Save Changes
                      </button>
                      <button onClick={() => setEditingBus(null)}
                        className="px-4 py-2 rounded-xl text-sm font-semibold bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-700 transition-all">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ─── View Mode ─── */
                  <div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-dark-400 dark:text-dark-500 font-medium">Supervisors</p>
                        <p className="text-sm font-semibold text-dark-800 dark:text-dark-200">
                          {bus.supervisors?.length > 0 ? bus.supervisors.map(s => s.name).join(', ') : 'Unassigned'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-dark-400 dark:text-dark-500 font-medium">Total Seats</p>
                        <p className="text-sm font-semibold text-dark-800 dark:text-dark-200">{bus.totalSeats}</p>
                      </div>
                      <div>
                        <p className="text-xs text-dark-400 dark:text-dark-500 font-medium">Type</p>
                        <p className="text-sm font-semibold text-dark-800 dark:text-dark-200 capitalize">{bus.busType}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-dark-400 dark:text-dark-500 font-medium mb-2">Route Stops</p>
                      <div className="flex flex-wrap gap-2">
                        {bus.route?.stops?.map((stop, i) => (
                          <div key={i} className="flex items-center gap-1.5 bg-white dark:bg-dark-700 px-3 py-1.5 rounded-lg border border-dark-100 dark:border-dark-600 text-sm">
                            <span className="w-4 h-4 flex items-center justify-center bg-primary-100 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 rounded-full text-[9px] font-bold">
                              {stop.order}
                            </span>
                            <span className="font-medium text-dark-800 dark:text-dark-200">{stop.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {buses.length === 0 && (
          <div className="card text-center py-10">
            <FaBus className="text-4xl text-dark-300 dark:text-dark-600 mx-auto mb-3" />
            <h3 className="font-bold text-dark-900 dark:text-white text-lg">No Buses Yet</h3>
            <p className="text-dark-500 dark:text-dark-400 text-sm mt-1">Click "Add New Bus" to create one</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBusManagement;
