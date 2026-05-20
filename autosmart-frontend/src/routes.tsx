import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RootLayout } from './layouts/RootLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AdminDashboard } from './pages/AdminDashboard';
import { StaffDashboard } from './pages/StaffDashboard';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { Customers } from './pages/Customers';
import { Vehicles } from './pages/Vehicles';
import { Parts } from './pages/Parts';
import { Vendors } from './pages/Vendors';
import { Sales } from './pages/Sales';
import { Reports } from './pages/Reports';
import { Notifications } from './pages/Notifications';
import { Appointments } from './pages/Appointments';
import { Reviews } from './pages/Reviews';
import { PartRequests } from './pages/PartRequests';
import { Staff } from './pages/Staff';
import { PurchaseInvoices } from './pages/PurchaseInvoices';
import { Profile } from './pages/Profile';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      { index: true, element: <Navigate to="/login" replace /> },
      { path: 'login', Component: Login },
      { path: 'register', Component: Register },
      {
        path: 'dashboard',
        Component: DashboardLayout,
        children: [
          { index: true, element: <Navigate to="admin" replace /> },
          { path: 'admin', Component: AdminDashboard },
          { path: 'staff', Component: StaffDashboard },
          { path: 'customer', Component: CustomerDashboard },
        ],
      },
      { path: 'staff', Component: DashboardLayout, children: [{ index: true, Component: Staff }] },
      { path: 'customers', Component: DashboardLayout, children: [{ index: true, Component: Customers }] },
      { path: 'vehicles', Component: DashboardLayout, children: [{ index: true, Component: Vehicles }] },
      { path: 'parts', Component: DashboardLayout, children: [{ index: true, Component: Parts }] },
      { path: 'vendors', Component: DashboardLayout, children: [{ index: true, Component: Vendors }] },
      { path: 'purchase-invoices', Component: DashboardLayout, children: [{ index: true, Component: PurchaseInvoices }] },
      { path: 'sales', Component: DashboardLayout, children: [{ index: true, Component: Sales }] },
      { path: 'reports', Component: DashboardLayout, children: [{ index: true, Component: Reports }] },
      { path: 'notifications', Component: DashboardLayout, children: [{ index: true, Component: Notifications }] },
      { path: 'appointments', Component: DashboardLayout, children: [{ index: true, Component: Appointments }] },
      { path: 'reviews', Component: DashboardLayout, children: [{ index: true, Component: Reviews }] },
      { path: 'part-requests', Component: DashboardLayout, children: [{ index: true, Component: PartRequests }] },
      { path: 'profile', Component: DashboardLayout, children: [{ index: true, Component: Profile }] },
    ],
  },
]);
