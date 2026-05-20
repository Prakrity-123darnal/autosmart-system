import { useState, useEffect } from "react";
import api from "../services/api";

function SalesPage() {
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [formData, setFormData] = useState({
    customerId: "",
    vehicleId: "",
    items: [{ partId: "", quantity: 1, unitPrice: 0 }],
    invoiceDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchSales();
    fetchCustomers();
    fetchVehicles();
    fetchParts();
  }, []);

  const fetchSales = async () => {
    try {
      const response = await api.get("/sales");
      setSales(response.data);
    } catch (error) {
      console.error("Error fetching sales:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await api.get("/customers");
      setCustomers(response.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await api.get("/vehicles");
      setVehicles(response.data);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    }
  };

  const fetchParts = async () => {
    try {
      const response = await api.get("/parts");
      setParts(response.data);
    } catch (error) {
      console.error("Error fetching parts:", error);
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { partId: "", quantity: 1, unitPrice: 0 }]
    });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'partId') {
      const part = parts.find(p => p.id === parseInt(value));
      if (part) {
        newItems[index].unitPrice = part.price;
      }
    }
    
    setFormData({ ...formData, items: newItems });
  };

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => {
      return total + (item.quantity * item.unitPrice);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const saleData = {
        ...formData,
        totalAmount: calculateTotal(),
        items: formData.items.map(item => ({
          partId: parseInt(item.partId),
          quantity: parseInt(item.quantity),
          unitPrice: parseFloat(item.unitPrice)
        }))
      };

      if (editingSale) {
        await api.put(`/sales/${editingSale.id}`, saleData);
      } else {
        await api.post("/sales", saleData);
      }
      fetchSales();
      resetForm();
    } catch (error) {
      console.error("Error saving sale:", error);
    }
  };

  const handleEdit = (sale) => {
    setEditingSale(sale);
    setFormData({
      customerId: sale.customerId,
      vehicleId: sale.vehicleId,
      items: sale.items || [{ partId: "", quantity: 1, unitPrice: 0 }],
      invoiceDate: sale.invoiceDate?.split('T')[0] || new Date().toISOString().split('T')[0]
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this sale?")) {
      try {
        await api.delete(`/sales/${id}`);
        fetchSales();
      } catch (error) {
        console.error("Error deleting sale:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      customerId: "",
      vehicleId: "",
      items: [{ partId: "", quantity: 1, unitPrice: 0 }],
      invoiceDate: new Date().toISOString().split('T')[0]
    });
    setEditingSale(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="loading">Loading sales...</div>;
  }

  return (
    <div className="sales-page">
      <div className="page-header">
        <h1>Sales Invoice Management</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          Create Invoice
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal large-modal">
            <div className="modal-header">
              <h2>{editingSale ? "Edit Invoice" : "Create New Invoice"}</h2>
              <button className="btn-close" onClick={resetForm}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Customer:</label>
                  <select
                    value={formData.customerId}
                    onChange={(e) => setFormData({...formData, customerId: e.target.value})}
                    required
                  >
                    <option value="">Select a customer</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Vehicle:</label>
                  <select
                    value={formData.vehicleId}
                    onChange={(e) => setFormData({...formData, vehicleId: e.target.value})}
                    required
                  >
                    <option value="">Select a vehicle</option>
                    {vehicles
                      .filter(v => !formData.customerId || v.customerId === parseInt(formData.customerId))
                      .map((vehicle) => (
                        <option key={vehicle.id} value={vehicle.id}>
                          {vehicle.vehicleNumber} - {vehicle.brand}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Invoice Date:</label>
                  <input
                    type="date"
                    value={formData.invoiceDate}
                    onChange={(e) => setFormData({...formData, invoiceDate: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="invoice-items">
                <h3>Invoice Items</h3>
                {formData.items.map((item, index) => (
                  <div key={index} className="item-row">
                    <div className="form-group">
                      <label>Part:</label>
                      <select
                        value={item.partId}
                        onChange={(e) => updateItem(index, 'partId', e.target.value)}
                        required
                      >
                        <option value="">Select a part</option>
                        {parts.map((part) => (
                          <option key={part.id} value={part.id}>
                            {part.name} - ${part.price.toFixed(2)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Quantity:</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Unit Price:</label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Total:</label>
                      <input
                        type="text"
                        value={`$${(item.quantity * item.unitPrice).toFixed(2)}`}
                        readOnly
                      />
                    </div>
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => removeItem(index)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={addItem}
                >
                  Add Item
                </button>
              </div>

              <div className="invoice-total">
                <h3>Total Amount: ${calculateTotal().toFixed(2)}</h3>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingSale ? "Update" : "Create Invoice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="sales-list">
        {sales.length === 0 ? (
          <p>No sales invoices found. Create your first invoice!</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Customer</th>
                <th>Vehicle</th>
                <th>Date</th>
                <th>Total Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id}>
                  <td>#{sale.id}</td>
                  <td>{sale.customerName || 'Unknown'}</td>
                  <td>{sale.vehicleInfo || 'Unknown'}</td>
                  <td>{new Date(sale.invoiceDate).toLocaleDateString()}</td>
                  <td>${sale.totalAmount?.toFixed(2) || '0.00'}</td>
                  <td>
                    <button 
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleEdit(sale)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(sale.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default SalesPage;
