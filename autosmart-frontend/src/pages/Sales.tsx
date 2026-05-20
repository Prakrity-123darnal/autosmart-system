import { useState, useEffect, useCallback } from 'react';
import { Plus, Printer, Mail, Gift } from 'lucide-react';
import { Card } from '../components/Card';
import { Modal } from '../components/Modal';
import { toast } from 'sonner';
import api from '../services/api';
import { getApiError } from '../utils/getApiError';

interface Customer {
  id: number;
  name: string;
}

interface Part {
  id: number;
  name: string;
  price: number;
  stock: number;
}

interface SaleItem {
  partId: number;
  quantity: number;
  unitPrice: number;
}

interface Sale {
  id: number;
  customerId: number;
  totalAmount: number;
  createdAt: string;
  items: SaleItem[];
}

interface LineItem {
  partId: number;
  quantity: number;
}

export function Sales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerId, setCustomerId] = useState(0);
  const [lineItems, setLineItems] = useState<LineItem[]>([{ partId: 0, quantity: 1 }]);
  const [discountPreview, setDiscountPreview] = useState({ discount: 0, total: 0 });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [salesRes, customersRes, partsRes] = await Promise.all([
        api.get<Sale[]>('/sales'),
        api.get<Customer[]>('/customers'),
        api.get<Part[]>('/parts'),
      ]);
      setSales(salesRes.data);
      setCustomers(customersRes.data);
      setParts(partsRes.data);
    } catch (err) {
      toast.error(getApiError(err, 'Failed to load sales data'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const partName = (id: number) =>
    parts.find((p) => p.id === id)?.name ?? `Part #${id}`;

  const customerName = (id: number) =>
    customers.find((c) => c.id === id)?.name ?? `Customer #${id}`;

  const calcSubtotal = (items: LineItem[]) =>
    items.reduce((sum, row) => {
      const part = parts.find((p) => p.id === row.partId);
      return sum + (part ? part.price * row.quantity : 0);
    }, 0);

  useEffect(() => {
    const subtotal = calcSubtotal(lineItems);
    api
      .post('/loyalty/calculate-discount', { subtotal })
      .then((res) => {
        setDiscountPreview({
          discount: res.data.discountAmount ?? 0,
          total: res.data.totalAfterDiscount ?? subtotal,
        });
      })
      .catch(() => {
        const discount = subtotal > 5000 ? subtotal * 0.1 : 0;
        setDiscountPreview({ discount, total: subtotal - discount });
      });
  }, [lineItems, parts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      toast.error('Select a customer');
      return;
    }
    const items = lineItems.filter((i) => i.partId && i.quantity > 0);
    if (items.length === 0) {
      toast.error('Add at least one part');
      return;
    }
    try {
      await api.post('/sales', {
        customerId,
        items: items.map((i) => ({ partId: i.partId, quantity: i.quantity })),
      });
      toast.success('Invoice created');
      setIsModalOpen(false);
      setCustomerId(0);
      setLineItems([{ partId: 0, quantity: 1 }]);
      load();
    } catch (err) {
      toast.error(getApiError(err, 'Failed to create invoice'));
    }
  };

  const sendEmail = async (id: number) => {
    try {
      await api.post(`/sales/${id}/email`);
      toast.success('Invoice emailed to customer');
    } catch (err) {
      toast.error(getApiError(err, 'Failed to send email'));
    }
  };

  if (loading) {
    return <p className="text-gray-600 p-6">Loading sales...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Sales & Invoices
          </h1>
          <p className="text-gray-600 mt-1">Create and manage invoices</p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold"
        >
          <Plus size={20} />
          Create Invoice
        </button>
      </div>

      <div className="grid gap-6">
        {sales.map((invoice) => (
          <Card key={invoice.id} className="p-6">
            <div className="flex justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Invoice #{invoice.id}</h3>
                <p className="text-sm text-gray-600">
                  Customer: {customerName(invoice.customerId)}
                </p>
                <p className="text-sm text-gray-600">
                  Date: {new Date(invoice.createdAt).toLocaleDateString()}
                </p>
                {invoice.totalAmount > 0 && (
                  <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                    <Gift size={14} /> Total includes loyalty discount if applicable
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => window.print()} className="p-2 text-blue-600">
                  <Printer size={20} />
                </button>
                <button type="button" onClick={() => sendEmail(invoice.id)} className="p-2 text-green-600">
                  <Mail size={20} />
                </button>
              </div>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-2">Part</th>
                  <th className="text-right p-2">Qty</th>
                  <th className="text-right p-2">Price</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-2">{partName(item.partId)}</td>
                    <td className="text-right p-2">{item.quantity}</td>
                    <td className="text-right p-2">Rs. {item.unitPrice.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-right mt-4 text-xl font-bold">
              Total: Rs. {invoice.totalAmount.toLocaleString()}
            </p>
          </Card>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Invoice">
        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            required
            value={customerId || ''}
            onChange={(e) => setCustomerId(parseInt(e.target.value, 10))}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">Select customer</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {lineItems.map((row, index) => (
            <div key={index} className="grid grid-cols-2 gap-2">
              <select
                value={row.partId || ''}
                onChange={(e) => {
                  const next = [...lineItems];
                  next[index].partId = parseInt(e.target.value, 10);
                  setLineItems(next);
                }}
                className="border rounded-lg px-2 py-2"
              >
                <option value="">Part</option>
                {parts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Rs. {p.price}, stock {p.stock})
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                value={row.quantity}
                onChange={(e) => {
                  const next = [...lineItems];
                  next[index].quantity = parseInt(e.target.value, 10) || 1;
                  setLineItems(next);
                }}
                className="border rounded-lg px-2 py-2"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => setLineItems([...lineItems, { partId: 0, quantity: 1 }])}
            className="text-sm text-blue-600"
          >
            + Add part
          </button>
          <div className="bg-purple-50 p-4 rounded-lg text-sm space-y-1">
            <p>Subtotal: Rs. {calcSubtotal(lineItems).toLocaleString()}</p>
            <p>Discount: Rs. {discountPreview.discount.toLocaleString()}</p>
            <p className="font-bold text-lg">
              Total: Rs. {discountPreview.total.toLocaleString()}
            </p>
          </div>
          <button type="submit" className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold">
            Generate Invoice
          </button>
        </form>
      </Modal>
    </div>
  );
}

