import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bus, Clock, Users, Calendar, TrendingUp, CreditCard, Activity, ArrowUpRight, Plus, LucideIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../lib/store';
import toast from 'react-hot-toast';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  trend?: string;
}

export const BusCompanyDashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    totalBuses: 0,
    activeTrips: 0,
    totalPassengers: 0,
    upcomingTrips: 0,
    completedTrips: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    if (user) {
      fetchDashboardStats();
      
      // Set up real-time subscriptions
      const busesSubscription = supabase
        .channel('buses-changes')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'buses',
            filter: `company_id=eq.${user.id}`
          }, 
          () => {
            console.log('Buses changed, refreshing stats...');
            fetchDashboardStats();
          }
        )
        .subscribe();

      const tripsSubscription = supabase
        .channel('trips-changes')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'trips',
            filter: `company_id=eq.${user.id}`
          }, 
          () => {
            console.log('Trips changed, refreshing stats...');
            fetchDashboardStats();
          }
        )
        .subscribe();

      const bookingsSubscription = supabase
        .channel('bookings-changes')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'bookings',
            filter: `company_id=eq.${user.id}`
          }, 
          () => {
            console.log('Bookings changed, refreshing stats...');
            fetchDashboardStats();
          }
        )
        .subscribe();

      // Cleanup subscriptions
      return () => {
        busesSubscription.unsubscribe();
        tripsSubscription.unsubscribe();
        bookingsSubscription.unsubscribe();
      };
    }
  }, [user]);

  const fetchDashboardStats = async () => {
    try {
      const now = new Date().toISOString();

      // Fetch all stats in parallel for better performance
      const [
        { data: buses, error: busesError },
        { data: activeTrips, error: activeTripsError },
        { data: upcomingTrips, error: upcomingTripsError },
        { data: completedTrips, error: completedTripsError },
        { data: bookings, error: bookingsError }
      ] = await Promise.all([
        // Fetch buses
        supabase
          .from('buses')
          .select('id')
          .eq('company_id', user?.id),
        
        // Fetch active trips
        supabase
          .from('trips')
          .select('id')
          .eq('company_id', user?.id)
          .eq('status', 'active'),
        
        // Fetch upcoming trips
        supabase
          .from('trips')
          .select('id')
          .eq('company_id', user?.id)
          .gt('departure_date', now)
          .eq('status', 'scheduled'),
        
        // Fetch completed trips
        supabase
          .from('trips')
          .select('id')
          .eq('company_id', user?.id)
          .eq('status', 'completed'),
        
        // Fetch bookings
        supabase
          .from('bookings')
          .select('seats, total_price')
          .eq('company_id', user?.id)
      ]);

      // Check for errors
      if (busesError || activeTripsError || upcomingTripsError || completedTripsError || bookingsError) {
        throw new Error('Error fetching dashboard stats');
      }

      const totalPassengers = bookings?.reduce((acc, booking) => acc + booking.seats, 0) || 0;
      const totalRevenue = bookings?.reduce((acc, booking) => acc + booking.total_price, 0) || 0;

      setStats({
        totalBuses: buses?.length || 0,
        activeTrips: activeTrips?.length || 0,
        totalPassengers: totalPassengers,
        upcomingTrips: upcomingTrips?.length || 0,
        completedTrips: completedTrips?.length || 0,
        totalRevenue: totalRevenue
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Failed to update dashboard stats');
    }
  };

  const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, bgColor, trend }) => (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${bgColor}`}>
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
          {trend && (
            <div className="flex items-center text-emerald-500 text-sm font-medium">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              {trend}
            </div>
          )}
        </div>
        <h3 className="text-gray-500 text-sm font-medium mb-2">{title}</h3>
        <div className="flex items-end justify-between">
          <div className="text-2xl font-bold text-gray-900">{value}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Bus Company Dashboard</h1>
        <div className="flex gap-3">
          <Link
            to="/bus-company/trips/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create New Trip
          </Link>
          <Link
            to="/bus-company/buses/new"
            className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add New Bus
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon={CreditCard}
          color="text-emerald-600"
          bgColor="bg-emerald-100"
          trend="+12.5%"
        />
        <StatCard
          title="Total Buses"
          value={stats.totalBuses}
          icon={Bus}
          color="text-blue-600"
          bgColor="bg-blue-100"
        />
        <StatCard
          title="Active Trips"
          value={stats.activeTrips}
          icon={Activity}
          color="text-indigo-600"
          bgColor="bg-indigo-100"
        />
        <StatCard
          title="Total Passengers"
          value={stats.totalPassengers}
          icon={Users}
          color="text-violet-600"
          bgColor="bg-violet-100"
          trend="+5.2%"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Manage Buses</h3>
            <Link
              to="/bus-company/buses"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              View All
            </Link>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center">
              <Bus className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">View and manage your bus fleet</p>
                <p className="text-xs text-gray-500 mt-1">{stats.totalBuses} buses in total</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Manage Trips</h3>
            <Link
              to="/bus-company/trips"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              View All
            </Link>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Schedule and manage your trips</p>
                <p className="text-xs text-gray-500 mt-1">{stats.upcomingTrips} upcoming trips</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">View Bookings</h3>
            <Link
              to="/bus-company/bookings"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              View All
            </Link>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center">
              <Users className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Manage passenger bookings</p>
                <p className="text-xs text-gray-500 mt-1">{stats.totalPassengers} total passengers</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 