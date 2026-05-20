import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

export function MainLayout() {
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Only show for authenticated users */}
      {user && <Sidebar />}
      
      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col ${user ? 'ml-64' : ''}`}>
        {/* Navbar - Only show for authenticated users */}
        {user && <Navbar />}
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
