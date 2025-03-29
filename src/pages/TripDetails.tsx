import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import { MapPin, Calendar, Clock, Users, MessageCircle, Car, Star, AlertCircle, Check, ArrowRight, Package, Cigarette, Music } from 'lucide-react';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { AuthModal } from '../components/AuthModal';
import { UserProfileModal } from '../components/UserProfileModal';
import { GoogleMap, DirectionsRenderer, Marker } from '@react-google-maps/api';
import { useGoogleMaps, defaultMapCenter, defaultMapOptions } from '../lib/maps.tsx';

interface TripDetailsProps {
  onOpenChat: (userId: string) => void;
}

// Add proper type for booking
interface Booking {
  id: string;
  user_id: string;
  status: string;
}

export function TripDetails({ onOpenChat }: TripDetailsProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [trip, setTrip] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [routeDetails, setRouteDetails] = useState<{
    distance: string;
    duration: string;
  } | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [hasUserBooked, setHasUserBooked] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const { isLoaded } = useGoogleMaps();

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
    fetchTripDetails();
  }, [id, user]);

  useEffect(() => {
    if (trip) {
      calculateRoute();
    }
  }, [trip]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchTripDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          driver:profiles!trips_driver_id_fkey(
            id,
            full_name,
            avatar_url,
            bio,
            travel_preferences,
            verification_status
          ),
          company:bus_companies!trips_company_id_fkey(
            id,
            company_name,
            email,
            phone,
            description
          ),
          bookings(
            id,
            status,
            user_id,
            user:profiles!bookings_user_id_fkey(
              id,
              full_name,
              avatar_url
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setTrip(data);
      
      // Check if the current user has already booked this trip
      if (user && data.bookings) {
        const userBooking = data.bookings.find((booking: any) => booking.user_id === user.id);
        setHasUserBooked(!!userBooking);
      }
    } catch (error) {
      console.error('Error fetching trip:', error);
      toast.error('Nu s-au putut încărca detaliile călătoriei');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateRoute = async () => {
    if (!window.google) return;

    try {
      const directionsService = new google.maps.DirectionsService();
      
      const result = await directionsService.route({
        origin: trip.from_city + ", Moldova",
        destination: trip.to_city + ", Moldova",
        travelMode: google.maps.TravelMode.DRIVING,
        optimizeWaypoints: true,
        provideRouteAlternatives: false
      });

      setDirections(result);
      setRouteDetails({
        distance: result.routes[0].legs[0].distance?.text || '',
        duration: result.routes[0].legs[0].duration?.text || ''
      });
      setMapError(null);
    } catch (error) {
      console.error('Error calculating route:', error);
      setMapError('Nu s-a putut calcula ruta. Se afișează o hartă statică.');
    }
  };

  const handleBookClick = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (hasUserBooked) {
      navigate(`/trip/${id}/book`);
      return;
    }

    if (user.id === trip.driver_id) {
      toast.error('Nu puteți rezerva propria călătorie');
      return;
    }

    if (availableSeats < 1) {
      toast.error('Nu mai sunt locuri disponibile pentru această călătorie');
      return;
    }

    navigate(`/trip/${id}/book`);
  };

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return '';
      return format(new Date(dateString), 'EEEE, d MMMM', { locale: ro })
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Data indisponibilă';
    }
  };

  const handleProfileClick = (user: any) => {
    setSelectedUser(user);
    setIsProfileModalOpen(true);
  };

  if (isLoading) {
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

  const availableSeats = trip.seats - (trip.bookings?.filter((b: Booking) => b.status === 'accepted').length || 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={selectedUser}
        onOpenChat={onOpenChat}
      />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border-2 border-gray-100">
          {/* Trip Route and Price */}
          <div className="bg-gray-50 p-6 border-b border-gray-100">
            <div className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                {/* Cities */}
                <div className="flex items-center mb-4">
                  <div className="flex items-center min-w-0">
                    <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0 mr-2" />
                    <p className="text-lg font-semibold text-gray-900">{trip.from_city}</p>
                    <ArrowRight className="h-5 w-5 text-gray-400 flex-shrink-0 mx-2" />
                    <MapPin className="h-5 w-5 text-green-600 flex-shrink-0 mr-2" />
                    <p className="text-lg font-semibold text-gray-900">{trip.to_city}</p>
                  </div>
                </div>

                {/* Date and Time */}
                <div className="flex items-center space-x-6 text-gray-700">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    <span className="text-base">{formatDate(trip.departure_date)}</span>
                  </div>
                  <div className="flex items-center text-gray-900">
                    <Clock className="h-5 w-5 mr-2" />
                    <span className="text-base font-medium">{trip.departure_time?.split(':').slice(0, 2).join(':') || '00:00'}</span>
                  </div>
                </div>
              </div>

              {/* Price Badge */}
              <div className="bg-blue-50 px-4 py-2 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {trip.price} <span className="text-base font-normal">MDL</span>
                </p>
                <p className="text-sm text-blue-600/80">per loc</p>
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="relative">
            {/* Route Summary */}
            {routeDetails && (
              <div className="bg-white border-b border-gray-100 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Car className="h-5 w-5 text-gray-600" />
                    <span className="text-sm text-gray-900 font-medium">
                      {routeDetails.duration} ({routeDetails.distance})
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Cel mai rapid traseu
                  </div>
                </div>

                <div className="mt-2 flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  <p className="text-sm text-gray-600 truncate">{trip.from_city}</p>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                  <div className="w-2 h-2 rounded-full bg-green-600"></div>
                  <p className="text-sm text-gray-600 truncate">{trip.to_city}</p>
                </div>
              </div>
            )}

            {/* Map */}
            <div className="h-48 sm:h-64 w-full relative">
              {directions ? (
                <GoogleMap
                  key={`${trip.from_city}-${trip.to_city}`}
                  mapContainerStyle={{ width: '100%', height: '100%' }}
                  zoom={10}
                  options={{
                    ...defaultMapOptions,
                    clickableIcons: false,
                    fullscreenControl: false,
                    styles: [
                      ...defaultMapOptions.styles,
                      {
                        featureType: "transit",
                        elementType: "labels",
                        stylers: [{ visibility: "off" }]
                      },
                      {
                        featureType: "road",
                        elementType: "geometry",
                        stylers: [{ color: "#ffffff" }]
                      },
                      {
                        featureType: "landscape",
                        elementType: "geometry",
                        stylers: [{ color: "#f5f5f5" }]
                      }
                    ]
                  }}
                  center={
                    directions?.routes[0].bounds.getCenter() || 
                    defaultMapCenter
                  }
                  onUnmount={() => {
                    // Cleanup map instance
                    setDirections(null);
                  }}
                >
                  <DirectionsRenderer
                    directions={directions}
                    options={{
                      suppressMarkers: true,
                      polylineOptions: {
                        strokeColor: '#3B82F6',
                        strokeWeight: 5,
                        strokeOpacity: 0.8
                      }
                    }}
                  />
                  {/* Departure marker */}
                  <Marker
                    position={directions.routes[0].legs[0].start_location}
                    icon={{
                      url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                      scaledSize: new google.maps.Size(40, 40)
                    }}
                  />
                  {/* Arrival marker */}
                  <Marker
                    position={directions.routes[0].legs[0].end_location}
                    icon={{
                      url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
                      scaledSize: new google.maps.Size(40, 40)
                    }}
                  />
                </GoogleMap>
              ) : mapError ? (
                <div className="h-full w-full flex flex-col items-center justify-center bg-gray-100">
                  <div className="text-sm text-gray-600 mb-2">{mapError}</div>
                  <img
                    src={`https://maps.googleapis.com/maps/api/staticmap?size=640x360&path=color:0x3B82F6|weight:4|${encodeURIComponent(trip.from_city)},Moldova|${encodeURIComponent(trip.to_city)},Moldova&markers=color:blue|${encodeURIComponent(trip.from_city)},Moldova&markers=color:green|${encodeURIComponent(trip.to_city)},Moldova&key=AIzaSyA2uebsm6mBu7q3b4gDbr_gYkd-U2kzL1o`}
                    alt="Trip route"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gray-100">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>
          </div>

          {/* Driver Info */}
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {trip.company ? 'Compania de transport' : 'Șoferul'}
            </h3>
            
            {trip.company ? (
              <div className="flex items-center space-x-4">
                <img
                  src={trip.company.logo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(trip.company.company_name)}&background=random&color=fff&size=192`}
                  alt={trip.company.company_name}
                  className="h-16 w-16 rounded-full object-cover cursor-pointer"
                />
                <div>
                  <h4 className="text-base font-medium text-gray-900">{trip.company.company_name}</h4>
                  <p className="text-sm text-gray-500">{trip.company.phone}</p>
                  <p className="text-sm text-gray-500">{trip.company.email}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <img
                  src={trip.driver.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(trip.driver.full_name)}&background=random&color=fff&size=192`}
                  alt={trip.driver.full_name}
                  className="h-16 w-16 rounded-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => handleProfileClick(trip.driver)}
                />
                <div>
                  <h4 className="text-base font-medium text-gray-900">{trip.driver.full_name}</h4>
                  {trip.driver.verification_status === 'verified' && (
                    <div className="flex items-center text-green-600 text-sm">
                      <Check className="h-4 w-4 mr-1" />
                      <span>Verificat</span>
                    </div>
                  )}
                  <button
                    onClick={() => onOpenChat(trip.driver.id)}
                    className="mt-2 inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    <span>Trimite mesaj</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Seats Badge */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center px-4 py-2 bg-green-50 rounded-lg">
              <Users className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-base font-medium text-green-700">
                {availableSeats} {availableSeats === 1 ? 'loc disponibil' : 'locuri disponibile'}
              </span>
            </div>
          </div>

          {/* Car Info and Trip Details */}
          <div className="p-6">
            {trip.car && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center text-gray-700 mb-2">
                  <Car className="h-5 w-5 mr-2" />
                  <span className="font-medium">{trip.car.make} {trip.car.model}</span>
                </div>
                <p className="text-sm text-gray-600 ml-7">
                  {trip.car.color} • {trip.car.year}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center text-gray-600">
                <Package className="h-5 w-5 mr-2" />
                <span className="text-sm">Bagaj mediu permis</span>
              </div>
              <div className="flex items-center text-gray-600">
                <MessageCircle className="h-5 w-5 mr-2" />
                <span className="text-sm">Răspunde în ~2 ore</span>
              </div>
              <div className="flex items-center text-gray-600" title="Fumatul interzis">
                <Cigarette className="h-5 w-5 mr-2" />
                <span className="text-sm">Fumatul interzis</span>
              </div>
              <div className="flex items-center text-gray-600" title="Muzică permisă">
                <Music className="h-5 w-5 mr-2" />
                <span className="text-sm">Muzică permisă</span>
              </div>
            </div>

            {/* Book Button */}
            <div className="mt-8 flex flex-col gap-2">
              {availableSeats < 1 ? (
                <div className="text-center text-red-600 text-sm mb-2">
                  Nu mai sunt locuri disponibile pentru această călătorie
                </div>
              ) : null}
              <button
                onClick={handleBookClick}
                disabled={isBooking || user?.id === trip.driver_id || availableSeats < 1}
                className={`
                  w-full sm:w-auto sm:ml-auto px-6 py-3 rounded-lg font-medium
                  transition-all duration-200 flex items-center justify-center gap-2
                  ${isBooking ? 'bg-gray-400 cursor-wait' : ''}
                  ${hasUserBooked ? 'bg-green-600 hover:bg-green-700 cursor-pointer' : ''}
                  ${user?.id === trip.driver_id ? 'bg-gray-400 cursor-not-allowed' : ''}
                  ${availableSeats < 1 ? 'bg-gray-400 cursor-not-allowed' : ''}
                  ${!isBooking && !hasUserBooked && user?.id !== trip.driver_id && availableSeats > 0 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-sm hover:shadow-md' 
                    : 'text-white'
                  }
                `}
              >
                {isBooking ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Se procesează...
                  </>
                ) : hasUserBooked ? (
                  <>
                    <Check className="h-5 w-5" />
                    Vezi rezervarea
                  </>
                ) : user?.id === trip.driver_id ? (
                  <>
                    <Car className="h-5 w-5" />
                    Călătoria ta
                  </>
                ) : availableSeats < 1 ? (
                  <>
                    <AlertCircle className="h-5 w-5" />
                    Nu sunt locuri disponibile
                  </>
                ) : (
                  <>
                    <ArrowRight className="h-5 w-5" />
                    Solicită rezervare
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}