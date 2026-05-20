import { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '../components/Card';
import { Modal } from '../components/Modal';
import api from '../services/api';
import { getApiError } from '../utils/getApiError';
import { useAuth } from '../context/AuthContext';
import { useCurrentCustomer } from '../hooks/useCurrentCustomer';

interface ApiCustomer {
  id: number;
  name: string;
}

interface ApiAppointment {
  id: number;
  customerId: number;
  serviceType: string;
  appointmentDate: string;
  status: string;
  notes: string;
  customer?: ApiCustomer;
}

interface VehicleOption {
  id: number;
  vehicleNumber: string;
  make: string;
  model: string;
}

const STATUS_OPTIONS = ['pending', 'confirmed', 'completed', 'cancelled'];

export function Appointments() {
  const { user } = useAuth();
  const { customerId, loading: customerLoading, error: customerError } =
    useCurrentCustomer();
  const isStaff = user?.role === 'admin' || user?.role === 'staff';

  const [appointments, setAppointments] = useState<ApiAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [formData, setFormData] = useState({
    date: '',
    time: '10:00',
    service: '',
    vehicleNote: '',
    notes: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<ApiAppointment[]>('/appointments');
      setAppointments(res.data);
    } catch (err) {
      toast.error(getApiError(err, 'Failed to load appointments'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!customerId) return;
    api
      .get<{ vehicles: VehicleOption[] }>(`/customers/${customerId}`)
      .then((res) => setVehicles(res.data.vehicles ?? []))
      .catch(() => setVehicles([]));
  }, [customerId]);

  const buildAppointmentDate = (date: string, time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const dt = new Date(`${date}T00:00:00`);
    dt.setHours(hours, minutes, 0, 0);
    return dt.toISOString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStaff && !customerId) {
      toast.error(customerError ?? 'Customer profile required');
      return;
    }

    const notes = [
      formData.vehicleNote ? `Vehicle: ${formData.vehicleNote}` : '',
      formData.notes,
    ]
      .filter(Boolean)
      .join('\n');

    try {
      await api.post('/appointments', {
        customerId: customerId ?? 0,
        serviceType: formData.service,
        appointmentDate: buildAppointmentDate(formData.date, formData.time),
        notes,
      });
      toast.success('Appointment booked');
      setFormData({
        date: '',
        time: '10:00',
        service: '',
        vehicleNote: '',
        notes: '',
      });
      setIsModalOpen(false);
      load();
    } catch (err) {
      toast.error(getApiError(err, 'Failed to book appointment'));
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.put(`/appointments/${id}`, { status });
      toast.success('Status updated');
      load();
    } catch (err) {
      toast.error(getApiError(err, 'Failed to update status'));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });

  if (!isStaff && customerLoading) {
    return <p className="text-gray-600">Loading your profile...</p>;
  }

  if (!isStaff && customerError) {
    return (
      <Card className="p-6 text-center text-amber-800 bg-amber-50">
        {customerError}
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            📅 Appointments
          </h1>
          <p className="text-gray-600 mt-1 text-lg">
            {isStaff ? 'Manage service appointments' : 'Book and view your appointments'}
          </p>
        </div>
        {!isStaff && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:shadow-xl transition-all transform hover:scale-105 font-semibold"
          >
            <Plus size={20} />
            Book Appointment
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-gray-500">Loading appointments...</p>
      ) : appointments.length === 0 ? (
        <Card className="p-8 text-center text-gray-600">No appointments yet.</Card>
      ) : (
        <div className="grid gap-4">
          {appointments.map((appointment) => (
            <Card key={appointment.id} className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-lg">
                      {appointment.serviceType}
                    </h3>
                    {isStaff && appointment.customer && (
                      <p className="text-sm text-gray-600">
                        Customer: {appointment.customer.name}
                      </p>
                    )}
                    {appointment.notes && (
                      <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">
                        {appointment.notes}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar size={16} />
                        <span>{formatDate(appointment.appointmentDate)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Clock size={16} />
                        <span>{formatTime(appointment.appointmentDate)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                      appointment.status
                    )}`}
                  >
                    {appointment.status}
                  </span>
                  {isStaff && (
                    <select
                      value={appointment.status}
                      onChange={(e) => updateStatus(appointment.id, e.target.value)}
                      className="text-sm border border-gray-300 rounded-lg px-2 py-1"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Book New Appointment"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {vehicles.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle (optional)
              </label>
              <select
                value={formData.vehicleNote}
                onChange={(e) =>
                  setFormData({ ...formData, vehicleNote: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">No vehicle selected</option>
                {vehicles.map((v) => {
                  const label = `${v.make} ${v.model} (${v.vehicleNumber})`;
                  return (
                    <option key={v.id} value={label}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Type
            </label>
            <select
              required
              value={formData.service}
              onChange={(e) => setFormData({ ...formData, service: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Select service</option>
              <option value="Oil Change">Oil Change</option>
              <option value="Brake Inspection">Brake Inspection</option>
              <option value="Tire Rotation">Tire Rotation</option>
              <option value="General Checkup">General Checkup</option>
              <option value="Engine Diagnostics">Engine Diagnostics</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
            <input
              type="time"
              required
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              rows={2}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl hover:shadow-xl font-semibold"
          >
            📅 Book Appointment
          </button>
        </form>
      </Modal>
    </div>
  );
}
