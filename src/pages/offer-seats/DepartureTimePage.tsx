import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Check, Clock } from 'lucide-react';
import { format, addHours, setHours, setMinutes } from 'date-fns';
import { ro } from 'date-fns/locale';

export function DepartureTimePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedTime, setSelectedTime] = useState<string>('08:00');
  
  const departureData = location.state?.departure;
  const arrivalData = location.state?.arrival;
  const routeData = location.state?.route;
  const stopoversData = location.state?.stopovers;
  const dateData = location.state?.date;

  useEffect(() => {
    // Set default time to current time rounded to nearest hour
    const now = new Date();
    const nextHour = addHours(setMinutes(setHours(now, now.getHours()), 0), 1);
    setSelectedTime(format(nextHour, 'HH:mm'));
  }, []);

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleContinue = () => {
    navigate('/offer-seats/seats', {
      state: {
        departure: departureData,
        arrival: arrivalData,
        route: routeData,
        stopovers: stopoversData,
        date: dateData,
        time: selectedTime
      }
    });
  };

  const timeSlots = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
    '20:00', '21:00', '22:00'
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'EEEE, d MMMM yyyy', { locale: ro });
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
            La ce oră plecați?
          </h1>
          <p className="mt-2 text-gray-600">
            {dateData && `Data: ${formatDate(dateData)}`}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-center mb-6">
            <Clock className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">
              Ora de plecare
            </h2>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {timeSlots.map((time) => (
              <button
                key={time}
                onClick={() => handleTimeSelect(time)}
                className={`py-3 px-4 rounded-lg border text-center transition-colors ${
                  selectedTime === time
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400 text-gray-700'
                }`}
              >
                {time}
              </button>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center">
              <label className="block text-sm font-medium text-gray-700 mr-4">
                Oră personalizată:
              </label>
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
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