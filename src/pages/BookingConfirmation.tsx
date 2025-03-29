import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import { MapPin, Calendar, Clock, Users, CreditCard, AlertCircle, Check, ArrowDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { GoogleMap, DirectionsRenderer, Marker } from '@react-google-maps/api';
import { useGoogleMaps, defaultMapCenter, defaultMapOptions } from '../lib/maps.tsx';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const capitalizeFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const formatDateWithCapitals = (dateStr: string) => {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', dateStr);
      return 'Data indisponibilă';
    }
    const formatted = format(date, 'eeee d MMMM yyyy', { locale: ro });
    return formatted.split(' ').map(capitalizeFirstLetter).join(' ');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Data indisponibilă';
  }
};

const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours} ${hours === 1 ? 'oră' : 'ore'}${minutes > 0 ? ` și ${minutes} ${minutes === 1 ? 'minut' : 'minute'}` : ''}`;
  }
  return `${minutes} ${minutes === 1 ? 'minut' : 'minute'}`;
};

export function BookingConfirmation() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [trip, setTrip] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [stopovers, setStopOvers] = useState<any[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState(1);
  const [selectedPickupLocation, setSelectedPickupLocation] = useState('');
  const [selectedDropoffLocation, setSelectedDropoffLocation] = useState('');

  const { isLoaded } = useGoogleMaps();

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  useEffect(() => {
    if (isLoaded && trip) {
      calculateRoute();
    }
  }, [isLoaded, trip]);

  useEffect(() => {
    fetchTripDetails();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const calculateRoute = async () => {
    if (!isLoaded || !trip?.from_city || !trip?.to_city) return;

    try {
      const directionsService = new google.maps.DirectionsService();
      
      // Create waypoints from stopovers if they exist
      const waypoints = stopovers.map(stopover => ({
        location: stopover.name + ", Moldova",
        stopover: true
      }));
      
      const result = await directionsService.route({
        origin: `${trip.from_city}, Moldova`,
        destination: `${trip.to_city}, Moldova`,
        waypoints: waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
        optimizeWaypoints: true,
        provideRouteAlternatives: false,
      });

      setDirections(result);
      setMapError(null);
    } catch (error) {
      console.error('Error calculating route:', error);
      setMapError('Nu s-a putut încărca ruta. Se afișează o hartă statică.');
    }
  };

  const fetchTripDetails = async () => {
    try {
      // First fetch trip details
      const { data: tripData, error: tripError } = await supabase
        .from('trips')
        .select(`
          *,
          driver:profiles!trips_driver_id_fkey(
            id, full_name, avatar_url, phone
          )
        `)
        .eq('id', id)
        .single();

      if (tripError) throw tripError;
      
      console.log('Trip data:', tripData);

      // Then fetch bookings separately with proper headers
      if (user) {
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select('*')
          .eq('trip_id', id)
          .eq('user_id', user.id)
          .select()
          .maybeSingle();

        if (!bookingsError && bookingsData) {
          tripData.bookings = [bookingsData];
        }
      }

      setTrip(tripData);
      
      // Fetch stopovers (in a real app, these would be stored in the database)
      // For demo purposes, we'll simulate some stopovers based on the route
      if (tripData) {
        const mockStopovers = [];
        
        // Add some mock stopovers based on the route
        if (tripData.from_city === "Chișinău" && tripData.to_city === "Bălți") {
          mockStopovers.push({ name: "Strășeni", coordinates: { lat: 47.1422, lng: 28.6081 } });
          mockStopovers.push({ name: "Călărași", coordinates: { lat: 47.2556, lng: 28.3097 } });
        } else if (tripData.from_city === "Chișinău" && tripData.to_city === "Cahul") {
          mockStopovers.push({ name: "Cimișlia", coordinates: { lat: 46.5275, lng: 28.7644 } });
        }
        
        setStopOvers(mockStopovers);
      }
    } catch (error) {
      console.error('Error fetching trip:', error);
      toast.error('Nu s-au putut încărca detaliile călătoriei');
    }
  };

  const handleBooking = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    setIsLoading(true);
    try {
      console.log('Creating booking with status: pending');
      // Create pending booking with only the fields that exist in the database
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert([
          {
            trip_id: id,
            user_id: user.id,
            seats: selectedSeats,
            status: 'pending',
            price: trip.price * selectedSeats
          }
        ])
        .select()
        .single();

      if (bookingError) {
        console.error('Error creating booking:', bookingError);
        throw bookingError;
      }

      console.log('Created booking:', booking);

      // Create notification for driver
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert([
          {
            user_id: trip?.driver_id,
            type: 'new_booking_request',
            content: {
              booking_id: booking.id,
              trip_id: id,
              passenger_id: user.id,
              passenger_name: profile?.full_name || 'Pasager',
              seats_requested: selectedSeats,
              trip_details: {
                from_city: trip.from_city,
                to_city: trip.to_city,
                departure_date: trip.departure_date,
                departure_time: trip.departure_time
              }
            }
          }
        ]);

      if (notificationError) throw notificationError;

      // Show success toast with custom styling
      toast.success('Cererea dumneavoastră a fost trimisă la șofer și este în așteptare', {
        duration: 5000,
        position: 'top-center',
        style: {
          background: '#10B981',
          color: '#FFFFFF',
          padding: '16px',
          borderRadius: '8px',
        },
        icon: '🚗'
      });

      // Navigate to my trips page
      navigate('/my-trips');
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Eroare la crearea cererii de rezervare');
    } finally {
      setIsLoading(false);
    }
  };

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

  const availableSeats = trip.seats - (trip.bookings?.filter((b: { status: string }) => b.status === 'accepted').length || 0);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="p-6 bg-blue-600 text-white">
            <h1 className="text-2xl font-bold">Solicită rezervare</h1>
            <p className="mt-2">Verifică detaliile călătoriei înainte de a trimite cererea de rezervare</p>
          </div>

          {/* Trip Details */}
          <div className="p-6 space-y-6">
            {/* Driver Info */}
            <div className="flex items-center space-x-4">
              <img
                src={trip.driver.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(trip.driver.full_name || trip.driver.email)}`}
                alt={trip.driver.full_name || trip.driver.email}
                className="w-16 h-16 rounded-full"
              />
              <div>
                <h2 className="text-xl font-semibold">{trip.driver.full_name || 'Șofer'}</h2>
                <p className="text-gray-500">{trip.driver.email}</p>
              </div>
            </div>

            {/* Route Details */}
            <div className="space-y-4">
              <div className="flex items-center text-gray-700">
                <Calendar className="h-5 w-5 mr-3 text-gray-400" />
                <span>{formatDateWithCapitals(trip.departure_date)}</span>
              </div>
              
              <div className="flex items-center text-gray-700">
                <Clock className="h-5 w-5 mr-3 text-gray-400" />
                <div className="flex items-center">
                  <span className="font-medium">{trip.time}</span>
                  {directions && directions.routes[0].legs[0].duration && (
                    <>
                      <span className="text-gray-400 mx-2">•</span>
                      <span className="text-sm text-gray-500">
                        {formatDuration(directions.routes[0].legs[0].duration.value)}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex">
                <div className="flex flex-col items-center mr-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="h-12 flex flex-col items-center justify-center">
                    <ArrowDown className="h-5 w-5 text-gray-400" />
                  </div>
                  {stopovers.map((stopover, index) => (
                    <React.Fragment key={index}>
                      <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                        <MapPin className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div className="h-12 flex flex-col items-center justify-center">
                        <ArrowDown className="h-5 w-5 text-gray-400" />
                      </div>
                    </React.Fragment>
                  ))}
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <div>
                    <h3 className="font-medium text-gray-900">{trip.from_city}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{trip.from_address}</p>
                  </div>
                  {stopovers.map((stopover, index) => (
                    <div key={index} className="my-8">
                      <h3 className="font-medium text-gray-900">{stopover.name}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">Oprire</p>
                    </div>
                  ))}
                  <div className="mt-auto">
                    <h3 className="font-medium text-gray-900">{trip.to_city}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{trip.to_address}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="h-64 relative">
              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={defaultMapCenter}
                  zoom={8}
                  options={defaultMapOptions}
                >
                  {directions && (
                    <DirectionsRenderer
                      directions={directions}
                      options={{
                        suppressMarkers: true,
                        polylineOptions: {
                          strokeColor: '#3B82F6',
                          strokeWeight: 4,
                          strokeOpacity: 0.8
                        }
                      }}
                    />
                  )}
                  
                  {/* Departure marker */}
                  <Marker
                    position={{ 
                      lat: trip.from_coordinates?.lat || 47.0105, 
                      lng: trip.from_coordinates?.lng || 28.8638 
                    }}
                    icon={{
                      url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                      scaledSize: new google.maps.Size(40, 40)
                    }}
                  />
                  
                  {/* Stopover markers */}
                  {stopovers.map((stopover, index) => (
                    <Marker
                      key={index}
                      position={stopover.coordinates}
                      icon={{
                        url: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
                        scaledSize: new google.maps.Size(32, 32)
                      }}
                    />
                  ))}
                  
                  {/* Arrival marker */}
                  <Marker
                    position={{ 
                      lat: trip.to_coordinates?.lat || 47.7631, 
                      lng: trip.to_coordinates?.lng || 27.9293 
                    }}
                    icon={{
                      url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
                      scaledSize: new google.maps.Size(40, 40)
                    }}
                  />
                </GoogleMap>
              ) : (
                <div className="h-full bg-gray-100 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>

            {/* Price and Seats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CreditCard className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="font-medium">Preț per persoană</span>
                  </div>
                  <span className="text-2xl font-bold">{trip.price} MDL</span>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="font-medium">Locuri disponibile</span>
                  </div>
                  <span className="text-2xl font-bold">{availableSeats}</span>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Important</h3>
              <ul className="list-disc list-inside space-y-1 text-blue-800">
                <li>Rezervarea este confirmată doar după acceptarea șoferului</li>
                <li>Vă rugăm să fiți punctual la locul de întâlnire</li>
                <li>Contactați șoferul pentru detalii specifice după confirmarea rezervării</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={handleBooking}
                disabled={isLoading || availableSeats <= 0}
                className={`flex-1 flex items-center justify-center py-3 px-4 rounded-md text-white transition-colors ${
                  isLoading || availableSeats <= 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Se procesează...
                  </>
                ) : availableSeats <= 0 ? (
                  'Nu sunt locuri disponibile'
                ) : (
                  <>
                    <Check className="h-5 w-5 mr-2" />
                    Solicită rezervare
                  </>
                )}
              </button>
              <button
                onClick={() => navigate(-1)}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Înapoi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}