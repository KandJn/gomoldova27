import React, { useState } from 'react';
import { Link, useMatch, Outlet } from 'react-router-dom';
import { Users, BarChart2, Settings, FileText, Bus, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface AdminLayoutProps {
  children?: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems = [
    { path: '/admin', icon: BarChart2, label: 'Dashboard' },
    { path: '/admin/users', icon: Users, label: 'Users' },
    { path: '/admin/bus-companies', icon: Bus, label: 'Bus Companies' },
    { path: '/admin/bookings', icon: Calendar, label: 'Bookings' },
    { path: '/admin/reports', icon: FileText, label: 'Reports' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside 
        className={`bg-white shadow-lg z-10 ${
          isSidebarOpen ? 'w-64' : 'w-16'
        }`}
      >
        <div className="sticky top-0 flex flex-col h-screen">
          <div className="flex items-center h-16 px-4 border-b border-gray-200 justify-between">
            {isSidebarOpen && <span className="text-xl font-semibold text-gray-800">Admin Panel</span>}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1 rounded-full hover:bg-gray-100 focus:outline-none"
            >
              {isSidebarOpen ? (
                <ChevronLeft className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-500" />
              )}
            </button>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = !!useMatch(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  title={!isSidebarOpen ? item.label : undefined}
                >
                  <Icon
                    className={`${isSidebarOpen ? 'mr-3' : 'mx-auto'} h-5 w-5 ${
                      isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {isSidebarOpen && item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <main className={`flex-1 transition-all duration-300 ease-in-out`}>
        <div className="py-6">
          <div className="mx-auto px-4 sm:px-6 md:px-8">
            {children || <Outlet />}
          </div>
        </div>
      </main>
    </div>
  );
}; 