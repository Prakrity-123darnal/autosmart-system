import { Bell, AlertTriangle, Info, CheckCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/Card';
import api from '../services/api';

interface Notification {
  id: number;
  type: 'alert' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const adminNotifications: Notification[] = [
  {
    id: 1,
    type: 'alert',
    title: 'Low Stock Alert',
    message: 'Oil Filter stock is below 10 units. Please reorder soon.',
    time: '5 minutes ago',
    read: false,
  },
  {
    id: 2,
    type: 'alert',
    title: 'Low Stock Alert',
    message: 'Spark Plugs stock is below 10 units. Please reorder soon.',
    time: '1 hour ago',
    read: false,
  },
  {
    id: 3,
    type: 'success',
    title: 'New Customer',
    message: 'New customer "Sarah Williams" has been registered.',
    time: '2 hours ago',
    read: true,
  },
  {
    id: 4,
    type: 'info',
    title: 'Sales Report',
    message: 'Monthly sales report is ready for review.',
    time: '1 day ago',
    read: true,
  },
];

const customerNotifications: Notification[] = [
  {
    id: 1,
    type: 'warning',
    title: 'Service Reminder',
    message: 'Your Toyota Camry is due for an oil change in 2 weeks.',
    time: '1 day ago',
    read: false,
  },
  {
    id: 2,
    type: 'alert',
    title: 'Payment Due',
    message: 'Credit payment of $450 is due on May 5, 2026.',
    time: '2 days ago',
    read: false,
  },
  {
    id: 3,
    type: 'info',
    title: 'Special Offer',
    message: '20% off on brake services this month!',
    time: '3 days ago',
    read: true,
  },
  {
    id: 4,
    type: 'success',
    title: 'Appointment Confirmed',
    message: 'Your service appointment on May 15, 2026 is confirmed.',
    time: '5 days ago',
    read: true,
  },
];

export function Notifications() {
  const { user } = useAuth();
  const initialNotifications = user?.role === 'customer' ? customerNotifications : adminNotifications;
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fallback = user?.role === 'customer' ? customerNotifications : adminNotifications;

    setLoading(true);
    api
      .get('/notifications')
      .then((res) => {
        if (cancelled) return;
        setNotifications((res.data as Notification[]) ?? []);
      })
      .catch(() => {
        if (cancelled) return;
        setNotifications(fallback);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.role]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="text-red-500" size={24} />;
      case 'warning':
        return <AlertTriangle className="text-yellow-500" size={24} />;
      case 'success':
        return <CheckCircle className="text-green-500" size={24} />;
      default:
        return <Info className="text-blue-500" size={24} />;
    }
  };

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'alert':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const markAsRead = (id: number) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">🔔 Notifications</h1>
          <p className="text-gray-600 mt-1 text-lg">
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setNotifications(notifications.map((n) => ({ ...n, read: true })))}
          className="text-sm text-blue-600 hover:underline"
        >
          Mark all as read
        </button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <Card className="p-8 text-center">
            <Bell className="mx-auto text-gray-400 mb-3" size={48} />
            <p className="text-gray-600">Loading notifications...</p>
          </Card>
        ) : notifications.length === 0 ? (
          <Card className="p-8 text-center">
            <Bell className="mx-auto text-gray-400 mb-3" size={48} />
            <p className="text-gray-600">No notifications</p>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`p-4 border ${
                notification.read ? 'bg-white border-gray-200' : getBackgroundColor(notification.type)
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">{getIcon(notification.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{notification.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-2">{notification.time}</p>
                    </div>
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="text-sm text-blue-600 hover:underline mt-2"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
