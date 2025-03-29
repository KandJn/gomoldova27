import React from 'react';
import { Link, useMatch } from 'react-router-dom';
import { Bus, Calendar, Users, BarChart2, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '../../lib/store';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface BusCompanyLayoutProps {
  children: React.ReactNode;
}

export const BusCompanyLayout: React.FC<BusCompanyLayoutProps> = ({ children }) => {
  const { setUser } = useAuthStore();

  const menuItems = [
    { path: '/bus-company', icon: BarChart2, label: 'Dashboard' },
    { path: '/bus-company/buses', icon: Bus, label: 'Manage Buses' },
    { path: '/bus-company/trips', icon: Calendar, label: 'Manage Trips' },
    { path: '/bus-company/bookings', icon: Users, label: 'Bookings' },
    { path: '/bus-company/settings', icon: Settings, label: 'Settings' },
  ];

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Error logging out');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-blue-50">
      <div className="flex h-full">
        {/* Sidebar */}
        <aside className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl backdrop-blur-lg bg-opacity-80 border-r border-gray-200/50">
          <div className="flex flex-col h-full">
            <div className="flex items-center h-16 px-6 border-b border-gray-200/50 bg-gradient-to-r from-blue-600 to-blue-700">
              <Link to="/bus-company" className="flex items-center space-x-3 group">
                <Bus className="h-6 w-6 text-white transform transition-transform group-hover:scale-110" />
                <span className="text-lg font-semibold text-white">Bus Company</span>
              </Link>
            </div>
            
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = !!useMatch(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30'
                        : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                    }`}
                  >
                    <Icon
                      className={`mr-3 h-5 w-5 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-white' : 'text-gray-400 group-hover:text-blue-500'
                      }`}
                    />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-gray-200/50">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-600 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
              >
                <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-red-500 transition-transform group-hover:scale-110" />
                Logout
              </button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 ml-64">
          <div className="min-h-screen py-8">
            <div className="max-w-7xl mx-auto px-6 sm:px-8">
              {/* Page header with gradient line */}
              <div className="relative pb-8 mb-8">
                <div className="h-0.5 absolute bottom-0 left-0 right-0 bg-gradient-to-r from-blue-500 via-blue-600 to-transparent"></div>
              </div>
              
              {/* Page content */}
              <div className="bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl p-8 border border-gray-200/50">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}; 