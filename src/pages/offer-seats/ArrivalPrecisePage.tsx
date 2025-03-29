import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, MapPin, Check } from 'lucide-react';
import { GoogleMap, Marker } from '@react-google-maps/api';
import { useGoogleMaps, defaultMapCenter, defaultMapOptions } from '../../lib/maps.tsx';
import toast from 'react-hot-toast';

export function ArrivalPrecisePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [address, setAddress] = useState(location.state?.location || '');
  const [coordinates, setCoordinates] = useState(location.state?.coordinates || defaultMapCenter);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const departureData = location.state?.departure;

  const { isLoaded } = useGoogleMaps();

  useEffect(() => {
    if (!isLoaded) return;

    if (location.state?.location) {
      geocodeAddress(location.state.location);
    }
    
    // Initialize autocomplete when component mounts
    const input = document.getElementById('autocomplete-input') as HTMLInputElement;
    if (input) {
      const autocompleteInstance = new google.maps.places.Autocomplete(input, {
        componentRestrictions: { country: 'md' },
        fields: ['address_components', 'geometry', 'formatted_address'],
        types: ['address']
      });
      
      autocompleteInstance.addListener('place_changed', () => {
        const place = autocompleteInstance.getPlace();
        if (place.geometry && place.geometry.location) {
          const newCoords = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          };
          setCoordinates(newCoords);
          map?.panTo(newCoords);
          
          if (place.formatted_address) {
            setAddress(place.formatted_address);
          }
          setShowPredictions(false);
        }
      });
      
      setAutocomplete(autocompleteInstance);
    }

    // Add click event listener to document to close predictions
    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [location.state?.location, isLoaded]);

  const handleDocumentClick = (e: MouseEvent) => {
    const target = e.target as Node;
    if (inputRef.current && !inputRef.current.contains(target)) {
      setShowPredictions(false);
    }
  };

  const geocodeAddress = async (address: string) => {
    setIsLoading(true);
    try {
      const geocoder = new google.maps.Geocoder();
      const result = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
        geocoder.geocode(
          { address: address + ', Moldova', region: 'MD' },
          (results, status) => {
            if (status === 'OK' && results) {
              resolve(results);
            } else {
              reject(status);
            }
          }
        );
      });

      if (result[0]?.geometry?.location) {
        const newCoords = {
          lat: result[0].geometry.location.lat(),
          lng: result[0].geometry.location.lng()
        };
        setCoordinates(newCoords);
        map?.panTo(newCoords);
        setAddress(result[0].formatted_address);
      }
    } catch (error) {
      toast.error('Nu s-a putut găsi adresa');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMapClick = async (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    
    const newCoords = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    };
    setCoordinates(newCoords);
    
    try {
      const geocoder = new google.maps.Geocoder();
      const result = await geocoder.geocode({ location: newCoords });
      
      if (result.results[0]) {
        setAddress(result.results[0].formatted_address);
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    }
  };

  const handleMarkerDragEnd = async (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    
    const newCoords = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    };
    setCoordinates(newCoords);
    
    try {
      const geocoder = new google.maps.Geocoder();
      const result = await geocoder.geocode({ location: newCoords });
      
      if (result.results[0]) {
        setAddress(result.results[0].formatted_address);
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    }
  };

  const handleConfirm = () => {
    if (!address || !coordinates) {
      toast.error('Vă rugăm să selectați o locație validă');
      return;
    }

    navigate('/offer-seats/choose-your-route', {
      state: {
        departure: departureData,
        arrival: {
          address,
          coordinates
        }
      }
    });
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAddress(value);
    
    if (value.length > 2) {
      try {
        const service = new google.maps.places.AutocompleteService();
        const predictions = await service.getPlacePredictions({
          input: value,
          componentRestrictions: { country: 'md' },
          types: ['address']
        });
        
        setPredictions(predictions.predictions);
        setShowPredictions(true);
      } catch (error) {
        console.error('Error fetching predictions:', error);
      }
    } else {
      setPredictions([]);
      setShowPredictions(false);
    }
  };

  const handlePredictionSelect = async (prediction: google.maps.places.AutocompletePrediction) => {
    setAddress(prediction.description);
    setShowPredictions(false);
    
    try {
      const geocoder = new google.maps.Geocoder();
      const result = await geocoder.geocode({ placeId: prediction.place_id });
      
      if (result.results[0]?.geometry?.location) {
        const newCoords = {
          lat: result.results[0].geometry.location.lat(),
          lng: result.results[0].geometry.location.lng()
        };
        setCoordinates(newCoords);
        map?.panTo(newCoords);
      }
    } catch (error) {
      console.error('Error geocoding prediction:', error);
    }
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
            Specificați locația exactă de sosire
          </h1>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresa
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={address}
                  onChange={handleInputChange}
                  placeholder="Introduceți adresa exactă"
                  className="pl-10 w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  id="autocomplete-input"
                  onFocus={() => address.length > 2 && setShowPredictions(true)}
                />
                {isLoading && (
                  <div className="absolute right-3 top-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  </div>
                )}
                
                {/* Predictions dropdown */}
                {showPredictions && predictions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {predictions.map((prediction) => (
                      <div
                        key={prediction.place_id}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handlePredictionSelect(prediction)}
                      >
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                          <span>{prediction.description}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-500 flex items-center">
                <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                Puteți trage markerul pe hartă pentru a ajusta locația exact
              </p>
            </div>

            <div className="lg:hidden h-64 bg-gray-100 rounded-lg mb-6">
              {isLoaded && (
                <GoogleMap
                  mapContainerStyle={{ width: '100%', height: '100%' }}
                  center={coordinates}
                  zoom={15}
                  onClick={handleMapClick}
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
                  <Marker
                    position={coordinates}
                    draggable={true}
                    onDragEnd={handleMarkerDragEnd}
                    onLoad={setMarker}
                    animation={google.maps.Animation.DROP}
                    icon={{
                      url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
                      scaledSize: new google.maps.Size(40, 40)
                    }}
                  />
                </GoogleMap>
              )}
            </div>

            <button
              onClick={handleConfirm}
              disabled={!address || isLoading}
              className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Check className="h-5 w-5 mr-2" />
                  Confirmă locația
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Right Map Panel */}
      <div className="hidden lg:block w-1/2 bg-gray-100">
        {isLoaded && (
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={coordinates}
            zoom={15}
            onClick={handleMapClick}
            onLoad={setMap}
            options={defaultMapOptions}
          >
            <Marker
              position={coordinates}
              draggable={true}
              onDragEnd={handleMarkerDragEnd}
              onLoad={setMarker}
              animation={google.maps.Animation.DROP}
              icon={{
                url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
                scaledSize: new google.maps.Size(40, 40)
              }}
            />
          </GoogleMap>
        )}
      </div>
    </div>
  );
}