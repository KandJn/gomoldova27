import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Clock, Users, Star, ArrowRight, Car, Bus, Cigarette, Music, Package, MessageCircle } from 'lucide-react';
import type { Trip } from '../lib/types';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

interface TripCardProps {
  trip: Trip;
}

export function TripCard({ trip }: TripCardProps) {
  // Format date with capitalized first letters
  const formattedDate = format(new Date(trip.departure_date), 'eeee, d MMMM', { locale: ro })
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Format time to HH:mm
  const formattedTime = trip.departure_time.split(':').slice(0, 2).join(':');

  const VehicleIcon = trip.vehicle_type === 'car' ? Car : Bus;

  return (
    <Link
      to={`/trip/${trip.id}`}
      className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border-2 border-gray-100 hover:border-blue-200 group"
    >
      {/* Top Section - Route and Time */}
      <div className="bg-gray-50 p-5 border-b border-gray-100">
        <div className="flex items-start gap-4">
          {/* Route and Details */}
          <div className="flex-1 min-w-0">
            {/* Cities */}
            <div className="flex items-center mb-4">
              <div className="flex items-center min-w-0">
                <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0 mr-2" />
                <p className="text-lg font-semibold text-gray-900 truncate">{trip.from_city}</p>
                <ArrowRight className="h-5 w-5 text-gray-400 flex-shrink-0 mx-2" />
                <MapPin className="h-5 w-5 text-green-600 flex-shrink-0 mr-2" />
                <p className="text-lg font-semibold text-gray-900 truncate">{trip.to_city}</p>
              </div>
            </div>

            {/* Date and Time */}
            <div className="flex items-center space-x-6 text-gray-700">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                <span className="text-base">{formattedDate}</span>
              </div>
              <div className="flex items-center text-gray-900">
                <Clock className="h-5 w-5 mr-2" />
                <span className="text-base font-medium">{formattedTime}</span>
              </div>
              <div className="flex items-center text-gray-900">
                <VehicleIcon className="h-5 w-5 mr-2" />
                <span className="text-base font-medium capitalize">{trip.vehicle_type}</span>
              </div>
            </div>
          </div>

          {/* Price Badge */}
          <div className="bg-blue-50 px-4 py-2 rounded-lg text-center">
            <p className="text-2xl font-bold text-blue-600 group-hover:text-blue-700">
              {trip.price} <span className="text-base font-normal">MDL</span>
            </p>
            <p className="text-sm text-blue-600/80">per loc</p>
          </div>
        </div>
      </div>

      {/* Middle Section - Driver Info */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-start justify-between gap-6">
          {/* Driver Info */}
          <div className="flex items-center space-x-4">
            <img
              src={trip.driver.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(trip.driver.email)}&background=e5e7eb&color=4b5563`}
              alt={trip.driver.email}
              className="w-14 h-14 rounded-full border-2 border-gray-100"
            />
            <div>
              <p className="text-lg font-medium text-gray-900">
                {trip.driver.full_name || trip.driver.email}
              </p>
              <div className="flex items-center mt-1">
                <Star className="h-4 w-4 text-yellow-400" />
                <span className="text-sm text-gray-600 ml-1">4.8 • {trip.bookings.length} călătorii</span>
              </div>
            </div>
          </div>

          {/* Seats Badge */}
          <div className="flex items-center px-4 py-2 bg-green-50 rounded-lg">
            <Users className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-base font-medium text-green-700">
              {trip.available_seats} {trip.available_seats === 1 ? 'loc disponibil' : 'locuri disponibile'}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Section - Trip Details */}
      <div className="p-5">
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
      </div>
    </Link>
  );
}