import React from 'react';
import { ArrowUpDown, Car, Bus, Clock, Users, Star, Cigarette, Music, Dog } from 'lucide-react';

interface Filters {
  priceRange: [number, number];
  sortBy: 'date_asc' | 'date_desc' | 'price_asc' | 'price_desc' | 'seats_asc' | 'seats_desc';
  vehicleType: 'all' | 'car' | 'bus';
  departureTime: 'all' | 'morning' | 'afternoon' | 'evening' | 'night';
  minSeats: number;
  minRating: number;
  preferences: {
    smoking: boolean;
    music: boolean;
    pets: boolean;
  };
}

interface TripFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  onReset: () => void;
}

export function TripFilters({ filters, onChange, onReset }: TripFiltersProps) {
  const handlePriceChange = (min: number, max: number) => {
    onChange({
      ...filters,
      priceRange: [min, max]
    });
  };

  const handleSortChange = (sortBy: Filters['sortBy']) => {
    onChange({
      ...filters,
      sortBy
    });
  };

  const handleVehicleTypeChange = (type: Filters['vehicleType']) => {
    onChange({
      ...filters,
      vehicleType: type
    });
  };

  const handleDepartureTimeChange = (time: Filters['departureTime']) => {
    onChange({
      ...filters,
      departureTime: time
    });
  };

  const handleSeatsChange = (seats: number) => {
    onChange({
      ...filters,
      minSeats: seats
    });
  };

  const handleRatingChange = (rating: number) => {
    onChange({
      ...filters,
      minRating: rating
    });
  };

  const handlePreferenceChange = (preference: keyof Filters['preferences']) => {
    onChange({
      ...filters,
      preferences: {
        ...filters.preferences,
        [preference]: !filters.preferences[preference]
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Filtre</h3>
        <button
          type="button"
          onClick={onReset}
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
        >
          <ArrowUpDown className="h-4 w-4 mr-1" />
          Resetează
        </button>
      </div>
      
      <div className="space-y-4">
        {/* Vehicle Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tip vehicul</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleVehicleTypeChange('all')}
              className={`flex-1 min-w-[80px] flex items-center justify-center px-2 py-1.5 rounded-md text-sm ${
                filters.vehicleType === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>Toate</span>
            </button>
            <button
              onClick={() => handleVehicleTypeChange('car')}
              className={`flex-1 min-w-[80px] flex items-center justify-center px-2 py-1.5 rounded-md text-sm ${
                filters.vehicleType === 'car'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Car className="h-4 w-4 mr-1" />
              <span>Mașină</span>
            </button>
            <button
              onClick={() => handleVehicleTypeChange('bus')}
              className={`flex-1 min-w-[80px] flex items-center justify-center px-2 py-1.5 rounded-md text-sm ${
                filters.vehicleType === 'bus'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Bus className="h-4 w-4 mr-1" />
              <span>Autobus</span>
            </button>
          </div>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Preț (MDL)</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="price-min" className="sr-only">Preț minim</label>
              <input
                type="number"
                id="price-min"
                name="price-min"
                value={filters.priceRange[0]}
                onChange={(e) => handlePriceChange(parseInt(e.target.value) || 0, filters.priceRange[1])}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-1.5"
                placeholder="Min"
                min="0"
                aria-label="Preț minim"
              />
            </div>
            <div>
              <label htmlFor="price-max" className="sr-only">Preț maxim</label>
              <input
                type="number"
                id="price-max"
                name="price-max"
                value={filters.priceRange[1]}
                onChange={(e) => handlePriceChange(filters.priceRange[0], parseInt(e.target.value) || 1000)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-1.5"
                placeholder="Max"
                min="0"
                aria-label="Preț maxim"
              />
            </div>
          </div>
        </div>

        {/* Departure Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ora plecării</label>
          <select
            value={filters.departureTime}
            onChange={(e) => handleDepartureTimeChange(e.target.value as Filters['departureTime'])}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-1.5"
          >
            <option value="all">Toate orele</option>
            <option value="morning">Dimineața (5:00 - 12:00)</option>
            <option value="afternoon">După-amiaza (12:00 - 17:00)</option>
            <option value="evening">Seara (17:00 - 22:00)</option>
            <option value="night">Noaptea (22:00 - 5:00)</option>
          </select>
        </div>

        {/* Minimum Seats */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Locuri minime</label>
          <div className="relative">
            <Users className="absolute left-2.5 top-2 h-4 w-4 text-gray-400" />
            <select
              value={filters.minSeats}
              onChange={(e) => handleSeatsChange(parseInt(e.target.value))}
              className="block w-full pl-8 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-1.5"
            >
              <option value={1}>1 loc</option>
              <option value={2}>2 locuri</option>
              <option value={3}>3 locuri</option>
              <option value={4}>4 locuri</option>
              <option value={5}>5 locuri</option>
              <option value={6}>6 locuri</option>
              <option value={7}>7 locuri</option>
              <option value={8}>8 locuri</option>
            </select>
          </div>
        </div>

        {/* Driver Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Rating minim șofer</label>
          <div className="relative">
            <Star className="absolute left-2.5 top-2 h-4 w-4 text-gray-400" />
            <select
              value={filters.minRating}
              onChange={(e) => handleRatingChange(parseInt(e.target.value))}
              className="block w-full pl-8 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-1.5"
            >
              <option value={0}>Toate ratingurile</option>
              <option value={4}>4+ stele</option>
              <option value={4.5}>4.5+ stele</option>
            </select>
          </div>
        </div>

        {/* Trip Preferences */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Preferințe călătorie</label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.preferences.smoking}
                onChange={() => handlePreferenceChange('smoking')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700 flex items-center">
                <Cigarette className="h-4 w-4 mr-1" />
                Fumat permis
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.preferences.music}
                onChange={() => handlePreferenceChange('music')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700 flex items-center">
                <Music className="h-4 w-4 mr-1" />
                Muzică permisă
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.preferences.pets}
                onChange={() => handlePreferenceChange('pets')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700 flex items-center">
                <Dog className="h-4 w-4 mr-1" />
                Animale de companie permise
              </span>
            </label>
          </div>
        </div>

        {/* Sort By */}
        <div>
          <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 mb-2">Sortare</label>
          <select
            id="sort-by"
            name="sort-by"
            value={filters.sortBy}
            onChange={(e) => handleSortChange(e.target.value as Filters['sortBy'])}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-1.5"
          >
            <option value="date_asc">Data (crescător)</option>
            <option value="date_desc">Data (descrescător)</option>
            <option value="price_asc">Preț (crescător)</option>
            <option value="price_desc">Preț (descrescător)</option>
            <option value="seats_asc">Locuri (crescător)</option>
            <option value="seats_desc">Locuri (descrescător)</option>
          </select>
        </div>
      </div>
    </div>
  );
}