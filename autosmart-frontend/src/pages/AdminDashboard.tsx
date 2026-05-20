import { Users, Package, DollarSign, AlertTriangle } from 'lucide-react';
import { StatsCard } from '../components/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const salesData = [
  { month: 'Jan', sales: 45000 },
  { month: 'Feb', sales: 52000 },
  { month: 'Mar', sales: 48000 },
  { month: 'Apr', sales: 61000 },
  { month: 'May', sales: 55000 },
  { month: 'Jun', sales: 67000 },
];

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-3xl p-8 text-white shadow-2xl">
        <h1 className="text-4xl font-bold">👋 Admin Dashboard</h1>
        <p className="mt-2 text-purple-100 text-lg">Welcome back! Here's your business overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Customers"
          value="1,247"
          icon={<Users size={24} />}
          trend="+12% from last month"
          bgColor="bg-blue-500"
        />
        <StatsCard
          title="Total Parts"
          value="3,456"
          icon={<Package size={24} />}
          trend="+8% from last month"
          bgColor="bg-green-500"
        />
        <StatsCard
          title="Total Sales"
          value="$67,890"
          icon={<DollarSign size={24} />}
          trend="+23% from last month"
          bgColor="bg-purple-500"
        />
        <StatsCard
          title="Low Stock Alerts"
          value="23"
          icon={<AlertTriangle size={24} />}
          bgColor="bg-red-500"
        />
      </div>

      <div className="bg-white rounded-2xl border border-purple-100 p-6 shadow-lg">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">📊 Sales Overview</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E9D5FF" />
            <XAxis dataKey="month" stroke="#7C3AED" />
            <YAxis stroke="#7C3AED" />
            <Tooltip contentStyle={{ backgroundColor: '#F3E8FF', border: '2px solid #A78BFA', borderRadius: '12px' }} />
            <Bar dataKey="sales" fill="url(#colorGradient)" radius={[10, 10, 0, 0]} />
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-purple-100 p-6 shadow-lg">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">⚡ Recent Activities</h2>
          <div className="space-y-4">
            {[
              { action: 'New customer registered', time: '5 minutes ago', type: 'success' },
              { action: 'Low stock alert: Brake Pads', time: '1 hour ago', type: 'warning' },
              { action: 'Invoice #1234 generated', time: '2 hours ago', type: 'info' },
              { action: 'New part added to inventory', time: '3 hours ago', type: 'success' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div
                  className={`w-2 h-2 rounded-full ${
                    activity.type === 'success'
                      ? 'bg-green-500'
                      : activity.type === 'warning'
                      ? 'bg-yellow-500'
                      : 'bg-blue-500'
                  }`}
                ></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-purple-100 p-6 shadow-lg">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent mb-4">🎯 Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Add Customer', gradient: 'from-blue-500 to-cyan-500', icon: '👥' },
              { label: 'Add Part', gradient: 'from-green-500 to-emerald-500', icon: '📦' },
              { label: 'Create Invoice', gradient: 'from-purple-500 to-pink-500', icon: '🧾' },
              { label: 'View Reports', gradient: 'from-orange-500 to-yellow-500', icon: '📊' },
            ].map((action, index) => (
              <button
                key={index}
                className={`bg-gradient-to-r ${action.gradient} text-white p-4 rounded-xl hover:shadow-xl transition-all transform hover:scale-105 font-semibold`}
              >
                <span className="text-2xl mb-2 block">{action.icon}</span>
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
