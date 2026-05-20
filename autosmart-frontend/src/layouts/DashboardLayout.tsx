import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useAuth, getAuthUser } from '../context/AuthContext.tsx';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';

export function DashboardLayout() {
  const { user: contextUser, logout } = useAuth();
  const user = contextUser ?? getAuthUser();
  const navigate = useNavigate();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
      <Navbar user={user} onLogout={handleLogout} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar user={user} onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
