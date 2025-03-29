import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Check, Users, Info } from 'lucide-react';

export function SeatsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [seats, setSeats] = useState(3);
  const [maxBackSeats, setMaxBackSeats] = useState(2);
  
  const departureData = location.state?.departure;
  const arrivalData = location.state?.arrival;
  const routeData = location.state?.route;
  const stopoversData = location.state?.stopovers;
  const dateData = location.state?.date;
  const timeData = location.state?.time;

  const handleContinue = () => {
    navigate('/offer-seats/price-recommendation', {
      state: {
        departure: departureData,
        arrival: arrivalData,
        route: routeData,
        stopovers: stopoversData,
        date: dateData,
        time: timeData,
        seats: seats,
        maxBackSeats: maxBackSeats
      }
    });
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
            Câte locuri oferiți?
          </h1>
          <p className="mt-2 text-gray-600">
            Specificați numărul de locuri disponibile
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-center mb-6">
            <Users className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">
              Număr total de locuri
            </h2>
          </div>

          <div className="flex items-center justify-center space-x-6 mb-8">
            {[1, 2, 3, 4, 5, 6, 7].map((num) => (
              <button
                key={num}
                onClick={() => setSeats(num)}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-medium ${
                  seats === num
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                }`}
              >
                {num}
              </button>
            ))}
          </div>

          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <div className="flex">
              <Info className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-800 text-sm">
                  Numărul de locuri reprezintă câți pasageri pot călători în mașina dvs. în același timp.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confortul pasagerilor
            </h3>
            
            <div className="space-y-4">
              <p className="text-gray-600 text-sm">
                Pentru confortul pasagerilor, limitați numărul de locuri pe bancheta din spate:
              </p>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setMaxBackSeats(2)}
                  className={`flex-1 py-3 px-4 rounded-lg border ${
                    maxBackSeats === 2
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-center">
                    <p className="font-medium">2 locuri în spate</p>
                    <p className="text-sm text-gray-500 mt-1">Confort maxim</p>
                  </div>
                </button>
                
                <button
                  onClick={() => setMaxBackSeats(3)}
                  className={`flex-1 py-3 px-4 rounded-lg border ${
                    maxBackSeats === 3
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-center">
                    <p className="font-medium">3 locuri în spate</p>
                    <p className="text-sm text-gray-500 mt-1">Standard</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleContinue}
          className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Check className="h-5 w-5 mr-2" />
          Continuă
        </button>
      </div>
    </div>
  );
}