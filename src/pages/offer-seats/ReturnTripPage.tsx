import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Check, RefreshCw, Calendar, Clock, MapPin, Trash2 } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { ro } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../lib/store';
import { GoogleMap, DirectionsRenderer, Marker } from '@react-google-maps/api';
import { useGoogleMaps, defaultMapCenter, defaultMapOptions } from '../../lib/maps.tsx';

export function ReturnTripPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const [isRoundTrip, setIsRoundTrip] = useState(false);
  const [returnDate, setReturnDate] = useState(
    format(addDays(new Date(), 1), 'yyyy-MM-dd')
  );
  const [returnTime, setReturnTime] = useState('18:00');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  
  const departureData = location.state?.departure;
  const arrivalData = location.state?.arrival;
  const routeData = location.state?.route;
  const stopoversData = location.state?.stopovers;
  const dateData = location.state?.date;
  const timeData = location.state?.time;
  const seatsData = location.state?.seats;
  const maxBackSeatsData = location.state?.maxBackSeats;
  const priceData = location.state?.price;

  const { isLoaded } = useGoogleMaps();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (!departureData || !arrivalData) {
      toast.error('Informații despre locații lipsă');
      navigate('/offer-seats/departure');
      return;
    }

    if (isLoaded && departureData && arrivalData) {
      calculateRoute();
    }
  }, [isLoaded, departureData, arrivalData, stopoversData, user, navigate]);

  const calculateRoute = async () => {
    if (!isLoaded || !departureData || !arrivalData) return;

    try {
      const directionsService = new google.maps.DirectionsService();
      
      // Create waypoints from stopovers if they exist
      const waypoints = stopoversData ? stopoversData.map((stopover: any) => ({
        location: stopover.name + ", Moldova",
        stopover: true
      })) : [];
      
      const result = await directionsService.route({
        origin: departureData.address,
        destination: arrivalData.address,
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'EEEE, d MMMM yyyy', { locale: ro });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!user) {
        navigate('/login');
        return;
      }

      // Create the outbound trip
      const { data: outboundTrip, error: outboundError } = await supabase
        .from('trips')
        .insert([
          {
            driver_id: user.id,
            from_city: departureData.address.split(',')[0],
            to_city: arrivalData.address.split(',')[0],
            from_address: departureData.address,
            to_address: arrivalData.address,
            departure_date: dateData,
            departure_time: timeData,
            arrival_date: dateData,
            arrival_time: timeData,
            price: priceData,
            seats: seatsData,
            available_seats: seatsData,
            status: 'scheduled'
          }
        ])
        .select()
        .single();

      if (outboundError) throw outboundError;

      // If it's a round trip, create the return trip as well
      if (isRoundTrip) {
        const { error: returnError } = await supabase
          .from('trips')
          .insert([
            {
              driver_id: user.id,
              from_city: arrivalData.address.split(',')[0],
              to_city: departureData.address.split(',')[0],
              from_address: arrivalData.address,
              to_address: departureData.address,
              departure_date: returnDate,
              departure_time: returnTime,
              arrival_date: returnDate,
              arrival_time: returnTime,
              price: priceData,
              seats: seatsData,
              available_seats: seatsData,
              status: 'scheduled'
            }
          ]);

        if (returnError) throw returnError;
      }

      toast.success('Călătoria a fost creată cu succes!');
      navigate('/my-trips');
    } catch (error) {
      console.error('Error creating trip:', error);
      toast.error('Eroare la crearea călătoriei. Vă rugăm încercați din nou.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Înapoi
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Doriți să oferiți și călătoria de întoarcere?
          </h1>
          <p className="mt-2 text-gray-600">
            Creați o călătorie dus-întors pentru a găsi mai ușor pasageri
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <RefreshCw className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">
                Călătorie dus-întors
              </h2>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isRoundTrip}
                onChange={() => setIsRoundTrip(!isRoundTrip)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="mb-6">
            <div className="flex">
              <div className="flex flex-col items-center mr-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
                <div className="w-0.5 h-8 bg-blue-200"></div>
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="flex-1">
                <div>
                  <p className="font-medium text-gray-900">{departureData.address}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{formatDate(dateData)}</span>
                    <Clock className="h-4 w-4 ml-2 mr-1" />
                    <span>{timeData}</span>
                  </div>
                </div>
                <div className="mt-8">
                  <p className="font-medium text-gray-900">{arrivalData.address}</p>
                </div>
              </div>
            </div>
          </div>

          {isRoundTrip && (
            <div className="border-t border-gray-200 pt-6 space-y-4">
              <h3 className="font-medium text-gray-900">Detalii călătorie de întoarcere</h3>
              
              <div className="flex">
                <div className="flex flex-col items-center mr-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="w-0.5 h-8 bg-gray-200"></div>
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <div>
                    <p className="font-medium text-gray-900">{arrivalData.address}</p>
                  </div>
                  <div className="mt-8">
                    <p className="font-medium text-gray-900">{departureData.address}</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data întoarcerii
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      min={dateData}
                      className="pl-10 w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ora întoarcerii
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="time"
                      value={returnTime}
                      onChange={(e) => setReturnTime(e.target.value)}
                      className="pl-10 w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Map Preview */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Previzualizare traseu
          </h2>
          
          <div className="h-64 w-full relative rounded-lg overflow-hidden">
            {isLoaded && !mapError ? (
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
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
                        strokeOpacity: 0.8,
                      },
                    }}
                  />
                )}
                
                {/* Departure marker */}
                <Marker
                  position={departureData.coordinates}
                  icon={{
                    url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                    scaledSize: new google.maps.Size(40, 40)
                  }}
                />
                
                {/* Arrival marker */}
                <Marker
                  position={arrivalData.coordinates}
                  icon={{
                    url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
                    scaledSize: new google.maps.Size(40, 40)
                  }}
                />
                
                {/* Stopover markers */}
                {stopoversData && stopoversData.map((stopover: any, index: number) => (
                  <Marker
                    key={index}
                    position={stopover.coordinates}
                    icon={{
                      url: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
                      scaledSize: new google.maps.Size(32, 32)
                    }}
                  />
                ))}
              </GoogleMap>
            ) : (
              <img
                src={`https://maps.googleapis.com/maps/api/staticmap?size=640x360&path=color:0x3B82F6|weight:4|${encodeURIComponent(departureData.address)},Moldova|${encodeURIComponent(arrivalData.address)},Moldova&markers=color:blue|${encodeURIComponent(departureData.address)},Moldova&markers=color:green|${encodeURIComponent(arrivalData.address)},Moldova&key=AIzaSyA2uebsm6mBu7q3b4gDbr_gYkd-U2kzL1o`}
                alt="Trip route"
                className="w-full h-full object-cover"
              />
            )}
            {mapError && (
              <div className="absolute bottom-0 left-0 right-0 bg-yellow-50 text-yellow-800 text-sm p-2 text-center">
                {mapError}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Rezumatul călătoriei
          </h2>
          
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">De la:</span>
              <span className="font-medium text-gray-900">{departureData.address}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Către:</span>
              <span className="font-medium text-gray-900">{arrivalData.address}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Data plecării:</span>
              <span className="font-medium text-gray-900">{formatDate(dateData)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Ora plecării:</span>
              <span className="font-medium text-gray-900">{timeData}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Locuri disponibile:</span>
              <span className="font-medium text-gray-900">{seatsData}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Preț per loc:</span>
              <span className="font-medium text-gray-900">{priceData} MDL</span>
            </div>
            {isRoundTrip && (
              <>
                <div className="border-t border-gray-200 pt-4"></div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Data întoarcerii:</span>
                  <span className="font-medium text-gray-900">{formatDate(returnDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ora întoarcerii:</span>
                  <span className="font-medium text-gray-900">{returnTime}</span>
                </div>
              </>
            )}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white ${
            isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Se creează...
            </>
          ) : (
            <>
              <Check className="h-5 w-5 mr-2" />
              Publică călătoria
            </>
          )}
        </button>
      </div>
    </div>
  );
}