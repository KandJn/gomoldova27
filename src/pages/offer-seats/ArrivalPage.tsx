import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Search, Clock, Navigation } from 'lucide-react';
import { PlacesAutocomplete } from '../../components/PlacesAutocomplete';

const popularLocations = [
  'Chișinău',
  'Bălți',
  'Orhei',
  'Ungheni',
  'Cahul',
  'Hîncești'
];

// Sample addresses for popular cities
const cityAddresses = {
  'Chișinău': 'Bulevardul Ștefan cel Mare și Sfânt 1, Chișinău, Moldova',
  'Bălți': 'Piața Independenței 1, Bălți, Moldova',
  'Orhei': 'Strada Vasile Lupu 45, Orhei, Moldova',
  'Ungheni': 'Strada Națională 17, Ungheni, Moldova',
  'Cahul': 'Piața Independenței 1, Cahul, Moldova',
  'Hîncești': 'Strada 31 August 1989, Hîncești, Moldova'
};

export function ArrivalPage() {
  const location = useLocation();
  const [arrivalLocation, setArrivalLocation] = useState('');
  const navigate = useNavigate();
  const departureData = location.state?.departure;

  const handleLocationSelect = (location: string) => {
    setArrivalLocation(location);
    
    // Get a sample address for the selected city if available
    const sampleAddress = (cityAddresses as any)[location] || '';
    
    navigate('/offer-seats/arrival/precise', { 
      state: { 
        location,
        sampleAddress,
        departure: departureData
      } 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Unde mergeți?
          </h1>
          <p className="mt-2 text-gray-600">
            Selectați destinația călătoriei dvs.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="relative">
            <PlacesAutocomplete
              value={arrivalLocation}
              onChange={handleLocationSelect}
              placeholder="Introduceți destinația"
            />
            <div className="absolute right-3 top-3">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Locații recente
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                className="flex items-center space-x-3 p-4 bg-white rounded-lg border hover:border-blue-500 transition-colors"
                onClick={() => handleLocationSelect('Bălți')}
              >
                <Clock className="h-5 w-5 text-gray-400" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Bălți, Centru</p>
                  <p className="text-sm text-gray-500">Ultima utilizare: acum 2 zile</p>
                </div>
              </button>
              <button
                className="flex items-center space-x-3 p-4 bg-white rounded-lg border hover:border-blue-500 transition-colors"
                onClick={() => handleLocationSelect('Orhei')}
              >
                <Clock className="h-5 w-5 text-gray-400" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Orhei, Piața Centrală</p>
                  <p className="text-sm text-gray-500">Ultima utilizare: săptămâna trecută</p>
                </div>
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Locații populare
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {popularLocations.map((location) => (
                <button
                  key={location}
                  onClick={() => handleLocationSelect(location)}
                  className="flex items-center space-x-2 p-3 bg-white rounded-lg border hover:border-blue-500 transition-colors"
                >
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <span className="font-medium text-gray-900">{location}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Folosiți locația curentă
            </h2>
            <button
              onClick={() => {
                // Handle geolocation
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition((position) => {
                    // Here you would normally reverse geocode the coordinates
                    // For now, we'll just navigate to the precise page
                    navigate('/offer-seats/arrival/precise', {
                      state: {
                        coordinates: {
                          lat: position.coords.latitude,
                          lng: position.coords.longitude
                        },
                        departure: departureData
                      }
                    });
                  });
                }
              }}
              className="flex items-center space-x-2 w-full sm:w-auto px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Navigation className="h-5 w-5" />
              <span>Detectează locația mea</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}