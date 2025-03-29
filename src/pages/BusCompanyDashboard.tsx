import React from 'react';

export function BusCompanyDashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Company Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Trips Overview</h2>
          <p className="text-gray-600">Manage your bus trips and schedules</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Bookings</h2>
          <p className="text-gray-600">View and manage booking requests</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Company Profile</h2>
          <p className="text-gray-600">Update your company information</p>
        </div>
      </div>
    </div>
  );
} 