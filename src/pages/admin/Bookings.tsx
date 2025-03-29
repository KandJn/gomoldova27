import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../lib/store';
import {
  Search,
  X,
  Filter,
  Eye,
  Clock,
  Check,
  Ban,
  Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

export const AdminBookings: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, accepted, rejected, cancelled
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    checkAdminAccess();
    if (user?.email === 'asassin.damian@gmail.com') {
      fetchBookings();
    }
  }, [user, filter]);

  const checkAdminAccess = () => {
    if (user?.email !== 'asassin.damian@gmail.com') {
      toast.error('Acces neautorizat');
      navigate('/');
      return;
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('bookings')
        .select(`
          *,
          trip:trips(
            id,
            from_city,
            to_city,
            departure_date,
            departure_time,
            price,
            driver:profiles!trips_driver_id_fkey(
              id,
              full_name,
              avatar_url
            ),
            company:bus_companies!trips_company_id_fkey(
              id,
              company_name,
              logo_url
            )
          ),
          passenger:profiles!bookings_user_id_fkey(
            id,
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Eroare la încărcarea rezervărilor');
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        booking.trip?.from_city.toLowerCase().includes(query) ||
        booking.trip?.to_city.toLowerCase().includes(query) ||
        booking.passenger?.full_name.toLowerCase().includes(query) ||
        booking.trip?.driver?.full_name.toLowerCase().includes(query) ||
        booking.trip?.company?.company_name?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            În așteptare
          </span>
        );
      case 'accepted':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Check className="h-3 w-3 mr-1" />
            Acceptată
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <Ban className="h-3 w-3 mr-1" />
            Respinsă
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <X className="h-3 w-3 mr-1" />
            Anulată
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Gestionare rezervări
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Administrați și monitorizați rezervările
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Căutare rezervare..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center px-4 py-2 border rounded-lg bg-white hover:bg-gray-50"
              >
                <Filter className="h-5 w-5 mr-2" />
                Filtrează
              </button>
              
              {isFilterOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 py-1">
                  <button
                    onClick={() => {
                      setFilter('all');
                      setIsFilterOpen(false);
                    }}
                    className={`block px-4 py-2 text-sm w-full text-left ${
                      filter === 'all' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Toate rezervările
                  </button>
                  <button
                    onClick={() => {
                      setFilter('pending');
                      setIsFilterOpen(false);
                    }}
                    className={`block px-4 py-2 text-sm w-full text-left ${
                      filter === 'pending' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    În așteptare
                  </button>
                  <button
                    onClick={() => {
                      setFilter('accepted');
                      setIsFilterOpen(false);
                    }}
                    className={`block px-4 py-2 text-sm w-full text-left ${
                      filter === 'accepted' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Acceptate
                  </button>
                  <button
                    onClick={() => {
                      setFilter('rejected');
                      setIsFilterOpen(false);
                    }}
                    className={`block px-4 py-2 text-sm w-full text-left ${
                      filter === 'rejected' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Respinse
                  </button>
                  <button
                    onClick={() => {
                      setFilter('cancelled');
                      setIsFilterOpen(false);
                    }}
                    className={`block px-4 py-2 text-sm w-full text-left ${
                      filter === 'cancelled' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Anulate
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nu am găsit rezervări
            </h3>
            <p className="text-gray-600">
              {searchQuery
                ? 'Nu am găsit rezervări care să corespundă criteriilor de căutare.'
                : 'Nu există rezervări în această categorie.'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pasager
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Călătorie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Șofer/Companie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acțiuni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full"
                            src={booking.passenger?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(booking.passenger?.full_name || '')}`}
                            alt=""
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {booking.passenger?.full_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.seats} {booking.seats === 1 ? 'loc' : 'locuri'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {booking.trip?.from_city} → {booking.trip?.to_city}
                      </div>
                      <div className="text-sm text-gray-500">
                        {format(new Date(booking.trip?.departure_date), 'PPP', { locale: ro })}
                        {' '}
                        {booking.trip?.departure_time}
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {(booking.total_price || 0).toFixed(2)} MDL
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          {booking.trip?.company ? (
                            <img
                              className="h-8 w-8 rounded-full"
                              src={booking.trip.company?.logo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(booking.trip.company?.company_name || '')}`}
                              alt=""
                            />
                          ) : (
                            <img
                              className="h-8 w-8 rounded-full"
                              src={booking.trip?.driver?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(booking.trip?.driver?.full_name || '')}`}
                              alt=""
                            />
                          )}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {booking.trip?.company ? booking.trip.company.company_name : booking.trip?.driver?.full_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.trip?.company ? 'Companie de transport' : 'Șofer personal'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(booking.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => navigate(`/trip/${booking.trip?.id}`)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}; 