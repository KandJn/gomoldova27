import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../lib/store';
import {
  Users,
  Car,
  FileCheck,
  AlertTriangle,
  TrendingUp,
  Clock,
  ChevronRight,
  Search,
  Bus,
  Bug
} from 'lucide-react';
import toast from 'react-hot-toast';

export function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTrips: 0,
    pendingVerifications: 0,
    activeTrips: 0,
    totalBookings: 0,
    completionRate: 0,
    pendingBusCompanies: 0
  });
  const [recentVerifications, setRecentVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    if (user.email === 'asassin.damian@gmail.com') {
      fetchDashboardData();
    } else {
      navigate('/');
    }
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      console.log('Starting to fetch dashboard data...');
      
      // Initialize stats with default values
      let dashboardStats = {
        totalUsers: 0,
        totalTrips: 0,
        pendingVerifications: 0,
        activeTrips: 0,
        totalBookings: 0,
        completionRate: 0,
        pendingBusCompanies: 0
      };

      // Check if tables exist
      console.log('Checking if required tables exist...');
      try {
        console.log('Checking tables individually...');
        const checkTable = async (tableName) => {
          try {
            const { count, error } = await supabase.from(tableName).select('*', { count: 'exact', head: true });
            console.log(`Table ${tableName} exists:`, error ? 'No (Error: ' + error.message + ')' : 'Yes');
            return !error;
          } catch (e) {
            console.log(`Table ${tableName} exists: No (Exception: ${e.message})`);
            return false;
          }
        };
        
        await checkTable('profiles');
        await checkTable('trips');
        await checkTable('verifications');
        await checkTable('bookings');
        await checkTable('bus_companies');
        await checkTable('bus_company_registrations');
      } catch (error) {
        console.error('Error checking tables:', error);
      }

      // Fetch basic stats
      try {
        console.log('Fetching profiles...');
        try {
          const { count: usersCount, error: profilesError } = await supabase.from('profiles').select('*', { count: 'exact' });
          if (profilesError) console.error('Profiles error:', profilesError);
          else {
            console.log('Profiles count:', usersCount);
            dashboardStats.totalUsers = usersCount || 0;
          }
        } catch (e) {
          console.error('Failed to fetch profiles:', e);
        }

        console.log('Fetching trips...');
        try {
          const { count: tripsCount, error: tripsError } = await supabase.from('trips').select('*', { count: 'exact' });
          if (tripsError) console.error('Trips error:', tripsError);
          else {
            console.log('Trips count:', tripsCount);
            dashboardStats.totalTrips = tripsCount || 0;
          }
        } catch (e) {
          console.error('Failed to fetch trips:', e);
        }

        console.log('Fetching verifications...');
        try {
          const { count: pendingCount, error: verificationsError } = await supabase.from('verifications').select('*', { count: 'exact' }).eq('status', 'pending');
          if (verificationsError) console.error('Verifications error:', verificationsError);
          else {
            console.log('Pending verifications count:', pendingCount);
            dashboardStats.pendingVerifications = pendingCount || 0;
          }
        } catch (e) {
          console.error('Failed to fetch verifications:', e);
        }

        console.log('Fetching active trips...');
        try {
          const { count: activeTripsCount, error: activeTripsError } = await supabase.from('trips').select('*', { count: 'exact' }).gte('departure_date', new Date().toISOString());
          if (activeTripsError) console.error('Active trips error:', activeTripsError);
          else {
            console.log('Active trips count:', activeTripsCount);
            dashboardStats.activeTrips = activeTripsCount || 0;
          }
        } catch (e) {
          console.error('Failed to fetch active trips:', e);
        }

        console.log('Fetching bookings...');
        try {
          const { count: bookingsCount, error: bookingsError } = await supabase.from('bookings').select('*', { count: 'exact' });
          if (bookingsError) console.error('Bookings error:', bookingsError);
          else {
            console.log('Bookings count:', bookingsCount);
            dashboardStats.totalBookings = bookingsCount || 0;
          }
        } catch (e) {
          console.error('Failed to fetch bookings:', e);
        }

        console.log('Fetching bus companies...');
        try {
          const { count: busCompaniesCount, error: busCompaniesError } = await supabase.from('bus_companies').select('*', { count: 'exact', head: true }).eq('status', 'pending');
          if (busCompaniesError) console.error('Bus companies error:', busCompaniesError);
          else {
            console.log('Pending bus companies count:', busCompaniesCount);
            dashboardStats.pendingBusCompanies = busCompaniesCount || 0;
          }
        } catch (e) {
          console.error('Failed to fetch bus companies:', e);
        }

        // Calculate completion rate
        console.log('Calculating completion rate...');
        try {
          const { data: completedTrips, error: completedTripsError } = await supabase
            .from('trips')
            .select('*', { count: 'exact' })
            .lt('departure_date', new Date().toISOString());
          
          if (completedTripsError) console.error('Completed trips error:', completedTripsError);
          else {
            const completionRate = dashboardStats.totalTrips ? (completedTrips?.length || 0) / dashboardStats.totalTrips * 100 : 0;
            console.log('Completion rate:', completionRate);
            dashboardStats.completionRate = completionRate;
          }
        } catch (e) {
          console.error('Failed to calculate completion rate:', e);
        }

        setStats(dashboardStats);
      } catch (statsError) {
        console.error('Error fetching stats:', statsError);
      }

      // Fetch recent verifications
      console.log('Fetching recent verifications...');
      try {
        try {
          const { data: verifications, error: verificationError } = await supabase
            .from('verifications')
            .select(`
              *,
              user:profiles(*)
            `)
            .order('created_at', { ascending: false })
            .limit(5);

          if (verificationError) {
            console.error('Verification error:', verificationError);
            // Continue with empty array instead of throwing
            setRecentVerifications([]);
          } else {
            console.log('Recent verifications:', verifications?.length || 0);
            setRecentVerifications(verifications || []);
          }
        } catch (innerError) {
          console.error('Exception fetching verifications:', innerError);
          setRecentVerifications([]);
        }
      } catch (verificationError) {
        console.error('Error fetching verifications:', verificationError);
        setRecentVerifications([]);
      }
    } catch (error) {
      console.error('General error fetching dashboard data:', error);
      toast.error('Eroare la încărcarea datelor');
    } finally {
      console.log('Finished fetching dashboard data');
      setLoading(false);
    }
  };

  const runDebugTests = async () => {
    setDebugInfo("Running tests...");
    const info: any = {
      tables: {},
      user: user,
      timestamp: new Date().toISOString(),
      stats: stats
    };

    // Check tables
    const tablesToCheck = ['profiles', 'trips', 'verifications', 'bookings', 'bus_companies', 'bus_company_registrations', 'messages'];
    
    for (const table of tablesToCheck) {
      try {
        const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
        info.tables[table] = { exists: !error, error: error ? error.message : null, count };
        
        // If verifications table doesn't exist, show SQL to create it
        if (table === 'verifications' && error) {
          info.tables[table].createSQL = `
-- SQL to create verifications table
CREATE TABLE IF NOT EXISTS verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR NOT NULL CHECK (type IN ('id', 'email', 'phone')),
  data JSONB,
  status VARCHAR NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_verifications_user_id ON verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_verifications_status ON verifications(status);

-- Add RLS policies
ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own verifications
CREATE POLICY "Users can view their own verifications"
ON verifications FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Admin can view all verifications
CREATE POLICY "Admin can view all verifications"
ON verifications FOR SELECT
TO authenticated
USING (auth.jwt() ->> 'email' = 'asassin.damian@gmail.com');

-- Admin can manage verifications
CREATE POLICY "Admin can manage verifications"
ON verifications FOR ALL
TO authenticated
USING (auth.jwt() ->> 'email' = 'asassin.damian@gmail.com');
          `;
        }
      } catch (e) {
        info.tables[table] = { exists: false, error: e.message };
      }
    }

    // Check auth
    try {
      const { data, error } = await supabase.auth.getSession();
      info.auth = { session: !!data.session, error: error ? error.message : null };
    } catch (e) {
      info.auth = { session: false, error: e.message };
    }

    setDebugInfo(info);
  };

  if (!user || user.email !== 'asassin.damian@gmail.com') {
    return null;
  }

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
              Panou de administrare
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Bine ați venit în panoul de administrare
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Căutare..."
                className="w-64 pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <button
              onClick={() => navigate('/admin/settings')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Setări
            </button>
            <button
              onClick={() => {
                runDebugTests();
                setShowDebug(!showDebug);
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center"
            >
              <Bug className="h-4 w-4 mr-1" />
              Debug
            </button>
          </div>
        </div>

        {showDebug && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8 overflow-auto">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Debug Information</h2>
            {debugInfo ? (
              <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto max-h-96">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            ) : (
              <p>Loading debug information...</p>
            )}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
            <div className="mt-4">
              <button
                onClick={() => navigate('/admin/users')}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center font-medium"
              >
                Vezi toți utilizatorii
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
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
            <div className="mt-4">
              <button
                onClick={() => navigate('/admin/trips')}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center font-medium"
              >
                Vezi toate călătoriile
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Verificări în așteptare
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.pendingVerifications}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <FileCheck className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={() => navigate('/admin/verifications')}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center font-medium"
              >
                Vezi toate verificările
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
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
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={() => navigate('/admin/analytics')}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center font-medium"
              >
                Vezi statistici detaliate
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total rezervări
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalBookings}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={() => navigate('/admin/bookings')}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center font-medium"
              >
                Vezi toate rezervările
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Companii de transport în așteptare
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.pendingBusCompanies}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Bus className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={() => navigate('/admin/bus-companies')}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center font-medium"
              >
                Vezi toate companiile
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Alerte sistem
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  0
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={() => navigate('/admin/alerts')}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center font-medium"
              >
                Vezi toate alertele
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Recent Verifications */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Verificări recente
            </h2>
            <button
              onClick={() => navigate('/admin/verifications')}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Vezi toate
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilizator
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tip
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acțiuni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentVerifications.map((verification) => (
                  <tr key={verification.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full"
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(verification.user?.full_name || verification.user?.email || 'User')}`}
                            alt=""
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {verification.user?.full_name || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {verification.user?.email || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {verification.type === 'id' ? 'Act de identitate' :
                         verification.type === 'email' ? 'Email' : 'Telefon'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        verification.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : verification.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {verification.status === 'pending' ? 'În așteptare' :
                         verification.status === 'approved' ? 'Aprobat' : 'Respins'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(verification.created_at).toLocaleDateString('ro-RO')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => navigate(`/admin/verifications/${verification.id}`)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Vezi detalii
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}