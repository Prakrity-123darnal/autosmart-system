import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '../components/Card';
import { Table } from '../components/Table';
import { Modal } from '../components/Modal';
import api from '../services/api';
import { getApiError } from '../utils/getApiError';

interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
}

interface CustomerDetails {
  id: number;
  name: string;
  phone: string;
  email: string;
  vehicles: {
    id: number;
    vehicleNumber: string;
    make: string;
    model: string;
    year: number;
  }[];
  purchaseHistory: {
    invoiceId: number;
    totalAmount: number;
    isPaid: boolean;
    createdAt: string;
  }[];
}

export function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [details, setDetails] = useState<CustomerDetails | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    vehicleNumber: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
  });

  const loadCustomers = useCallback(async (query?: string) => {
    setLoading(true);
    try {
      const url = query?.trim()
        ? `/customers/search?query=${encodeURIComponent(query.trim())}`
        : '/customers';
      const res = await api.get<Customer[]>(url);
      setCustomers(res.data);
    } catch (err) {
      toast.error(getApiError(err, 'Failed to load customers'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const handleSearch = () => {
    loadCustomers(searchTerm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/customers/with-vehicle', formData);
      toast.success('Customer registered with vehicle');
      setIsModalOpen(false);
      setFormData({
        name: '',
        phone: '',
        email: '',
        vehicleNumber: '',
        make: '',
        model: '',
        year: new Date().getFullYear(),
      });
      loadCustomers();
    } catch (err) {
      toast.error(getApiError(err, 'Failed to register customer'));
    }
  };

  const viewDetails = async (id: number) => {
    try {
      const res = await api.get<CustomerDetails>(`/customers/${id}`);
      setDetails(res.data);
      setDetailsOpen(true);
    } catch (err) {
      toast.error(getApiError(err, 'Failed to load customer details'));
    }
  };

  const columns = [
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'Name' },
    { key: 'phone', header: 'Phone' },
    { key: 'email', header: 'Email' },
    {
      key: 'actions',
      header: 'Actions',
      render: (c: Customer) => (
        <button
          type="button"
          onClick={() => viewDetails(c.id)}
          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <Eye size={18} /> View
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Customer Management
          </h1>
          <p className="text-gray-600 mt-1">Register customers and view history</p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl font-semibold"
        >
          <Plus size={20} />
          Register Customer
        </button>
      </div>

      <Card className="p-6">
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, phone, ID, or plate..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="button"
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              loadCustomers();
            }}
            className="px-4 py-2 border rounded-lg"
          >
            Reset
          </button>
        </div>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <Table columns={columns} data={customers} keyExtractor={(c) => c.id} />
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register Customer + Vehicle">
        <form onSubmit={handleSubmit} className="space-y-3">
          <input className="w-full border rounded-lg px-3 py-2" placeholder="Full name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          <input className="w-full border rounded-lg px-3 py-2" placeholder="Phone" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
          <input className="w-full border rounded-lg px-3 py-2" type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          <input className="w-full border rounded-lg px-3 py-2" placeholder="Vehicle number" required value={formData.vehicleNumber} onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })} />
          <input className="w-full border rounded-lg px-3 py-2" placeholder="Make" required value={formData.make} onChange={(e) => setFormData({ ...formData, make: e.target.value })} />
          <input className="w-full border rounded-lg px-3 py-2" placeholder="Model" required value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} />
          <input className="w-full border rounded-lg px-3 py-2" type="number" placeholder="Year" required value={formData.year} onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value, 10) })} />
          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold">Save</button>
        </form>
      </Modal>

      <Modal isOpen={detailsOpen} onClose={() => setDetailsOpen(false)} title={details ? details.name : 'Customer Details'}>
        {details && (
          <div className="space-y-4 text-sm">
            <p><strong>Phone:</strong> {details.phone}</p>
            <p><strong>Email:</strong> {details.email || 'N/A'}</p>
            <div>
              <h3 className="font-semibold mb-2">Vehicles</h3>
              {details.vehicles.length === 0 ? (
                <p className="text-gray-500">No vehicles</p>
              ) : (
                <ul className="space-y-1">
                  {details.vehicles.map((v) => (
                    <li key={v.id} className="bg-gray-50 p-2 rounded">
                      {v.vehicleNumber} — {v.make} {v.model} ({v.year})
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <h3 className="font-semibold mb-2">Purchase History</h3>
              {details.purchaseHistory.length === 0 ? (
                <p className="text-gray-500">No purchases yet</p>
              ) : (
                <ul className="space-y-1">
                  {details.purchaseHistory.map((p) => (
                    <li key={p.invoiceId} className="bg-gray-50 p-2 rounded flex justify-between">
                      <span>Invoice #{p.invoiceId}</span>
                      <span>Rs. {p.totalAmount.toLocaleString()} {p.isPaid ? '(Paid)' : '(Credit)'}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

