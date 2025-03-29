import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../lib/store';
import { supabase } from '../../lib/supabase';
import { Search, Filter, Check, X, Calendar, Clock, MapPin, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

export const BusCompanyBookings: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);
  const [filter, setFilter] = useState('all'); // all, pending, confirmed, cancelled
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [user, filter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      
      if (!user) return;

      const { data: busCompany } = await supabase
        .from('bus_companies')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!busCompany) {
        toast.error('Nu s-a găsit compania de transport');
        return;
      }

      const { data: bookingsData, error } = await supabase
        .from('bookings')
        .select(`
          *,
          trip:trips(
            id,
            from_city,
            to_city,
            departure_date,
            departure_time
          ),
          user:users(
            id,
            full_name,
            email,
            phone
          )
        `)
        .eq('bus_company_id', busCompany.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setBookings(bookingsData || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Eroare la încărcarea rezervărilor');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;

      setBookings(bookings.map(booking =>
        booking.id === bookingId ? { ...booking, status: newStatus } : booking
      ));

      toast.success(
        newStatus === 'confirmed'
          ? 'Rezervare confirmată cu succes'
          : 'Rezervare anulată'
      );
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error('Eroare la actualizarea rezervării');
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter !== 'all' && booking.status !== filter) {
      return false;
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        booking.user.full_name.toLowerCase().includes(query) ||
        booking.user.email.toLowerCase().includes(query) ||
        booking.trip.from_city.toLowerCase().includes(query) ||
        booking.trip.to_city.toLowerCase().includes(query)
      );
    }

    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Gestionare Rezervări</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Caută rezervare..."
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
                    setFilter('confirmed');
                    setIsFilterOpen(false);
                  }}
                  className={`block px-4 py-2 text-sm w-full text-left ${
                    filter === 'confirmed' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Confirmate
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

      {filteredBookings.length === 0 ? (
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
        <div className="space-y-6">
          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-lg shadow-sm overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-gray-900">
                      Rezervare #{booking.id.slice(0, 8)}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      booking.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : booking.status === 'confirmed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {booking.status === 'pending'
                        ? 'În așteptare'
                        : booking.status === 'confirmed'
                        ? 'Confirmată'
                        : 'Anulată'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {format(new Date(booking.created_at), 'PPp', { locale: ro })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">
                      Detalii călătorie
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-gray-900">
                          {booking.trip.from_city} → {booking.trip.to_city}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-gray-900">
                          {format(new Date(booking.trip.departure_date), 'PPP', { locale: ro })}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-gray-900">
                          {booking.trip.departure_time}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">
                      Detalii pasager
                    </h4>
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <img
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(booking.user.full_name)}&background=random`}
                          alt=""
                          className="h-10 w-10 rounded-full"
                        />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {booking.user.full_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {booking.user.email}
                        </p>
                        {booking.user.phone && (
                          <p className="text-sm text-gray-500">
                            {booking.user.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {booking.status === 'pending' && (
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      onClick={() => handleStatusChange(booking.id, 'cancelled')}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Anulează
                    </button>
                    <button
                      onClick={() => handleStatusChange(booking.id, 'confirmed')}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Confirmă
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 