import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import { MapPin, Calendar, CreditCard, Bus, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

interface Booking {
  id: string;
  status: string;
  created_at: string;
  amount_paid: number;
  trip: {
    id: string;
    from_city: string;
    to_city: string;
    departure_date: string;
    departure_time: string;
    arrival_date: string;
    arrival_time: string;
    driver: {
      full_name: string;
    };
  };
}

export function MyBookings() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (!user) {
      toast.error('Vă rugăm să vă autentificați pentru a vizualiza rezervările');
      navigate('/');
      return;
    }
    fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          trip:trips (
            id,
            from_city,
            to_city,
            departure_date,
            departure_time,
            arrival_date,
            arrival_time,
            driver:profiles!trips_driver_id_fkey (
              full_name
            )
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Eroare la încărcarea rezervărilor');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'EEEE, d MMMM', { locale: ro })
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    } catch (error) {
      return 'Data indisponibilă';
    }
  };

  const handleCancelBooking = async (bookingId: string, tripId: string) => {
    try {
      // Delete the booking
      const { error: deleteError } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId)
        .eq('user_id', user?.id);

      if (deleteError) throw deleteError;

      // Update available seats
      const { error: updateError } = await supabase
        .from('trips')
        .update({ available_seats: supabase.rpc('increment', { x: 1 }) })
        .eq('id', tripId);

      if (updateError) throw updateError;

      toast.success('Rezervare anulată cu succes');
      fetchBookings(); // Refresh the list
    } catch (error: any) {
      console.error('Error cancelling booking:', error);
      toast.error(error.message || 'Eroare la anularea rezervării');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
            <h1 className="text-2xl font-bold mb-2">Rezervările Mele</h1>
            <p className="text-blue-100">Gestionați rezervările dvs. de călătorie</p>
          </div>

          <div className="p-6">
            {bookings.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nu aveți nicio rezervare încă</p>
                <button
                  onClick={() => navigate('/trips')}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Căutați Călătorii
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-gray-50 rounded-lg p-6 space-y-4"
                  >
                    {/* Route */}
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      <div className="flex-1">
                        <div className="text-sm text-gray-600">Rută</div>
                        <div className="font-medium">
                          {booking.trip.from_city} → {booking.trip.to_city}
                        </div>
                      </div>
                    </div>

                    {/* Schedule */}
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <div className="flex-1">
                        <div className="text-sm text-gray-600">Data</div>
                        <div className="font-medium">
                          {formatDate(booking.trip.departure_date)}
                        </div>
                        <div className="text-sm text-blue-600">
                          {booking.trip.departure_time?.split(':').slice(0, 2).join(':')} - 
                          {booking.trip.arrival_time?.split(':').slice(0, 2).join(':')}
                        </div>
                      </div>
                    </div>

                    {/* Driver */}
                    <div className="flex items-center gap-2">
                      <Bus className="h-5 w-5 text-blue-600" />
                      <div className="flex-1">
                        <div className="text-sm text-gray-600">Șofer</div>
                        <div className="font-medium">
                          {booking.trip.driver?.full_name || 'Indisponibil'}
                        </div>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                      <div className="flex-1">
                        <div className="text-sm text-gray-600">Preț</div>
                        <div className="font-medium">
                          {booking.amount_paid} MDL
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-4 pt-4">
                      <button
                        onClick={() => navigate(`/trip/${booking.trip.id}`)}
                        className="px-4 py-2 text-gray-700 hover:text-gray-900"
                      >
                        Vezi Detalii
                      </button>
                      <button
                        onClick={() => handleCancelBooking(booking.id, booking.trip.id)}
                        className="px-4 py-2 text-red-600 hover:text-red-700 font-medium"
                      >
                        Anulează Rezervarea
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}