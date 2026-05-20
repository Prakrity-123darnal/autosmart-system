import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Car, Calendar, Bell, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { Card, StatsCard } from '../components/Card';
import api from '../services/api';
import { getApiError } from '../utils/getApiError';

interface Vehicle {
  id: number;
  vehicleNumber: string;
  make: string;
  model: string;
  year: number;
}

interface ServiceHistoryItem {
  title: string;
  date: string;
  amount?: number;
  type: string;
}

interface AppointmentSummary {
  id: number;
  serviceType: string;
  appointmentDate: string;
  status: string;
}

interface DashboardData {
  customerId: number;
  name: string;
  vehicles: Vehicle[];
  purchaseHistory: {
    invoiceId: number;
    totalAmount: number;
    isPaid: boolean;
    createdAt: string;
  }[];
  upcomingAppointments: AppointmentSummary[];
  serviceHistory: ServiceHistoryItem[];
  stats: {
    vehicleCount: number;
    upcomingAppointments: number;
    pendingPayments: number;
    notificationCount: number;
  };
}

type Recommendation = {
  message: string;
  type: 'warning' | 'alert' | 'info' | 'success' | string;
  action: string;
};

const formatRs = (amount: number) =>
  `Rs. ${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

export function CustomerDashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashboardRes, recRes] = await Promise.all([
        api.get<DashboardData>('/customers/me/dashboard'),
        api.get<Recommendation[]>('/maintenance/recommendations').catch(() => ({
          data: [] as Recommendation[],
        })),
      ]);
      setDashboard(dashboardRes.data);
      setRecommendations(recRes.data ?? []);
    } catch (err) {
      const msg = getApiError(err, 'Failed to load dashboard');
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const nextAppointmentLabel = dashboard?.upcomingAppointments[0]
    ? formatDate(dashboard.upcomingAppointments[0].appointmentDate)
    : 'None scheduled';

  if (loading) {
    return <p className="text-gray-600">Loading your dashboard...</p>;
  }

  if (error || !dashboard) {
    return (
      <Card className="p-8 text-center">
        <p className="text-amber-800 mb-4">
          {error ?? 'Unable to load dashboard. Make sure you are logged in as a customer with a linked profile.'}
        </p>
        <button
          type="button"
          onClick={load}
          className="text-purple-600 font-semibold hover:underline"
        >
          Try again
        </button>
      </Card>
    );
  }

  const { stats, vehicles, serviceHistory, purchaseHistory } = dashboard;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-3xl p-8 text-white shadow-2xl">
        <h1 className="text-4xl font-bold">🚗 Customer Dashboard</h1>
        <p className="mt-2 text-pink-100 text-lg">
          Welcome back, {dashboard.name}. Manage your vehicles and services.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="My Vehicles"
          value={String(stats.vehicleCount)}
          icon={<Car size={24} />}
          bgColor="bg-blue-500"
        />
        <StatsCard
          title="Upcoming Services"
          value={String(stats.upcomingAppointments)}
          icon={<Calendar size={24} />}
          bgColor="bg-green-500"
        />
        <StatsCard
          title="Pending Payments"
          value={formatRs(stats.pendingPayments)}
          icon={<CreditCard size={24} />}
          bgColor="bg-orange-500"
        />
        <StatsCard
          title="Notifications"
          value={String(stats.notificationCount)}
          icon={<Bell size={24} />}
          bgColor="bg-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">My Vehicles</h2>
            <Link to="/appointments" className="text-sm text-purple-600 font-medium hover:underline">
              Book service
            </Link>
          </div>
          {vehicles.length === 0 ? (
            <p className="text-gray-500 text-sm">
              No vehicles on file.{' '}
              <Link to="/profile" className="text-purple-600 font-medium hover:underline">
                Add a vehicle in My Profile
              </Link>
            </p>
          ) : (
            <div className="space-y-3">
              {vehicles.map((vehicle) => (
                <div key={vehicle.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Car size={20} className="text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-800">
                        {vehicle.make} {vehicle.model} {vehicle.year}
                      </p>
                      <p className="text-sm text-gray-500">{vehicle.vehicleNumber}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Next appointment:{' '}
                    <span className="font-medium">{nextAppointmentLabel}</span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Service & Purchase History</h2>
          {serviceHistory.length === 0 ? (
            <p className="text-gray-500 text-sm">No service or purchase history yet.</p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {serviceHistory.map((item, index) => (
                <div
                  key={`${item.type}-${item.date}-${index}`}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-800">{item.title}</p>
                    <p className="text-sm text-gray-500">{formatDate(item.date)}</p>
                    <span className="text-xs text-gray-400 capitalize">{item.type}</span>
                  </div>
                  {item.amount != null && (
                    <p className="font-semibold text-gray-800">{formatRs(item.amount)}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {purchaseHistory.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Purchase Invoices</h2>
          <div className="space-y-2">
            {purchaseHistory.map((inv) => (
              <div
                key={inv.invoiceId}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm"
              >
                <span>
                  Invoice #{inv.invoiceId} · {formatDate(inv.createdAt)}
                </span>
                <span className="font-semibold">{formatRs(inv.totalAmount)}</span>
                <span
                  className={`px-2 py-0.5 rounded text-xs ${
                    inv.isPaid ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {inv.isPaid ? 'Paid' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-6 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-4">🤖 Maintenance Recommendations</h2>
        <div className="space-y-3">
          {recommendations.length === 0 ? (
            <p className="text-white/90">No recommendations at the moment.</p>
          ) : (
            recommendations.map((notification, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-white/90 rounded-xl backdrop-blur-sm shadow-md"
              >
                <div className="flex items-center gap-3">
                  <Bell
                    size={20}
                    className={
                      notification.type === 'warning'
                        ? 'text-yellow-500'
                        : notification.type === 'alert'
                          ? 'text-red-500'
                          : 'text-blue-500'
                    }
                  />
                  <p className="text-sm text-gray-800 font-medium">{notification.message}</p>
                </div>
                <Link
                  to="/appointments"
                  className="text-sm bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-purple-50"
                >
                  {notification.action}
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
