import { useState, useEffect } from "react";
import Card from "../components/Card";
import api from "../services/api";

function DashboardPage() {
  const [stats, setStats] = useState({
    customers: 0,
    parts: 0,
    vendors: 0,
    sales: 0,
    vehicles: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [customersRes, partsRes, vendorsRes, salesRes, vehiclesRes] = await Promise.all([
        api.get("/customers"),
        api.get("/parts"),
        api.get("/vendors"),
        api.get("/sales"),
        api.get("/vehicles")
      ]);

      const customers = customersRes.data || [];
      const parts = partsRes.data || [];
      const vendors = vendorsRes.data || [];
      const sales = salesRes.data || [];
      const vehicles = vehiclesRes.data || [];

      // Calculate statistics
      const totalRevenue = sales.reduce((sum, sale) => {
        return sum + (sale.items?.reduce((itemSum, item) => {
          const part = parts.find(p => p.id === item.partId);
          return itemSum + (part ? part.price * item.quantity : 0);
        }, 0) || 0);
      }, 0);

      setStats({
        customers: customers.length,
        parts: parts.length,
        vendors: vendors.length,
        sales: sales.length,
        vehicles: vehicles.length,
        revenue: totalRevenue
      });

      // Prepare recent activity (last 5 items)
      const activity = [
        ...customers.slice(-3).map(c => ({ type: 'customer', name: c.name, time: '2 hours ago' })),
        ...sales.slice(-2).map(s => ({ type: 'sale', name: `Invoice #${s.id}`, time: '1 hour ago' }))
      ].slice(0, 5);
      
      setRecentActivity(activity);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <section>
        <h1>Dashboard</h1>
        <div className="loading">Loading dashboard data...</div>
      </section>
    );
  }

  return (
    <section>
      <h1>Dashboard</h1>
      <p className="subtle-text">Welcome to AutoSmart Vehicle Parts Management System</p>
      
      {/* Statistics Cards */}
      <div className="card-grid">
        <Card title="Total Customers" value={stats.customers} icon="👥" color="blue" />
        <Card title="Total Parts" value={stats.parts} icon="🔧" color="green" />
        <Card title="Total Vendors" value={stats.vendors} icon="🏢" color="purple" />
        <Card title="Total Sales" value={stats.sales} icon="💰" color="orange" />
        <Card title="Total Vehicles" value={stats.vehicles} icon="🚗" color="red" />
        <Card title="Total Revenue" value={formatCurrency(stats.revenue)} icon="💵" color="emerald" />
      </div>

      {/* Recent Activity Section */}
      <div className="dashboard-sections">
        <div className="form-section">
          <h3>Recent Activity</h3>
          {recentActivity.length > 0 ? (
            <div className="activity-list">
              {recentActivity.map((activity, index) => (
                <div key={index} className="activity-item">
                  <span className="activity-icon">
                    {activity.type === 'customer' ? '👤' : '🧾'}
                  </span>
                  <div className="activity-details">
                    <span className="activity-name">{activity.name}</span>
                    <span className="activity-time">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="table-empty">No recent activity</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="form-section">
          <h3>Quick Actions</h3>
          <div className="quick-actions">
            <a href="/customers" className="quick-action-card">
              <span className="quick-action-icon">➕</span>
              <span>Add Customer</span>
            </a>
            <a href="/parts" className="quick-action-card">
              <span className="quick-action-icon">📦</span>
              <span>Add Part</span>
            </a>
            <a href="/sales" className="quick-action-card">
              <span className="quick-action-icon">🧾</span>
              <span>Create Sale</span>
            </a>
            <a href="/vendors" className="quick-action-card">
              <span className="quick-action-icon">🏢</span>
              <span>Add Vendor</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DashboardPage;
