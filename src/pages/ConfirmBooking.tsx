import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import { MapPin, Calendar, Clock, Users, CreditCard, Bus, Info, ArrowRight, Check, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { MapPreview } from '../components/MapPreview';
import { geocodeAddress } from '../lib/maps.tsx';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

interface TripDetails {
  id: string;
  from_city: string;
  to_city: string;
  departure_date: string;
  departure_time: string;
  arrival_date: string;
  arrival_time: string;
  available_seats: number;
  price: number;
  driver_id?: string;
  driver?: {
    id: string;
    full_name: string;
  };
  amenities: {
    wifi: boolean;
    ac: boolean;
    usb: boolean;
    toilet: boolean;
    luggage: boolean;
  };
}

interface Booking {
  id: string;
  status: string;
  created_at: string;
  amount_paid: number;
}

export function ConfirmBooking() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [trip, setTrip] = useState<TripDetails | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [departureCoords, setDepartureCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [arrivalCoords, setArrivalCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!user) {
      toast.error('Vă rugăm să vă autentificați pentru a vizualiza această pagină');
      navigate('/');
      return;
    }
    fetchTripAndBooking();
  }, [tripId, user]);

  useEffect(() => {
    if (trip) {
      updateCoordinates();
    }
  }, [trip]);

  const fetchTripAndBooking = async () => {
    try {
      const { data: tripData, error: tripError } = await supabase
        .from('trips')
        .select(`
          *,
          driver:profiles!trips_driver_id_fkey(
            id,
            full_name
          )
        `)
        .eq('id', tripId)
        .single();

      if (tripError) throw tripError;
      console.log('Trip data:', tripData);
      setTrip(tripData);

      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select('*')
        .eq('trip_id', tripId)
        .eq('user_id', user?.id)
        .single();

      if (!bookingError) {
        setBooking(bookingData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Eroare la încărcarea detaliilor călătoriei');
      navigate('/trips');
    } finally {
      setLoading(false);
    }
  };

  const updateCoordinates = async () => {
    if (trip?.from_city) {
      try {
        const coords = await geocodeAddress(trip.from_city + ", Moldova");
        setDepartureCoords(coords);
      } catch (error) {
        console.error('Error geocoding departure location:', error);
      }
    }
    if (trip?.to_city) {
      try {
        const coords = await geocodeAddress(trip.to_city + ", Moldova");
        setArrivalCoords(coords);
      } catch (error) {
        console.error('Error geocoding arrival location:', error);
      }
    }
  };

  const handleConfirmBooking = async () => {
    if (!user || !trip) return;
    
    try {
      setConfirming(true);

      if (booking) {
        toast.success('Aveți deja o rezervare pentru această călătorie');
        return;
      }

      const { data: tripCheck } = await supabase
        .from('trips')
        .select('available_seats')
        .eq('id', tripId)
        .single();

      if (!tripCheck || tripCheck.available_seats < 1) {
        toast.error('Nu mai sunt locuri disponibile pentru această călătorie');
        return;
      }

      const { error: bookingError } = await supabase
        .from('bookings')
        .insert([
          {
            trip_id: tripId,
            user_id: user.id,
            status: 'confirmed',
            amount_paid: trip.price,
          }
        ]);

      if (bookingError) throw bookingError;

      const { error: updateError } = await supabase
        .from('trips')
        .update({ available_seats: trip.available_seats - 1 })
        .eq('id', tripId);

      if (updateError) throw updateError;

      toast.success('Rezervare confirmată cu succes');
      navigate('/my-trips');
    } catch (error: any) {
      console.error('Error booking trip:', error);
      toast.error(error.message || 'Eroare la confirmarea rezervării');
    } finally {
      setConfirming(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!user || !trip || !booking) return;
    
    try {
      setCancelling(true);

      const { error: deleteError } = await supabase
        .from('bookings')
        .delete()
        .eq('id', booking.id)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      const { error: updateError } = await supabase
        .from('trips')
        .update({ available_seats: trip.available_seats + 1 })
        .eq('id', tripId);

      if (updateError) throw updateError;

      toast.success('Rezervare anulată cu succes');
      setBooking(null);
    } catch (error: any) {
      console.error('Error cancelling booking:', error);
      toast.error(error.message || 'Eroare la anularea rezervării');
    } finally {
      setCancelling(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <p className="mt-4 text-gray-600">Călătoria nu a fost găsită</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
            <h1 className="text-2xl font-bold mb-2">
              {booking ? 'Detalii Rezervare' : 'Confirmă Rezervarea'}
            </h1>
            <p className="text-blue-100">
              {booking ? 'Vizualizați informațiile rezervării' : 'Verificați și confirmați detaliile călătoriei'}
            </p>
          </div>

          <div className="p-6 space-y-8">
            {/* Route Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                Detalii Rută
              </h2>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-1">
                    <div className="text-sm text-gray-600 mb-1">De la</div>
                    <div className="font-medium text-gray-900">{trip.from_city}</div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                  <div className="flex-1">
                    <div className="text-sm text-gray-600 mb-1">Spre</div>
                    <div className="font-medium text-gray-900">{trip.to_city}</div>
                  </div>
                </div>

                <div className="h-48 rounded-lg overflow-hidden">
                  <MapPreview
                    departureLocation={{
                      address: trip.from_city,
                      coordinates: departureCoords
                    }}
                    arrivalLocation={{
                      address: trip.to_city,
                      coordinates: arrivalCoords
                    }}
                    showDirections={true}
                    className="w-full h-full"
                  />
                </div>
              </div>
            </div>

            {/* Schedule Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Program
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Plecare</div>
                  <div className="font-medium text-gray-900">
                    {formatDate(trip.departure_date)}
                  </div>
                  <div className="text-blue-600 font-medium mt-1">
                    {trip.departure_time?.split(':').slice(0, 2).join(':')}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Sosire</div>
                  <div className="font-medium text-gray-900">
                    {formatDate(trip.arrival_date)}
                  </div>
                  <div className="text-blue-600 font-medium mt-1">
                    {trip.arrival_time?.split(':').slice(0, 2).join(':')}
                  </div>
                </div>
              </div>
            </div>

            {/* Bus/Driver Details Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Bus className="h-5 w-5 text-blue-600" />
                {trip.driver_id ? 'Detalii Șofer' : 'Detalii Șofer'}
              </h2>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {trip.driver_id ? (
                    <>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Șofer</div>
                        <div className="font-medium text-gray-900">
                          {trip.driver?.full_name || 'Indisponibil'}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">ID Călătorie</div>
                        <div className="font-medium text-gray-900">
                          {trip.id}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Locuri Disponibile</div>
                        <div className="font-medium text-gray-900">
                          {trip.available_seats}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Șofer</div>
                        <div className="font-medium text-gray-900">
                          {trip.driver?.full_name || 'Indisponibil'}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">ID Călătorie</div>
                        <div className="font-medium text-gray-900">
                          {trip.id}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Locuri Disponibile</div>
                        <div className="font-medium text-gray-900">
                          {trip.available_seats}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Price Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                Detalii Preț
              </h2>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-gray-600">Preț Total</div>
                    <div className="text-sm text-gray-500">Include toate taxele</div>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {trip.price} MDL
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-4">
              <button
                onClick={() => navigate(`/trip/${tripId}`)}
                className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Înapoi la Călătorie
              </button>
              
              {booking ? (
                <button
                  onClick={handleCancelBooking}
                  disabled={cancelling}
                  className={`
                    px-6 py-2 rounded-lg font-medium text-white
                    flex items-center gap-2
                    ${cancelling 
                      ? 'bg-gray-400 cursor-wait' 
                      : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
                    }
                  `}
                >
                  {cancelling ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Se anulează...
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5" />
                      Anulează Rezervarea
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleConfirmBooking}
                  disabled={confirming}
                  className={`
                    px-6 py-2 rounded-lg font-medium text-white
                    flex items-center gap-2
                    ${confirming 
                      ? 'bg-gray-400 cursor-wait' 
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                    }
                  `}
                >
                  {confirming ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Se procesează...
                    </>
                  ) : (
                    <>
                      <Check className="h-5 w-5" />
                      Confirmă Rezervarea
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 