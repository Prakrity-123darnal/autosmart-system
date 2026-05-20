import { Bell, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type NavbarUser = {
  name: string;
  role: string;
};

interface NavbarProps {
  user: NavbarUser;
  onLogout: () => void;
}

export function Navbar({ user, onLogout }: NavbarProps) {
  const navigate = useNavigate();

  return (
    <nav className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white px-6 py-4 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
          <span className="text-white font-bold text-lg">AS</span>
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent">AutoSmart</h1>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/notifications')}
          className="p-2 hover:bg-white/20 rounded-xl transition-all relative group"
        >
          <Bell size={22} className="group-hover:animate-bounce" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse"></span>
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-white/30">
          <div className="text-right">
            <div className="text-sm font-semibold">{user?.name}</div>
            <div className="text-xs text-yellow-200 capitalize font-medium">{user?.role}</div>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
            <User size={18} />
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/25 border border-white/30 rounded-xl transition-all font-semibold text-sm"
            title="Sign out"
          >
            <LogOut size={18} />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
