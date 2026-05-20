import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Search, Shield, User } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '../components/Card';
import { Table } from '../components/Table';
import { Modal } from '../components/Modal';
import api from '../services/api';
import { getApiError } from '../utils/getApiError';

interface StaffMember {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
}

export function Staff() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'staff' as 'admin' | 'staff',
    password: '',
  });

  const loadStaff = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<StaffMember[]>('/staff');
      setStaff(res.data);
    } catch (err) {
      toast.error(getApiError(err, 'Failed to load staff (admin login required)'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', role: 'staff', password: '' });
    setEditingStaff(null);
    setIsModalOpen(false);
  };

  const openCreate = () => {
    setEditingStaff(null);
    setFormData({ name: '', email: '', phone: '', role: 'staff', password: '' });
    setIsModalOpen(true);
  };

  const openEditRole = (member: StaffMember) => {
    setEditingStaff(member);
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone,
      role: member.role as 'admin' | 'staff',
      password: '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStaff) {
        await api.put(`/staff/${editingStaff.id}/role`, { role: formData.role });
        toast.success('Role updated');
      } else {
        await api.post('/staff', {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        });
        toast.success('Staff member registered');
      }
      resetForm();
      loadStaff();
    } catch (err) {
      toast.error(getApiError(err, 'Failed to save staff'));
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Remove this staff account?')) return;
    try {
      await api.delete(`/staff/${id}`);
      toast.success('Staff removed');
      loadStaff();
    } catch (err) {
      toast.error(getApiError(err, 'Failed to delete staff'));
    }
  };

  const filteredStaff = staff.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone' },
    {
      key: 'role',
      header: 'Role',
      render: (m: StaffMember) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
            m.role === 'admin'
              ? 'bg-gradient-to-r from-purple-500 to-pink-500'
              : 'bg-gradient-to-r from-blue-500 to-cyan-500'
          }`}
        >
          {m.role === 'admin' ? 'Admin' : 'Staff'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Joined',
      render: (m: StaffMember) =>
        m.createdAt ? new Date(m.createdAt).toLocaleDateString() : '-',
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (m: StaffMember) => (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => openEditRole(m)}
            className="text-blue-600 hover:text-blue-800"
            title="Change role"
          >
            <Edit size={18} />
          </button>
          <button
            type="button"
            onClick={() => handleDelete(m.id)}
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
        <p className="text-gray-600">Loading staff...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Staff Management
          </h1>
          <p className="text-gray-600 mt-1">Register staff and manage roles</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold"
        >
          <Plus size={20} />
          Add Staff
        </button>
      </div>

      <Card className="p-6">
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search staff..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <Table columns={columns} data={filteredStaff} keyExtractor={(s) => s.id} />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={resetForm}
        title={editingStaff ? 'Update Role' : 'Register Staff'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {!editingStaff && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </>
          )}
          {editingStaff && (
            <p className="text-sm text-gray-600">
              Updating role for <strong>{editingStaff.name}</strong>
            </p>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value as 'admin' | 'staff' })
              }
              className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
              disabled={!editingStaff}
            >
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold"
          >
            {editingStaff ? 'Update Role' : 'Register Staff'}
          </button>
        </form>
      </Modal>
    </div>
  );
}

