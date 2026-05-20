import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Search, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '../components/Card';
import { Table } from '../components/Table';
import { Modal } from '../components/Modal';
import api from '../services/api';
import { getApiError } from '../utils/getApiError';

interface ApiPart {
  id: number;
  name: string;
  price: number;
  stock: number;
  vendorId: number;
}

interface Vendor {
  id: number;
  name: string;
}

type PartRow = ApiPart & { vendorName: string };

export function Parts() {
  const [parts, setParts] = useState<PartRow[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<ApiPart | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    stock: 0,
    vendorId: 0,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [partsRes, vendorsRes] = await Promise.all([
        api.get<ApiPart[]>('/parts'),
        api.get<Vendor[]>('/vendors'),
      ]);
      const vendorMap = new Map(
        vendorsRes.data.map((v) => [v.id, v.name])
      );
      setVendors(vendorsRes.data);
      setParts(
        partsRes.data.map((p) => ({
          ...p,
          vendorName: vendorMap.get(p.vendorId) ?? `Vendor #${p.vendorId}`,
        }))
      );
    } catch (err) {
      toast.error(getApiError(err, 'Failed to load parts'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const resetForm = () => {
    setFormData({ name: '', price: 0, stock: 0, vendorId: 0 });
    setEditingPart(null);
    setIsModalOpen(false);
  };

  const openCreate = () => {
    setEditingPart(null);
    setFormData({
      name: '',
      price: 0,
      stock: 0,
      vendorId: vendors[0]?.id ?? 0,
    });
    setIsModalOpen(true);
  };

  const openEdit = (part: PartRow) => {
    setEditingPart(part);
    setFormData({
      name: part.name,
      price: part.price,
      stock: part.stock,
      vendorId: part.vendorId,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vendorId) {
      toast.error('Please select a vendor');
      return;
    }
    try {
      const payload = {
        name: formData.name,
        price: formData.price,
        stock: formData.stock,
        vendorId: formData.vendorId,
      };
      if (editingPart) {
        await api.put(`/parts/${editingPart.id}`, payload);
        toast.success('Part updated');
      } else {
        await api.post('/parts', payload);
        toast.success('Part added');
      }
      resetForm();
      loadData();
    } catch (err) {
      toast.error(getApiError(err, 'Failed to save part'));
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this part?')) return;
    try {
      await api.delete(`/parts/${id}`);
      toast.success('Part deleted');
      loadData();
    } catch (err) {
      toast.error(getApiError(err, 'Failed to delete part'));
    }
  };

  const filteredParts = parts.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.vendorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockCount = parts.filter((p) => p.stock < 10).length;

  const columns = [
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'Part Name' },
    {
      key: 'price',
      header: 'Price (Rs.)',
      render: (part: PartRow) => `Rs. ${part.price.toLocaleString()}`,
    },
    {
      key: 'stock',
      header: 'Stock',
      render: (part: PartRow) => (
        <div className="flex items-center gap-2">
          {part.stock < 10 && (
            <AlertTriangle size={16} className="text-red-500" />
          )}
          <span className={part.stock < 10 ? 'text-red-600 font-semibold' : ''}>
            {part.stock}
          </span>
        </div>
      ),
    },
    { key: 'vendorName', header: 'Vendor' },
    {
      key: 'actions',
      header: 'Actions',
      render: (part: PartRow) => (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => openEdit(part)}
            className="text-blue-600 hover:text-blue-800"
          >
            <Edit size={18} />
          </button>
          <button
            type="button"
            onClick={() => handleDelete(part.id)}
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
        <p className="text-gray-600">Loading parts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Parts Management
          </h1>
          <p className="text-gray-600 mt-1 text-lg">Manage your inventory</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          disabled={vendors.length === 0}
          className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:shadow-xl transition-all font-semibold disabled:opacity-50"
        >
          <Plus size={20} />
          Add Part
        </button>
      </div>

      {vendors.length === 0 && (
        <p className="text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-4">
          Add at least one vendor before creating parts.
        </p>
      )}

      {lowStockCount > 0 && (
        <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-6 flex items-center gap-4 shadow-lg text-white">
          <AlertTriangle className="text-yellow-300" size={32} />
          <div>
            <p className="font-bold text-xl">Low Stock Alert</p>
            <p className="text-sm text-yellow-100">
              {lowStockCount} item(s) below 10 units.
            </p>
          </div>
        </div>
      )}

      <Card className="p-6">
        <div className="mb-4 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search parts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>
        <Table columns={columns} data={filteredParts} keyExtractor={(p) => p.id} />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={resetForm}
        title={editingPart ? 'Edit Part' : 'Add New Part'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Part Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (Rs.)
            </label>
            <input
              type="number"
              required
              min={0.01}
              step={0.01}
              value={formData.price || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  price: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock Quantity
            </label>
            <input
              type="number"
              required
              min={0}
              value={formData.stock || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  stock: parseInt(e.target.value, 10) || 0,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vendor
            </label>
            <select
              required
              value={formData.vendorId}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  vendorId: parseInt(e.target.value, 10),
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            >
              <option value={0}>Select vendor</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-semibold"
          >
            {editingPart ? 'Update Part' : 'Add Part'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
