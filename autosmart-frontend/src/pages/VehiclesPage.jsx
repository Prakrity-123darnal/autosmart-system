import { useState, useEffect } from "react";
import api from "../services/api";

function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({
    vehicleNumber: "",
    brand: "",
    customerId: ""
  });

  useEffect(() => {
    fetchVehicles();
    fetchCustomers();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await api.get("/vehicles");
      setVehicles(response.data);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingVehicle) {
        await api.put(`/vehicles/${editingVehicle.id}`, formData);
      } else {
        await api.post("/vehicles", formData);
      }
      fetchVehicles();
      resetForm();
    } catch (error) {
      console.error("Error saving vehicle:", error);
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      vehicleNumber: vehicle.vehicleNumber,
      brand: vehicle.brand,
      customerId: vehicle.customerId
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this vehicle?")) {
      try {
        await api.delete(`/vehicles/${id}`);
        fetchVehicles();
      } catch (error) {
        console.error("Error deleting vehicle:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      vehicleNumber: "",
      brand: "",
      customerId: ""
    });
    setEditingVehicle(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="loading">Loading vehicles...</div>;
  }

  return (
    <div className="vehicles-page">
      <div className="page-header">
        <h1>Vehicle Management</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          Add Vehicle
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}</h2>
              <button className="btn-close" onClick={resetForm}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group">
                <label>Vehicle Number:</label>
                <input
                  type="text"
                  value={formData.vehicleNumber}
                  onChange={(e) => setFormData({...formData, vehicleNumber: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Brand:</label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({...formData, brand: e.target.value})}
                  required
                />
              </div>
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
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingVehicle ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="vehicles-list">
        {vehicles.length === 0 ? (
          <p>No vehicles found. Add your first vehicle!</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Vehicle Number</th>
                <th>Brand</th>
                <th>Customer</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id}>
                  <td>{vehicle.vehicleNumber}</td>
                  <td>{vehicle.brand}</td>
                  <td>{vehicle.customerName || 'Unknown'}</td>
                  <td>
                    <button 
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleEdit(vehicle)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(vehicle.id)}
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

export default VehiclesPage;
