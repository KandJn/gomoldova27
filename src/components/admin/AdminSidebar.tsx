import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Car,
  FileCheck,
  BarChart2,
  Settings,
  AlertTriangle,
  Bus
} from 'lucide-react';

export const AdminSidebar = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navigationItems = [
    {
      name: 'Dashboard',
      path: '/admin',
      icon: LayoutDashboard
    },
    {
      name: 'Utilizatori',
      path: '/admin/users',
      icon: Users
    },
    {
      name: 'Călătorii',
      path: '/admin/trips',
      icon: Car
    },
    {
      name: 'Verificări',
      path: '/admin/verifications',
      icon: FileCheck
    },
    {
      name: 'Companii de transport',
      path: '/admin/bus-companies',
      icon: Bus
    },
    {
      name: 'Rapoarte',
      path: '/admin/reports',
      icon: AlertTriangle
    },
    {
      name: 'Analiză',
      path: '/admin/analytics',
      icon: BarChart2
    },
    {
      name: 'Setări',
      path: '/admin/settings',
      icon: Settings
    }
  ];

  return (
    <div className="w-64 bg-white h-screen fixed left-0 top-0 shadow-sm">
      <div className="p-4">
        <Link to="/admin" className="flex items-center space-x-2 mb-8">
          <Bus className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold text-gray-900">Admin Panel</span>
        </Link>

        <nav className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}; 