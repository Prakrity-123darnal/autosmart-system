import { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '../components/Card';
import { Modal } from '../components/Modal';
import api from '../services/api';
import { getApiError } from '../utils/getApiError';

interface Vendor {
  id: number;
  name: string;
}

interface PurchaseItem {
  partName: string;
  quantity: number;
  unitPrice: number;
}

interface PurchaseInvoice {
  id: number;
  vendorId: number;
  totalAmount: number;
  createdAt: string;
  items: PurchaseItem[];
  vendor?: { name: string };
}

export function PurchaseInvoices() {
  const [purchases, setPurchases] = useState<PurchaseInvoice[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vendorId, setVendorId] = useState(0);
  const [items, setItems] = useState<PurchaseItem[]>([
    { partName: '', quantity: 1, unitPrice: 0 },
  ]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, vRes] = await Promise.all([
        api.get<PurchaseInvoice[]>('/purchase-invoices'),
        api.get<Vendor[]>('/vendors'),
      ]);
      setPurchases(pRes.data);
      setVendors(vRes.data);
    } catch (err) {
      toast.error(getApiError(err, 'Failed to load purchase invoices (admin login required)'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorId) {
      toast.error('Select a vendor');
      return;
    }
    const validItems = items.filter((i) => i.partName.trim());
    if (validItems.length === 0) {
      toast.error('Add at least one item');
      return;
    }
    try {
      await api.post('/purchase-invoices', { vendorId, items: validItems });
      toast.success('Purchase invoice created — stock updated for matching parts');
      setIsModalOpen(false);
      setVendorId(0);
      setItems([{ partName: '', quantity: 1, unitPrice: 0 }]);
      load();
    } catch (err) {
      toast.error(getApiError(err, 'Failed to create purchase invoice'));
    }
  };

  if (loading) return <p className="p-6 text-gray-600">Loading...</p>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-orange-700">Purchase Invoices</h1>
          <p className="text-gray-600">Restock inventory from vendors</p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-orange-600 text-white px-5 py-2 rounded-xl"
        >
          <Plus size={18} /> New Purchase
        </button>
      </div>

      <div className="grid gap-4">
        {purchases.length === 0 ? (
          <Card className="p-8 text-center text-gray-600">
            No purchase invoices yet. Add a vendor under Vendors, then click{' '}
            <strong>New Purchase</strong> to restock parts.
          </Card>
        ) : (
          purchases.map((p) => (
          <Card key={p.id} className="p-5">
            <p className="font-semibold">Invoice #{p.id}</p>
            <p className="text-sm text-gray-600">
              Vendor: {p.vendor?.name ?? `#${p.vendorId}`} ·{' '}
              {new Date(p.createdAt).toLocaleDateString()}
            </p>
            <ul className="mt-2 text-sm">
              {p.items?.map((item, i) => (
                <li key={i}>
                  {item.partName} × {item.quantity} @ Rs. {item.unitPrice}
                </li>
              ))}
            </ul>
            <p className="mt-2 font-bold">Total: Rs. {p.totalAmount.toLocaleString()}</p>
          </Card>
        ))
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Purchase Invoice">
        <form onSubmit={handleSubmit} className="space-y-3">
          <select
            required
            value={vendorId || ''}
            onChange={(e) => setVendorId(parseInt(e.target.value, 10))}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">Select vendor</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-3 gap-2">
              <input
                placeholder="Part name (must match inventory)"
                value={item.partName}
                onChange={(e) => {
                  const next = [...items];
                  next[index].partName = e.target.value;
                  setItems(next);
                }}
                className="border rounded-lg px-2 py-2 col-span-1"
              />
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) => {
                  const next = [...items];
                  next[index].quantity = parseInt(e.target.value, 10) || 1;
                  setItems(next);
                }}
                className="border rounded-lg px-2 py-2"
              />
              <input
                type="number"
                min={0}
                step={0.01}
                value={item.unitPrice}
                onChange={(e) => {
                  const next = [...items];
                  next[index].unitPrice = parseFloat(e.target.value) || 0;
                  setItems(next);
                }}
                className="border rounded-lg px-2 py-2"
              />
            </div>
          ))}
          <button
            type="button"
            className="text-sm text-orange-600"
            onClick={() =>
              setItems([...items, { partName: '', quantity: 1, unitPrice: 0 }])
            }
          >
            + Add item
          </button>
          <button type="submit" className="w-full bg-orange-600 text-white py-3 rounded-xl font-semibold">
            Save Purchase
          </button>
        </form>
      </Modal>
    </div>
  );
}

