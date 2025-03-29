import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Check, MapPin, Plus, X, ArrowDown } from 'lucide-react';
import { GoogleMap, Marker } from '@react-google-maps/api';
import toast from 'react-hot-toast';

interface Stopover {
  id: string;
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export function DeclaredStopoversPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [suggestedStopovers, setSuggestedStopovers] = useState<Stopover[]>([]);
  const [selectedStopovers, setSelectedStopovers] = useState<Stopover[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const departureData = location.state?.departure;
  const arrivalData = location.state?.arrival;
  const routeData = location.state?.route;

  useEffect(() => {
    if (!departureData || !arrivalData || !routeData) {
      toast.error('Informații despre rută lipsă');
      navigate('/offer-seats/departure');
      return;
    }

    // Generate suggested stopovers based on the route
    generateSuggestedStopovers();
  }, [departureData, arrivalData, routeData]);

  const generateSuggestedStopovers = () => {
    setIsLoading(true);
    
    // In a real app, you would use the route data to find cities along the path
    // For this demo, we'll create some mock stopovers based on common cities in Moldova
    
    // These would normally be calculated based on the actual route
    const mockStopovers: Stopover[] = [
      {
        id: 'stopover-1',
        name: 'Orhei',
        coordinates: { lat: 47.3831, lng: 28.8245 }
      },
      {
        id: 'stopover-2',
        name: 'Călărași',
        coordinates: { lat: 47.2556, lng: 28.3097 }
      },
      {
        id: 'stopover-3',
        name: 'Strășeni',
        coordinates: { lat: 47.1422, lng: 28.6081 }
      },
      {
        id: 'stopover-4',
        name: 'Ungheni',
        coordinates: { lat: 47.2108, lng: 27.8011 }
      },
      {
        id: 'stopover-5',
        name: 'Nisporeni',
        coordinates: { lat: 47.0813, lng: 28.1712 }
      }
    ];
    
    // Filter stopovers to only include those that are likely on the route
    // In a real app, you would check if they're actually on or near the route
    setSuggestedStopovers(mockStopovers);
    setIsLoading(false);
  };

  const toggleStopover = (stopover: Stopover) => {
    if (selectedStopovers.some(s => s.id === stopover.id)) {
      setSelectedStopovers(selectedStopovers.filter(s => s.id !== stopover.id));
    } else {
      setSelectedStopovers([...selectedStopovers, stopover]);
    }
  };

  const handleContinue = () => {
    navigate('/offer-seats/departure-date', {
      state: {
        departure: departureData,
        arrival: arrivalData,
        route: routeData,
        stopovers: selectedStopovers
      }
    });
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Adăugați opriri pe traseu
          </h1>
          <p className="text-gray-600 mb-6">
            Selectați orașele unde sunteți dispus să opriți pentru a lua pasageri
          </p>

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
                  Opriri sugerate pe traseu
                </h2>
                
                <div className="space-y-3">
                  {suggestedStopovers.map((stopover) => {
                    const isSelected = selectedStopovers.some(s => s.id === stopover.id);
                    return (
                      <button
                        key={stopover.id}
                        onClick={() => toggleStopover(stopover)}
                        className={`w-full flex items-center justify-between p-4 border rounded-lg transition-colors ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center">
                          <MapPin className={`h-5 w-5 mr-3 ${
                            isSelected ? 'text-blue-600' : 'text-gray-400'
                          }`} />
                          <span className="font-medium text-gray-900">{stopover.name}</span>
                        </div>
                        <div>
                          {isSelected ? (
                            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                              <Check className="h-4 w-4 text-white" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={handleContinue}
                  className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Check className="h-5 w-5 mr-2" />
                  Continuă
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Map Panel */}
      <div className="hidden lg:block w-1/2 bg-gray-100">
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={{ lat: 47.0105, lng: 28.8638 }}
          zoom={8}
          onLoad={setMap}
          options={{
            disableDefaultUI: true,
            zoomControl: true,
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }],
              },
            ],
          }}
        >
          {/* We can't use the full route object here, so we'll just show markers */}
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
          {selectedStopovers.map((stopover) => (
            <Marker
              key={stopover.id}
              position={stopover.coordinates}
              icon={{
                url: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
                scaledSize: new google.maps.Size(32, 32)
              }}
            />
          ))}
        </GoogleMap>
      </div>
    </div>
  );
}