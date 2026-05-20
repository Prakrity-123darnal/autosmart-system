import { Users, ShoppingCart, TrendingUp } from 'lucide-react';
import { StatsCard } from '../components/Card';

export function StaffDashboard() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl p-8 text-white shadow-2xl">
        <h1 className="text-4xl font-bold">💼 Staff Dashboard</h1>
        <p className="mt-2 text-cyan-100 text-lg">Manage your daily tasks efficiently.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Today's Customers"
          value="42"
          icon={<Users size={24} />}
          bgColor="bg-blue-500"
        />
        <StatsCard
          title="Today's Sales"
          value="$5,670"
          icon={<ShoppingCart size={24} />}
          bgColor="bg-green-500"
        />
        <StatsCard
          title="Pending Tasks"
          value="8"
          icon={<TrendingUp size={24} />}
          bgColor="bg-purple-500"
        />
      </div>

      <div className="bg-white rounded-2xl border border-purple-100 p-6 shadow-lg">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">💳 Recent Transactions</h2>
        <div className="space-y-3">
          {[
            { customer: 'John Doe', amount: '$450', time: '10:30 AM', status: 'Completed' },
            { customer: 'Jane Smith', amount: '$320', time: '11:15 AM', status: 'Completed' },
            { customer: 'Mike Johnson', amount: '$890', time: '12:00 PM', status: 'Pending' },
            { customer: 'Sarah Williams', amount: '$560', time: '1:45 PM', status: 'Completed' },
          ].map((transaction, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-800">{transaction.customer}</p>
                <p className="text-sm text-gray-500">{transaction.time}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-800">{transaction.amount}</p>
                <p
                  className={`text-xs ${
                    transaction.status === 'Completed' ? 'text-green-600' : 'text-yellow-600'
                  }`}
                >
                  {transaction.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-purple-100 p-6 shadow-lg">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">⚡ Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: 'Add Customer', icon: '👥', gradient: 'from-blue-500 to-cyan-500' },
            { label: 'New Sale', icon: '💰', gradient: 'from-green-500 to-emerald-500' },
            { label: 'Check Inventory', icon: '📦', gradient: 'from-purple-500 to-pink-500' },
            { label: 'View Customers', icon: '👀', gradient: 'from-orange-500 to-red-500' },
            { label: 'Generate Report', icon: '📊', gradient: 'from-yellow-500 to-orange-500' },
            { label: 'Update Stock', icon: '🔄', gradient: 'from-teal-500 to-cyan-500' },
          ].map((action, index) => (
            <button
              key={index}
              className={`bg-gradient-to-r ${action.gradient} text-white p-4 rounded-xl hover:shadow-lg transition-all transform hover:scale-105 font-semibold`}
            >
              <span className="text-2xl block mb-1">{action.icon}</span>
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
