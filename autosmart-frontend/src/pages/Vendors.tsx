import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '../components/Card';
import { Table } from '../components/Table';
import { Modal } from '../components/Modal';
import api from '../services/api';
import { getApiError } from '../utils/getApiError';

interface Vendor {
  id: number;
  name: string;
  phone: string;
}

export function Vendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ name: '', phone: '' });

  const loadVendors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<Vendor[]>('/vendors');
      setVendors(res.data);
    } catch (err) {
      toast.error(getApiError(err, 'Failed to load vendors'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVendors();
  }, [loadVendors]);

  const resetForm = () => {
    setFormData({ name: '', phone: '' });
    setEditingVendor(null);
    setIsModalOpen(false);
  };

  const openEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setFormData({ name: vendor.name, phone: vendor.phone });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingVendor) {
        await api.put(`/vendors/${editingVendor.id}`, formData);
        toast.success('Vendor updated');
      } else {
        await api.post('/vendors', formData);
        toast.success('Vendor added');
      }
      resetForm();
      loadVendors();
    } catch (err) {
      toast.error(getApiError(err, 'Failed to save vendor'));
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this vendor?')) return;
    try {
      await api.delete(`/vendors/${id}`);
      toast.success('Vendor deleted');
      loadVendors();
    } catch (err) {
      toast.error(getApiError(err, 'Failed to delete vendor'));
    }
  };

  const filteredVendors = vendors.filter(
    (v) =>
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.phone.includes(searchTerm)
  );

  const columns = [
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'Vendor Name' },
    { key: 'phone', header: 'Phone' },
    {
      key: 'actions',
      header: 'Actions',
      render: (vendor: Vendor) => (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => openEdit(vendor)}
            className="text-blue-600 hover:text-blue-800"
          >
            <Edit size={18} />
          </button>
          <button
            type="button"
            onClick={() => handleDelete(vendor.id)}
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-gray-600">Loading vendors...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            Vendor Management
          </h1>
          <p className="text-gray-600 mt-1 text-lg">Manage your suppliers</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingVendor(null);
            setFormData({ name: '', phone: '' });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white px-6 py-3 rounded-xl font-semibold"
        >
          <Plus size={20} />
          Add Vendor
        </button>
      </div>

      <Card className="p-6">
        <div className="mb-4 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search vendors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
          />
        </div>
        <Table columns={columns} data={filteredVendors} keyExtractor={(v) => v.id} />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={resetForm}
        title={editingVendor ? 'Edit Vendor' : 'Add Vendor'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-orange-600 to-amber-600 text-white py-3 rounded-xl font-semibold"
          >
            {editingVendor ? 'Update' : 'Save'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
