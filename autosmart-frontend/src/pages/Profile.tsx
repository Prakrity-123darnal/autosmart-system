import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, User, Car } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '../components/Card';
import { Modal } from '../components/Modal';
import api from '../services/api';
import { getApiError } from '../utils/getApiError';
import { useAuth } from '../context/AuthContext';

interface Vehicle {
  id: number;
  vehicleNumber: string;
  make: string;
  model: string;
  year: number;
  brand: string;
}

interface CustomerDetails {
  id: number;
  name: string;
  phone: string;
  email: string;
  vehicles: Vehicle[];
}

export function Profile() {
  const { user, syncSessionUser } = useAuth();
  const [details, setDetails] = useState<CustomerDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    email: '',
  });
  const [vehicleForm, setVehicleForm] = useState({
    vehicleNumber: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<CustomerDetails>('/customers/me/details');
      setDetails(res.data);
      setProfileForm({
        name: res.data.name,
        phone: res.data.phone,
        email: res.data.email,
      });
    } catch (err) {
      toast.error(getApiError(err, 'Failed to load profile'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await api.put('/customers/me', profileForm);
      toast.success('Profile updated');
      syncSessionUser({
        name: res.data.name,
        email: res.data.email,
      });
      load();
    } catch (err) {
      toast.error(getApiError(err, 'Failed to update profile'));
    } finally {
      setSavingProfile(false);
    }
  };

  const resetVehicleForm = () => {
    setVehicleForm({
      vehicleNumber: '',
      make: '',
      model: '',
      year: new Date().getFullYear(),
    });
    setEditingVehicle(null);
    setVehicleModalOpen(false);
  };

  const openAddVehicle = () => {
    setEditingVehicle(null);
    setVehicleForm({
      vehicleNumber: '',
      make: '',
      model: '',
      year: new Date().getFullYear(),
    });
    setVehicleModalOpen(true);
  };

  const openEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setVehicleForm({
      vehicleNumber: vehicle.vehicleNumber,
      make: vehicle.make || vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
    });
    setVehicleModalOpen(true);
  };

  const handleVehicleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingVehicle) {
        await api.put(`/vehicles/${editingVehicle.id}`, {
          vehicleNumber: vehicleForm.vehicleNumber,
          brand: vehicleForm.make,
          make: vehicleForm.make,
          model: vehicleForm.model,
          year: vehicleForm.year,
          customerId: details?.id,
        });
        toast.success('Vehicle updated');
      } else {
        await api.post('/customers/me/vehicles', vehicleForm);
        toast.success('Vehicle added');
      }
      resetVehicleForm();
      load();
    } catch (err) {
      toast.error(getApiError(err, 'Failed to save vehicle'));
    }
  };

  const handleDeleteVehicle = async (id: number) => {
    if (!window.confirm('Remove this vehicle from your profile?')) return;
    try {
      await api.delete(`/vehicles/${id}`);
      toast.success('Vehicle removed');
      load();
    } catch (err) {
      toast.error(getApiError(err, 'Failed to delete vehicle'));
    }
  };

  if (loading) {
    return <p className="text-gray-600">Loading profile...</p>;
  }

  if (!details) {
    return (
      <Card className="p-8 text-center text-amber-800 bg-amber-50">
        No customer profile found. Try logging out and registering again, or contact staff.
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-8 text-white shadow-2xl">
        <h1 className="text-4xl font-bold flex items-center gap-3">
          <User size={36} />
          My Profile
        </h1>
        <p className="mt-2 text-purple-100">
          Signed in as {user?.email} ({user?.role})
        </p>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Contact details</h2>
        <form onSubmit={handleProfileSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
            <input
              type="text"
              required
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              required
              value={profileForm.phone}
              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={profileForm.email}
              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold disabled:opacity-60"
            >
              {savingProfile ? 'Saving...' : 'Save profile'}
            </button>
          </div>
        </form>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Car size={22} className="text-blue-600" />
            My Vehicles
          </h2>
          <button
            type="button"
            onClick={openAddVehicle}
            className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-4 py-2 rounded-xl font-semibold text-sm"
          >
            <Plus size={18} />
            Add vehicle
          </button>
        </div>

        {details.vehicles.length === 0 ? (
          <p className="text-gray-500 text-sm">No vehicles yet. Add your first vehicle above.</p>
        ) : (
          <div className="space-y-3">
            {details.vehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-800">
                    {vehicle.make} {vehicle.model} ({vehicle.year})
                  </p>
                  <p className="text-sm text-gray-500">{vehicle.vehicleNumber}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEditVehicle(vehicle)}
                    className="text-blue-600 hover:text-blue-800 p-1"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteVehicle(vehicle.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        isOpen={vehicleModalOpen}
        onClose={resetVehicleForm}
        title={editingVehicle ? 'Edit vehicle' : 'Add vehicle'}
      >
        <form onSubmit={handleVehicleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plate number</label>
            <input
              type="text"
              required
              value={vehicleForm.vehicleNumber}
              onChange={(e) =>
                setVehicleForm({ ...vehicleForm, vehicleNumber: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
            <input
              type="text"
              required
              value={vehicleForm.make}
              onChange={(e) => setVehicleForm({ ...vehicleForm, make: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
            <input
              type="text"
              required
              value={vehicleForm.model}
              onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <input
              type="number"
              required
              min={1980}
              max={2100}
              value={vehicleForm.year}
              onChange={(e) =>
                setVehicleForm({
                  ...vehicleForm,
                  year: parseInt(e.target.value, 10) || new Date().getFullYear(),
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-3 rounded-xl font-semibold"
          >
            {editingVehicle ? 'Update vehicle' : 'Add vehicle'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
