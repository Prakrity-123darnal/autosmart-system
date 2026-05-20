import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '../components/Card';
import { Table } from '../components/Table';
import { Modal } from '../components/Modal';
import api from '../services/api';
import { getApiError } from '../utils/getApiError';

interface ApiVehicle {
  id: number;
  vehicleNumber: string;
  brand: string;
  make: string;
  model: string;
  year: number;
  customerId: number;
}

interface Customer {
  id: number;
  name: string;
}

type VehicleRow = ApiVehicle & { customerName: string };

export function Vehicles() {
  const [vehicles, setVehicles] = useState<VehicleRow[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<ApiVehicle | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    customerId: 0,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [vehiclesRes, customersRes] = await Promise.all([
        api.get<ApiVehicle[]>('/vehicles'),
        api.get<Customer[]>('/customers'),
      ]);
      const customerMap = new Map(customersRes.data.map((c) => [c.id, c.name]));
      setCustomers(customersRes.data);
      setVehicles(
        vehiclesRes.data.map((v) => ({
          ...v,
          customerName: customerMap.get(v.customerId) ?? `Customer #${v.customerId}`,
        }))
      );
    } catch (err) {
      toast.error(getApiError(err, 'Failed to load vehicles'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const resetForm = () => {
    setFormData({
      vehicleNumber: '',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      customerId: customers[0]?.id ?? 0,
    });
    setEditingVehicle(null);
    setIsModalOpen(false);
  };

  const openCreate = () => {
    setEditingVehicle(null);
    setFormData({
      vehicleNumber: '',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      customerId: customers[0]?.id ?? 0,
    });
    setIsModalOpen(true);
  };

  const openEdit = (vehicle: VehicleRow) => {
    setEditingVehicle(vehicle);
    setFormData({
      vehicleNumber: vehicle.vehicleNumber,
      make: vehicle.make || vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      customerId: vehicle.customerId,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerId) {
      toast.error('Select a customer');
      return;
    }

    const payload = {
      vehicleNumber: formData.vehicleNumber,
      brand: formData.make,
      make: formData.make,
      model: formData.model,
      year: formData.year,
      customerId: formData.customerId,
    };

    try {
      if (editingVehicle) {
        await api.put(`/vehicles/${editingVehicle.id}`, payload);
        toast.success('Vehicle updated');
      } else {
        await api.post('/vehicles', payload);
        toast.success('Vehicle added');
      }
      resetForm();
      loadData();
    } catch (err) {
      toast.error(getApiError(err, 'Failed to save vehicle'));
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this vehicle?')) return;
    try {
      await api.delete(`/vehicles/${id}`);
      toast.success('Vehicle deleted');
      loadData();
    } catch (err) {
      toast.error(getApiError(err, 'Failed to delete vehicle'));
    }
  };

  const filteredVehicles = vehicles.filter(
    (v) =>
      v.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { key: 'id', header: 'ID' },
    { key: 'vehicleNumber', header: 'Plate' },
    { key: 'make', header: 'Make' },
    { key: 'model', header: 'Model' },
    { key: 'year', header: 'Year' },
    { key: 'customerName', header: 'Customer' },
    {
      key: 'actions',
      header: 'Actions',
      render: (vehicle: VehicleRow) => (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => openEdit(vehicle)}
            className="text-blue-600 hover:text-blue-800"
          >
            <Edit size={18} />
          </button>
          <button
            type="button"
            onClick={() => handleDelete(vehicle.id)}
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
            🚙 Vehicle Management
          </h1>
          <p className="text-gray-600 mt-1 text-lg">Manage customer vehicles</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:shadow-xl transition-all transform hover:scale-105 font-semibold"
        >
          <Plus size={20} />
          Add Vehicle
        </button>
      </div>

      <Card className="p-6">
        <div className="mb-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search vehicles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
        {loading ? (
          <p className="text-gray-500">Loading vehicles...</p>
        ) : (
          <Table columns={columns} data={filteredVehicles} keyExtractor={(v) => v.id} />
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={resetForm}
        title={editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number</label>
            <input
              type="text"
              required
              value={formData.vehicleNumber}
              onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
            <input
              type="text"
              required
              value={formData.make}
              onChange={(e) => setFormData({ ...formData, make: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
            <input
              type="text"
              required
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
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
              value={formData.year}
              onChange={(e) =>
                setFormData({ ...formData, year: parseInt(e.target.value, 10) || 0 })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
            <select
              required
              value={formData.customerId || ''}
              onChange={(e) =>
                setFormData({ ...formData, customerId: parseInt(e.target.value, 10) })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Select customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-3 rounded-xl hover:shadow-xl font-semibold"
          >
            {editingVehicle ? 'Update Vehicle' : 'Add Vehicle'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
