import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  User,
  Car,
  Package,
  Store,
  ShoppingCart,
  BarChart3,
  Bell,
  Calendar,
  Star,
  FileText,
  Receipt,
  LogOut,
} from 'lucide-react';

type SidebarUser = {
  role: 'admin' | 'staff' | 'customer' | string;
};

interface SidebarProps {
  user: SidebarUser;
  onLogout?: () => void;
}

export function Sidebar({ user, onLogout }: SidebarProps) {

  const adminLinks = [
    { to: '/dashboard/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/staff', icon: Users, label: 'Staff' },
    { to: '/customers', icon: Users, label: 'Customers' },
    { to: '/vehicles', icon: Car, label: 'Vehicles' },
    { to: '/parts', icon: Package, label: 'Parts' },
    { to: '/vendors', icon: Store, label: 'Vendors' },
    { to: '/purchase-invoices', icon: Receipt, label: 'Purchases' },
    { to: '/sales', icon: ShoppingCart, label: 'Sales' },
    { to: '/reports', icon: BarChart3, label: 'Reports' },
    { to: '/appointments', icon: Calendar, label: 'Appointments' },
    { to: '/part-requests', icon: FileText, label: 'Part Requests' },
    { to: '/reviews', icon: Star, label: 'Reviews' },
    { to: '/notifications', icon: Bell, label: 'Notifications' },
  ];

  const staffLinks = [
    { to: '/dashboard/staff', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/customers', icon: Users, label: 'Customers' },
    { to: '/vehicles', icon: Car, label: 'Vehicles' },
    { to: '/sales', icon: ShoppingCart, label: 'Sales' },
    { to: '/appointments', icon: Calendar, label: 'Appointments' },
    { to: '/part-requests', icon: FileText, label: 'Part Requests' },
    { to: '/reviews', icon: Star, label: 'Reviews' },
    { to: '/notifications', icon: Bell, label: 'Notifications' },
  ];

  const customerLinks = [
    { to: '/dashboard/customer', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/profile', icon: User, label: 'My Profile' },
    { to: '/appointments', icon: Calendar, label: 'Appointments' },
    { to: '/part-requests', icon: FileText, label: 'Request Parts' },
    { to: '/reviews', icon: Star, label: 'Reviews' },
    { to: '/notifications', icon: Bell, label: 'Notifications' },
  ];

  const links =
    user.role === 'admin'
      ? adminLinks
      : user.role === 'staff'
        ? staffLinks
        : customerLinks;

  return (
    <aside className="w-64 bg-gradient-to-b from-slate-50 to-blue-50 border-r border-purple-200 p-4 flex flex-col h-full">
      <nav className="space-y-2 flex-1 overflow-y-auto">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all transform hover:scale-105 ${
                isActive
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold shadow-lg'
                  : 'text-gray-700 hover:bg-white/70 hover:shadow-md'
              }`
            }
          >
            <link.icon size={22} />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {onLogout && (
        <button
          type="button"
          onClick={onLogout}
          className="mt-4 flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 font-semibold transition-all"
        >
          <LogOut size={22} />
          <span>Sign out</span>
        </button>
      )}
    </aside>
  );
}
