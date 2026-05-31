import { useState, useEffect } from 'react';
import API from '../utils/api';
import toast from 'react-hot-toast';

export const useBusManagement = () => {
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
    } catch {
      toast.error('Failed to load buses');
    } finally {
      setLoading(false);
    }
  };

  const fetchSupervisors = async () => {
    try {
      const res = await API.get('/admin/users?role=supervisor');
      setSupervisors(res.data);
    } catch {
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
    const newStops = formData.stops
      .filter((_, i) => i !== index)
      .map((s, i) => ({ ...s, order: i + 1 }));
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
        busName: '',
        busType: 'regular',
        routeName: '',
        totalSeats: 50,
        supervisors: [],
        stops: [{ name: '', order: 1 }],
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
      supervisors: bus.supervisors ? bus.supervisors.map((s) => s._id) : [],
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
    const newStops = editData.stops
      .filter((_, i) => i !== index)
      .map((s, i) => ({ ...s, order: i + 1 }));
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
    if (
      !window.confirm(
        `Are you sure you want to delete bus "${busName}"? This action cannot be undone.`
      )
    )
      return;
    try {
      await API.delete(`/buses/${busId}`);
      toast.success('Bus deleted');
      fetchBuses();
    } catch {
      toast.error('Failed to delete bus');
    }
  };

  return {
    buses,
    supervisors,
    loading,
    showAddForm,
    setShowAddForm,
    editingBus,
    setEditingBus,
    expandedBus,
    setExpandedBus,
    formData,
    setFormData,
    editData,
    setEditData,
    addStop,
    removeStop,
    updateStop,
    handleAddBus,
    startEdit,
    addEditStop,
    removeEditStop,
    updateEditStop,
    handleSaveEdit,
    handleDeleteBus,
  };
};
