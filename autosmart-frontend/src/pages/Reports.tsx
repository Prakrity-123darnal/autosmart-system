import { useEffect, useState } from 'react';
import api from '../services/api';
import { Card } from '../components/Card';
import { DollarSign, Users, Package, TrendingUp } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type Period = 'daily' | 'monthly' | 'yearly';

interface TimeSeriesPoint {
  label: string;
  sales: number;
  customers: number;
}

interface TopPart {
  name: string;
  value: number;
}

interface TopCustomer {
  name: string;
  purchases: number;
  amount: number;
}

interface ReportSummaryResponse {
  totalRevenue: number;
  totalCustomers: number;
  partsSold: number;
  growthRate: number;
  salesSeries: TimeSeriesPoint[];
  customerSeries: TimeSeriesPoint[];
  topParts: TopPart[];
  topCustomers: TopCustomer[];
}

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

interface CustomerReportRow {
  customerId: number;
  name: string;
  phone: string;
  purchaseCount: number;
  totalSpent: number;
  pendingAmount: number;
}

interface CustomerReportsResponse {
  regularCustomers: CustomerReportRow[];
  topSpenders: CustomerReportRow[];
  pendingCredit: CustomerReportRow[];
}

export function Reports() {
  const [period, setPeriod] = useState<Period>('monthly');
  const [report, setReport] = useState<ReportSummaryResponse | null>(null);
  const [customerReports, setCustomerReports] = useState<CustomerReportsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    api
      .get(`/reports/summary?period=${period}`)
      .then((res) => {
        if (cancelled) return;
        setReport(res.data as ReportSummaryResponse);
      })
      .catch(() => {
        if (cancelled) return;
        setReport(null);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [period]);

  useEffect(() => {
    api
      .get<CustomerReportsResponse>('/reports/customers')
      .then((res) => setCustomerReports(res.data))
      .catch(() => setCustomerReports(null));
  }, []);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);

  const growth = report?.growthRate ?? 0;
  const growthIsPositive = growth >= 0;
  const growthText = `${growthIsPositive ? '+' : ''}${growth.toFixed(0)}%`;

  const salesSeries = report?.salesSeries ?? [];
  const customerSeries = report?.customerSeries ?? [];
  const topParts = report?.topParts ?? [];
  const topCustomers = report?.topCustomers ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">📊 Reports & Analytics</h1>
          <p className="text-gray-600 mt-1 text-lg">Business performance insights</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        >
          <option value="daily">Daily</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Revenue</p>
              <p className="text-3xl font-bold mt-2">{loading ? '—' : formatCurrency(report?.totalRevenue ?? 0)}</p>
              <p className={`text-sm mt-1 font-semibold ${growthIsPositive ? 'text-green-600' : 'text-red-600'}`}>
                {loading ? '' : `${growthText} vs last period`}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="text-green-600" size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Customers</p>
              <p className="text-3xl font-bold mt-2">{loading ? '—' : (report?.totalCustomers ?? 0).toLocaleString()}</p>
              <p className={`text-sm mt-1 font-semibold ${growthIsPositive ? 'text-green-600' : 'text-red-600'}`}>
                {loading ? '' : `${growthText} vs last period`}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="text-blue-600" size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Parts Sold</p>
              <p className="text-3xl font-bold mt-2">{loading ? '—' : (report?.partsSold ?? 0).toLocaleString()}</p>
              <p className="text-sm text-green-600 mt-1">Inventory movement</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Package className="text-purple-600" size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Growth Rate</p>
              <p className="text-3xl font-bold mt-2">{loading ? '—' : growthText}</p>
              <p className={`text-sm mt-1 font-semibold ${growthIsPositive ? 'text-green-600' : 'text-red-600'}`}>
                vs last period
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-orange-600" size={24} />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">💰 Sales Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E9D5FF" />
              <XAxis dataKey="label" stroke="#7C3AED" />
              <YAxis stroke="#7C3AED" />
              <Tooltip contentStyle={{ backgroundColor: '#F3E8FF', border: '2px solid #A78BFA', borderRadius: '12px' }} />
              <Legend />
              <Bar dataKey="sales" fill="url(#salesGradient)" name="Sales ($)" radius={[10, 10, 0, 0]} />
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">📈 Customer Growth</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={customerSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#D1FAE5" />
              <XAxis dataKey="label" stroke="#059669" />
              <YAxis stroke="#059669" />
              <Tooltip contentStyle={{ backgroundColor: '#D1FAE5', border: '2px solid #34D399', borderRadius: '12px' }} />
              <Legend />
              <Line type="monotone" dataKey="customers" stroke="url(#customerGradient)" strokeWidth={3} name="Customers" dot={{ fill: '#10B981', r: 6 }} />
              <defs>
                <linearGradient id="customerGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent mb-4">🔥 Top Selling Parts</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={topParts}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {topParts.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-4">⭐ Top Customers</h2>
          <div className="space-y-3">
            {topCustomers.map((customer) => (
              <div key={customer.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{customer.name}</p>
                  <p className="text-sm text-gray-600">{customer.purchases} purchases</p>
                </div>
                <p className="font-semibold text-gray-800">{formatCurrency(customer.amount)}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {customerReports && (
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Customer Reports (Staff)</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Regular Customers (2+ purchases)</h3>
              <ul className="text-sm space-y-1">
                {customerReports.regularCustomers.map((c) => (
                  <li key={c.customerId} className="bg-gray-50 p-2 rounded">
                    {c.name} — {c.purchaseCount} purchases
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Top Spenders</h3>
              <ul className="text-sm space-y-1">
                {customerReports.topSpenders.map((c) => (
                  <li key={c.customerId} className="bg-gray-50 p-2 rounded">
                    {c.name} — Rs. {c.totalSpent.toLocaleString()}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Pending Credit</h3>
              <ul className="text-sm space-y-1">
                {customerReports.pendingCredit.map((c) => (
                  <li key={c.customerId} className="bg-gray-50 p-2 rounded">
                    {c.name} — Rs. {c.pendingAmount.toLocaleString()} due
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

