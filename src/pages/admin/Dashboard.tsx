import React from 'react';
import { useNavigate, Link, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { 
  BookOpen, Target, Users, Settings, LogOut,
  BarChart3, Shield, Database, MessageCircle
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { userData, signOut } = useAuthStore();

  if (userData?.role !== 'admin') {
    navigate('/');
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r">
        <div className="p-6">
          <h1 className="text-xl font-bold text-primary">Admin Dashboard</h1>
          {/* Debug Info */}
          <div className="mt-2 p-2 bg-gray-100 rounded-lg text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Shield size={14} />
              Role: <span className="font-mono">{userData?.role}</span>
            </div>
            <div className="text-xs text-gray-500 mt-1 break-all">
              UID: {userData?.id}
            </div>
          </div>
        </div>
        <nav className="px-4 space-y-1">
          <Link
            to="/admin"
            className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <BarChart3 size={20} />
            Overview
          </Link>
          <Link
            to="/admin/books"
            className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <BookOpen size={20} />
            Books
          </Link>
          <Link
            to="/admin/challenges"
            className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <Target size={20} />
            Challenges
          </Link>
          <Link
            to="/admin/affirmations"
            className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <MessageCircle size={20} />
            Affirmations
          </Link>
          <Link
            to="/admin/users"
            className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <Users size={20} />
            Users
          </Link>
          <Link
            to="/admin/settings"
            className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <Settings size={20} />
            Settings
          </Link>
          <Link
            to="/admin/storage-debug"
            className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <Database size={20} />
            Storage Debug
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50 w-full"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard;