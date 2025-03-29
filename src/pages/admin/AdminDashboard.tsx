import React from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../../contexts/NotificationsContext';

export const AdminDashboard: React.FC = () => {
  const { pendingRegistrations } = useNotifications();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          to="/admin/bus-companies"
          className="relative bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Bus Companies</h2>
          <p className="text-gray-600">Manage bus company registrations</p>
          {pendingRegistrations > 0 && (
            <span className="absolute top-4 right-4 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
              {pendingRegistrations} pending
            </span>
          )}
        </Link>

        {/* Add more admin sections as needed */}
      </div>
    </div>
  );
}; 