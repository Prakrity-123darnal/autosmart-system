import { useState, useEffect, useCallback } from 'react';
import { Plus, Clock, CheckCircle, XCircle } from 'lucide-react';
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

interface ApiPartRequest {
  id: number;
  customerId: number;
  partName: string;
  description: string;
  status: string;
  createdAt: string;
  customer?: ApiCustomer;
}

const STATUS_OPTIONS = ['pending', 'approved', 'rejected'];

export function PartRequests() {
  const { user } = useAuth();
  const { customerId, loading: customerLoading, error: customerError } =
    useCurrentCustomer();
  const isStaff = user?.role === 'admin' || user?.role === 'staff';

  const [requests, setRequests] = useState<ApiPartRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    partName: '',
    description: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<ApiPartRequest[]>('/partrequests');
      setRequests(res.data);
    } catch (err) {
      toast.error(getApiError(err, 'Failed to load part requests'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      toast.error(customerError ?? 'Customer profile required');
      return;
    }

    try {
      await api.post('/partrequests', {
        customerId,
        partName: formData.partName,
        description: formData.description,
      });
      toast.success('Part request submitted');
      setFormData({ partName: '', description: '' });
      setIsModalOpen(false);
      load();
    } catch (err) {
      toast.error(getApiError(err, 'Failed to submit request'));
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.put(`/partrequests/${id}`, { status });
      toast.success('Request updated');
      load();
    } catch (err) {
      toast.error(getApiError(err, 'Failed to update request'));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'rejected':
        return <XCircle className="text-red-500" size={20} />;
      default:
        return <Clock className="text-yellow-500" size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'rejected':
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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
            📝 Part Requests
          </h1>
          <p className="text-gray-600 mt-1 text-lg">
            {isStaff ? 'Review customer part requests' : 'Request parts not in stock'}
          </p>
        </div>
        {!isStaff && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-6 py-3 rounded-xl hover:shadow-xl transition-all transform hover:scale-105 font-semibold"
          >
            <Plus size={20} />
            Request Part
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-gray-500">Loading requests...</p>
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => (
            <Card key={request.id} className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-2">
                    {getStatusIcon(request.status)}
                    <div>
                      <h3 className="font-semibold text-gray-800 text-lg">
                        {request.partName}
                      </h3>
                      {isStaff && request.customer && (
                        <p className="text-sm text-gray-600">
                          Customer: {request.customer.name}
                        </p>
                      )}
                      <p className="text-sm text-gray-600 mt-1">{request.description}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Requested on: {formatDate(request.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                      request.status
                    )}`}
                  >
                    {request.status}
                  </span>
                  {isStaff && (
                    <select
                      value={request.status}
                      onChange={(e) => updateStatus(request.id, e.target.value)}
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

      {!loading && requests.length === 0 && (
        <Card className="p-8 text-center">
          <Plus className="mx-auto text-gray-400 mb-3" size={48} />
          <p className="text-gray-600">No part requests yet.</p>
        </Card>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Request a Part"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Part Name
            </label>
            <input
              type="text"
              required
              value={formData.partName}
              onChange={(e) => setFormData({ ...formData, partName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g., Headlight Assembly"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              rows={4}
              placeholder="Vehicle model, year, specific requirements..."
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-3 rounded-xl hover:shadow-xl font-semibold"
          >
            📝 Submit Request
          </button>
        </form>
      </Modal>
    </div>
  );
}
