import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../lib/store';
import {
  TrendingUp,
  Users,
  Car,
  Calendar,
  ArrowUp,
  ArrowDown,
  DollarSign,
  MapPin,
  Clock,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';

export function Analytics() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsers: 0,
    userGrowth: 0,
    totalTrips: 0,
    activeTrips: 0,
    tripGrowth: 0,
    totalBookings: 0,
    completionRate: 0,
    averagePrice: 0,
    popularRoutes: [],
    peakHours: [],
    userTypes: { drivers: 0, passengers: 0 }
  });

  useEffect(() => {
    checkAdminAccess();
    if (user?.email === 'asassin.damian@gmail.com') {
      fetchAnalytics();
    }
  }, [user]);

  const checkAdminAccess = () => {
    if (user?.email !== 'asassin.damian@gmail.com') {
      toast.error('Acces neautorizat');
      navigate('/');
      return;
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch total users and growth
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('created_at');

      if (usersError) throw usersError;

      const now = new Date();
      const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
      
      const totalUsers = usersData?.length || 0;
      const newUsers = usersData?.filter(u => 
        new Date(u.created_at) > thirtyDaysAgo
      ).length || 0;
      const userGrowth = totalUsers ? (newUsers / totalUsers) * 100 : 0;

      // Fetch drivers count
      const { count: driversCount } = await supabase
        .from('trips')
        .select('driver_id', { count: 'exact', head: true })
        .not('driver_id', 'is', null);
      
      const drivers = driversCount || 0;
      const passengers = totalUsers - drivers;

      // Fetch trips data
      const { data: tripsData, error: tripsError } = await supabase
        .from('trips')
        .select(`
          *,
          bookings(
            status
          )
        `);

      if (tripsError) throw tripsError;

      const totalTrips = tripsData?.length || 0;
      const activeTrips = tripsData?.filter(t => 
        new Date(t.departure_date) >= new Date()
      ).length || 0;

      const completedTrips = tripsData?.filter(t => 
        new Date(t.departure_date) < new Date()
      ).length || 0;

      const completionRate = totalTrips ? (completedTrips / totalTrips) * 100 : 0;

      // Calculate average price
      const totalPrice = tripsData?.reduce((sum, trip) => sum + trip.price, 0) || 0;
      const averagePrice = totalTrips ? totalPrice / totalTrips : 0;

      // Calculate popular routes
      const routes = tripsData?.reduce((acc: any, trip) => {
        const route = `${trip.from_city} → ${trip.to_city}`;
        acc[route] = (acc[route] || 0) + 1;
        return acc;
      }, {});

      const popularRoutes = Object.entries(routes || {})
        .sort(([, a]: any, [, b]: any) => b - a)
        .slice(0, 5)
        .map(([route, count]: any) => ({ route, count }));

      // Calculate peak hours
      const hours = tripsData?.reduce((acc: any, trip) => {
        if (!trip.departure_time) return acc;
        const hour = trip.departure_time.split(':')[0];
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      }, {});

      const peakHours = Object.entries(hours || {})
        .sort(([, a]: any, [, b]: any) => b - a)
        .slice(0, 5)
        .map(([hour, count]: any) => ({ 
          hour: `${hour}:00`, 
          count 
        }));

      setStats({
        totalUsers,
        newUsers,
        userGrowth,
        totalTrips,
        activeTrips,
        tripGrowth: activeTrips ? (activeTrips / totalTrips) * 100 : 0,
        totalBookings: tripsData?.reduce((sum, trip) => 
          sum + (trip.bookings?.filter((b: any) => b.status === 'accepted').length || 0), 0
        ) || 0,
        completionRate,
        averagePrice,
        popularRoutes,
        peakHours,
        userTypes: {
          drivers,
          passengers
        }
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Eroare la încărcarea statisticilor');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Statistici și analiză
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Vizualizați statisticile și performanța platformei
            </p>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Utilizatori totali
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalUsers}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {stats.userGrowth > 0 ? (
                <ArrowUp className="h-4 w-4 text-green-500" />
              ) : (
                <ArrowDown className="h-4 w-4 text-red-500" />
              )}
              <span className={`text-sm ${
                stats.userGrowth > 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {Math.abs(stats.userGrowth).toFixed(1)}% în ultima lună
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Călătorii active
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.activeTrips}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Car className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <Calendar className="h-4 w-4 text-gray-400 mr-1" />
              <span className="text-sm text-gray-500">
                Din {stats.totalTrips} total
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Rata de finalizare
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.completionRate.toFixed(1)}%
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <Check className="h-4 w-4 text-gray-400 mr-1" />
              <span className="text-sm text-gray-500">
                {stats.totalBookings} rezervări acceptate
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Preț mediu
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.averagePrice.toFixed(0)} MDL
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <Car className="h-4 w-4 text-gray-400 mr-1" />
              <span className="text-sm text-gray-500">
                Per călătorie
              </span>
            </div>
          </div>
        </div>

        {/* User Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Distribuția utilizatorilor
            </h2>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                    Șoferi
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-blue-600">
                    {((stats.userTypes.drivers / stats.totalUsers) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                <div
                  style={{ width: `${(stats.userTypes.drivers / stats.totalUsers) * 100}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                ></div>
              </div>
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
                    Pasageri
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-green-600">
                    {((stats.userTypes.passengers / stats.totalUsers) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-200">
                <div
                  style={{ width: `${(stats.userTypes.passengers / stats.totalUsers) * 100}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                ></div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {stats.userTypes.drivers}
                </p>
                <p className="text-sm text-gray-500">Șoferi înregistrați</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {stats.userTypes.passengers}
                </p>
                <p className="text-sm text-gray-500">Pasageri înregistrați</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Ore de vârf
            </h2>
            <div className="space-y-4">
              {stats.peakHours.map((hour, index) => (
                <div key={hour.hour} className="flex items-center">
                  <div className="w-16 text-sm text-gray-600">
                    {hour.hour}
                  </div>
                  <div className="flex-1 ml-4">
                    <div className="relative pt-1">
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-blue-200">
                        <div
                          style={{ 
                            width: `${(hour.count / stats.peakHours[0].count) * 100}%`
                          }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="w-16 text-right text-sm text-gray-600">
                    {hour.count} călătorii
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Popular Routes */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Rute populare
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.popularRoutes.map((route: any) => (
              <div
                key={route.route}
                className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="font-medium text-gray-900">
                      {route.route}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {route.count} călătorii
                  </span>
                </div>
                <div className="relative pt-1">
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-blue-200">
                    <div
                      style={{ 
                        width: `${(route.count / stats.popularRoutes[0].count) * 100}%`
                      }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}