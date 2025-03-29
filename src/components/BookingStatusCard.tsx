import React from 'react';
import { Check, X, Clock, Calendar, MapPin, User, MessageCircle, Car } from 'lucide-react';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

interface BookingStatusCardProps {
  booking: any;
  trip: any;
  onOpenChat: (userId: string) => void;
}

export function BookingStatusCard({ booking, trip, onOpenChat }: BookingStatusCardProps) {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PPP', { locale: ro });
  };
  
  const getStatusBadge = () => {
    switch (booking.status.toLowerCase()) {
      case 'pending':
        return (
          <div className="flex items-center bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
            <Clock className="h-4 w-4 mr-1" />
            În așteptare
          </div>
        );
      case 'accepted':
      case 'confirmed':
        return (
          <div className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
            <Check className="h-4 w-4 mr-1" />
            Aprobată
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
            <X className="h-4 w-4 mr-1" />
            Respinsă
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-all-300">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img
              src={trip.driver.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(trip.driver.full_name || trip.driver.email)}`}
              alt={trip.driver.full_name || trip.driver.email}
              className="w-10 h-10 rounded-full mr-3"
            />
            <div>
              <h3 className="font-medium text-gray-900">{trip.driver.full_name || trip.driver.email}</h3>
              <p className="text-sm text-gray-500">
                Șofer
              </p>
            </div>
          </div>
          <div>
            {getStatusBadge()}
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-start">
            <Calendar className="h-5 w-5 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-500">Data călătoriei</p>
              <p className="font-medium">{formatDate(trip.date)}</p>
            </div>
          </div>
          <div className="flex items-start">
            <Clock className="h-5 w-5 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-500">Ora plecării</p>
              <p className="font-medium">{trip.time}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-start mb-4">
          <MapPin className="h-5 w-5 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <p className="text-sm text-gray-500">Ruta</p>
            <p className="font-medium">{trip.from_city} → {trip.to_city}</p>
          </div>
        </div>
        
        <div className="flex items-start mb-4">
          <User className="h-5 w-5 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <p className="text-sm text-gray-500">Locuri rezervate</p>
            <p className="font-medium">1 loc</p>
          </div>
        </div>
        
        <div className="flex items-start mb-4">
          <Car className="h-5 w-5 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <p className="text-sm text-gray-500">Preț</p>
            <p className="font-medium">{trip.price} MDL</p>
          </div>
        </div>
        
        {booking.status.toLowerCase() === 'pending' && (
          <div className="bg-yellow-50 p-3 rounded-lg mb-4">
            <p className="text-sm text-yellow-800">
              <Clock className="h-4 w-4 inline mr-1" />
              Cererea dvs. de rezervare este în așteptare. Veți fi notificat când șoferul o va aproba sau respinge.
            </p>
          </div>
        )}
        
        {(booking.status.toLowerCase() === 'accepted' || booking.status.toLowerCase() === 'confirmed') && (
          <div className="bg-green-50 p-3 rounded-lg mb-4">
            <p className="text-sm text-green-800">
              <Check className="h-4 w-4 inline mr-1" />
              Cererea dvs. de rezervare a fost aprobată! Vă rugăm să fiți la locul de întâlnire la ora stabilită.
            </p>
          </div>
        )}
        
        {booking.status.toLowerCase() === 'rejected' && (
          <div className="bg-red-50 p-3 rounded-lg mb-4">
            <p className="text-sm text-red-800">
              <X className="h-4 w-4 inline mr-1" />
              Cererea dvs. de rezervare a fost respinsă. Puteți căuta alte călătorii disponibile.
            </p>
          </div>
        )}
        
        <div className="flex justify-center mt-4">
          <button
            onClick={() => onOpenChat(trip.driver.id)}
            className="flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-all-300"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Chat cu șoferul
          </button>
        </div>
      </div>
    </div>
  );
}