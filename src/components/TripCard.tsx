import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Clock, Users, Star, ArrowRight, Car, Bus, Cigarette, Music, Package, MessageCircle } from 'lucide-react';
import type { Trip } from '../lib/types';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

interface TripCardProps {
  trip: Trip;
}

export function TripCard({ trip }: TripCardProps) {
  const { t } = useTranslation();
  
  // Format date with capitalized first letters
  const formattedDate = format(new Date(trip.departure_date), 'EEEE, d MMMM yyyy', { locale: ro });
  const formattedTime = trip.departure_time;

  const VehicleIcon = trip.vehicle_type === 'bus' ? Bus : Car;

  return (
    <Link
      to={`/trip/${trip.id}`}
      className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border-2 border-gray-100 hover:border-blue-200 group"
    >
      <div className="p-6">
        <div className="flex items-start justify-between">
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
            <p className="text-sm text-blue-600/80">{t('trips.tripCard.perSeat')}</p>
          </div>
        </div>

        {/* Middle Section - Driver Info */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center">
            <img
              src={trip.driver.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(trip.driver.full_name)}`}
              alt={trip.driver.full_name}
              className="h-10 w-10 rounded-full"
            />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{trip.driver.full_name}</p>
              <p className="text-sm text-gray-500">
                {trip.available_seats > 0 
                  ? t('trips.tripCard.availableSeats', { count: trip.available_seats })
                  : t('trips.tripCard.noSeats')}
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700">
              {t('trips.tripCard.viewDetails')}
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
              {t('trips.tripCard.bookNow')}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section - Trip Details */}
      <div className="p-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center text-gray-600">
            <Package className="h-5 w-5 mr-2" />
            <span className="text-sm">{t('trips.filters.baggage')}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <MessageCircle className="h-5 w-5 mr-2" />
            <span className="text-sm">{t('trips.filters.responseTime')}</span>
          </div>
          <div className="flex items-center text-gray-600" title={t('trips.filters.smokingForbidden')}>
            <Cigarette className="h-5 w-5 mr-2" />
            <span className="text-sm">{t('trips.filters.smokingForbidden')}</span>
          </div>
          <div className="flex items-center text-gray-600" title={t('trips.filters.musicAllowed')}>
            <Music className="h-5 w-5 mr-2" />
            <span className="text-sm">{t('trips.filters.musicAllowed')}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}