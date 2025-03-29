import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { Loader2, MapPin, Calendar, Clock, CreditCard, User, Car } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface Trip {
  id: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
  amount_paid: number;
  trip: {
    id: string;
    from_city: string;
    to_city: string;
    departure_date: string;
    departure_time: string;
    price: number;
    available_seats: number;
    driver: {
      full_name: string;
      avatar_url: string | null;
    };
    car: {
      brand: string;
      model: string;
      color: string;
      plate_number: string;
    };
  };
}

export function MyTrips() {
  const { user, profile } = useAuthStore();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const loadProfile = async () => {
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        if (profileData) {
          console.log('Profile loaded:', profileData);
          fetchTrips(profileData.id);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        setError('Eroare la încărcarea profilului');
        toast.error('Nu s-a putut încărca profilul');
      }
    };

    loadProfile();
  }, [user]);

  const fetchTrips = async (userId: string) => {
    try {
      setIsLoading(true);
      console.log('Fetching trips for user:', userId);
      
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          status,
          created_at,
          amount_paid,
          trip:trips (
            id,
            from_city,
            to_city,
            departure_date,
            departure_time,
            price,
            available_seats,
            driver:profiles (
              full_name,
              avatar_url
            ),
            car:cars (
              brand,
              model,
              color,
              plate_number
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }

      console.log('Raw data from query:', data);

      // Filter out any bookings with null trip data
      const validTrips = (data || []).filter(booking => {
        if (!booking.trip) {
          console.log('Booking without trip data:', booking);
          return false;
        }
        return true;
      });

      console.log('Filtered valid trips:', validTrips);
      setTrips(validTrips);
    } catch (error) {
      console.error('Error fetching trips:', error);
      setError('Eroare la încărcarea călătoriilor');
      toast.error('Nu s-au putut încărca călătoriile');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: Trip['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Trip['status']) => {
    switch (status) {
      case 'pending':
        return 'În așteptare';
      case 'confirmed':
        return 'Confirmată';
      case 'completed':
        return 'Finalizată';
      case 'cancelled':
        return 'Anulată';
      default:
        return status;
    }
  };

  const filterTrips = (type: 'upcoming' | 'past') => {
    const now = new Date();
    return trips.filter(trip => {
      try {
        if (!trip.trip?.departure_date) return false;
        const tripDate = new Date(trip.trip.departure_date);
        return type === 'upcoming' ? tripDate >= now : tripDate < now;
      } catch (error) {
        console.error('Error filtering trip:', error);
        return false;
      }
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Se încarcă călătoriile...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Călătoriile mele</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'upcoming'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Călătorii viitoare
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'past'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Călătorii anterioare
            </button>
          </nav>
        </div>

        <div className="space-y-6">
          {filterTrips(activeTab).length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {activeTab === 'upcoming'
                  ? 'Nu aveți călătorii viitoare programate'
                  : 'Nu aveți călătorii anterioare'}
              </p>
            </div>
          ) : (
            filterTrips(activeTab).map((booking) => (
              <div key={booking.id} className="bg-white rounded-lg shadow-md p-4 mb-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-5 h-5 text-gray-500" />
                      <span className="font-medium">
                        {booking.trip?.from_city || 'N/A'} → {booking.trip?.to_city || 'N/A'}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>
                          {booking.trip?.departure_date 
                            ? new Date(booking.trip.departure_date).toLocaleDateString('ro-RO')
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span>{booking.trip?.departure_time || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-gray-500" />
                        <span>{booking.amount_paid ? `${booking.amount_paid} MDL` : 'N/A'}</span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span>Șofer: {booking.trip?.driver?.full_name || 'N/A'}</span>
                      </div>
                      {booking.trip?.car && (
                        <div className="flex items-center gap-2 mt-1">
                          <Car className="w-4 h-4 text-gray-500" />
                          <span>
                            {[
                              booking.trip.car.brand,
                              booking.trip.car.model,
                              booking.trip.car.color,
                              booking.trip.car.plate_number
                            ].filter(Boolean).join(' • ') || 'N/A'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(booking.status)}`}>
                      {getStatusText(booking.status)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}