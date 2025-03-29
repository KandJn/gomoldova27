import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Check, MapPin, Clock, Car } from 'lucide-react';
import { GoogleMap, DirectionsRenderer } from '@react-google-maps/api';
import { useGoogleMaps, defaultMapCenter, defaultMapOptions } from '../../lib/maps.tsx';
import toast from 'react-hot-toast';

interface RouteOption {
  id: string;
  duration: {
    text: string;
    value: number;
  };
  distance: {
    text: string;
    value: number;
  };
  route: google.maps.DirectionsRoute;
}

export function ChooseYourRoutePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [routeOptions, setRouteOptions] = useState<RouteOption[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const departureData = location.state?.departure;
  const arrivalData = location.state?.arrival;

  const { isLoaded } = useGoogleMaps();

  useEffect(() => {
    if (!departureData || !arrivalData) {
      toast.error('Informații despre locații lipsă');
      navigate('/offer-seats/departure');
      return;
    }

    if (isLoaded && departureData && arrivalData) {
      const directionsService = new google.maps.DirectionsService();
      setDirectionsService(directionsService);
      
      calculateRoutes(directionsService);
    }
  }, [departureData, arrivalData, isLoaded, navigate]);

  const calculateRoutes = async (service: google.maps.DirectionsService) => {
    setIsLoading(true);
    try {
      const result = await service.route({
        origin: departureData.address,
        destination: arrivalData.address,
        travelMode: google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: true,
        optimizeWaypoints: true,
      });

      if (result.routes && result.routes.length > 0) {
        const options = result.routes.map((route, index) => ({
          id: `route-${index}`,
          duration: {
            text: route.legs[0].duration?.text || '',
            value: route.legs[0].duration?.value || 0
          },
          distance: {
            text: route.legs[0].distance?.text || '',
            value: route.legs[0].distance?.value || 0
          },
          route: route
        }));
        
        setRouteOptions(options);
        setSelectedRouteId(options[0].id);
        
        // Center map on the route
        if (map && result.routes[0].bounds) {
          map.fitBounds(result.routes[0].bounds);
        }
      }
    } catch (error) {
      console.error('Error calculating routes:', error);
      toast.error('Nu s-au putut calcula rutele');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (duration: { text: string; value: number }) => {
    const text = duration.text;
    return text.replace('hours', 'ore').replace('hour', 'oră').replace('mins', 'minute').replace('min', 'minut');
  };

  const formatDistance = (distance: { text: string; value: number }) => {
    return distance.text;
  };

  const handleContinue = () => {
    if (!selectedRouteId) {
      toast.error('Vă rugăm să selectați o rută');
      return;
    }

    const selectedRoute = routeOptions.find(route => route.id === selectedRouteId);
    if (!selectedRoute) return;
    
    // Create a serializable version of the route data
    const serializableRouteData = {
      id: selectedRoute.id,
      duration: selectedRoute.duration,
      distance: selectedRoute.distance,
      // Don't include the full route object as it contains functions
    };
    
    navigate('/offer-seats/declared-stopovers', {
      state: {
        departure: departureData,
        arrival: arrivalData,
        route: serializableRouteData
      }
    });
  };

  const getSelectedRoute = () => {
    return routeOptions.find(route => route.id === selectedRouteId);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Panel */}
      <div className="w-full lg:w-1/2 p-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Înapoi
        </button>

        <div className="max-w-lg">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Alegeți ruta dvs.
          </h1>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex">
                  <div className="flex flex-col items-center mr-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="w-0.5 h-8 bg-gray-200"></div>
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div>
                      <p className="font-medium text-gray-900">{departureData.address}</p>
                    </div>
                    <div className="mt-8">
                      <p className="font-medium text-gray-900">{arrivalData.address}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-medium text-gray-900">
                  Rute disponibile
                </h2>
                
                {routeOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSelectedRouteId(option.id)}
                    className={`w-full flex items-start p-4 border rounded-lg transition-colors ${
                      selectedRouteId === option.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="mr-4 mt-1">
                      <Car className={`h-6 w-6 ${
                        selectedRouteId === option.id ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">
                            Ruta {routeOptions.findIndex(r => r.id === option.id) + 1}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDistance(option.distance)}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-sm font-medium text-gray-900">
                            {formatDuration(option.duration)}
                          </span>
                        </div>
                      </div>
                    </div>
                    {selectedRouteId === option.id && (
                      <div className="ml-2">
                        <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <button
                onClick={handleContinue}
                disabled={!selectedRouteId}
                className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Check className="h-5 w-5 mr-2" />
                Continuă
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Map Panel */}
      <div className="hidden lg:block w-1/2 bg-gray-100">
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={defaultMapCenter}
          zoom={8}
          onLoad={setMap}
          options={defaultMapOptions}
        >
          {getSelectedRoute() && (
            <DirectionsRenderer
              directions={{
                routes: [getSelectedRoute()!.route],
                geocoded_waypoints: [],
                request: {
                  origin: departureData.address,
                  destination: arrivalData.address,
                  travelMode: google.maps.TravelMode.DRIVING
                }
              }}
              options={{
                suppressMarkers: false,
                polylineOptions: {
                  strokeColor: '#3B82F6',
                  strokeWeight: 5,
                  strokeOpacity: 0.8,
                },
              }}
            />
          )}
        </GoogleMap>
      </div>
    </div>
  );
}