import React, { useState, useEffect } from 'react';
import { useSearchStore } from '../lib/store';
import { TripCard } from '../components/TripCard';
import { TripFilters } from '../components/TripFilters';
import { supabase } from '../lib/supabase';
import { Trip } from '../lib/types';
import { Car } from 'lucide-react';
import toast from 'react-hot-toast';

export function TripsListing() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [isShowingAllTrips, setIsShowingAllTrips] = useState(false);
  const searchParams = useSearchStore();
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    minSeats: '',
    sortBy: 'date_asc'
  });

  useEffect(() => {
    fetchTrips();
  }, [searchParams, filters]);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      setIsShowingAllTrips(false);
      
      let query = supabase
        .from('trips')
        .select(`
          *,
          driver:profiles!trips_driver_id_fkey(
            id,
            email,
            full_name,
            avatar_url
          ),
          bookings(
            id,
            status
          )
        `);

      // Apply search filters if they exist
      if (searchParams.from) {
        query = query.ilike('from_city', `%${searchParams.from}%`);
      }
      if (searchParams.to) {
        query = query.ilike('to_city', `%${searchParams.to}%`);
      }
      if (searchParams.date) {
        query = query.eq('date', searchParams.date);
      }

      // Apply price filters
      if (filters.minPrice) {
        query = query.gte('price', parseInt(filters.minPrice));
      }
      if (filters.maxPrice) {
        query = query.lte('price', parseInt(filters.maxPrice));
      }

      const { data: searchResults, error } = await query;

      if (error) throw error;

      // If no results found with search criteria, fetch all trips
      let allTrips = searchResults || [];
      
      if (allTrips.length === 0 && (searchParams.from || searchParams.to || searchParams.date)) {
        setIsShowingAllTrips(true);
        const { data: fallbackTrips, error: fallbackError } = await supabase
          .from('trips')
          .select(`
            *,
            driver:profiles!trips_driver_id_fkey(
              id,
              email,
              full_name,
              avatar_url
            ),
            bookings(
              id,
              status
            )
          `);

        if (fallbackError) throw fallbackError;
        allTrips = fallbackTrips || [];
      }

      // Apply seats filter
      let filteredTrips = allTrips;
      if (filters.minSeats) {
        const minSeats = parseInt(filters.minSeats);
        filteredTrips = filteredTrips.filter(trip => {
          const acceptedBookings = trip.bookings.filter(b => b.status === 'accepted').length;
          return (trip.seats - acceptedBookings) >= minSeats;
        });
      }

      // Apply sorting
      filteredTrips.sort((a, b) => {
        const aAcceptedBookings = a.bookings.filter(b => b.status === 'accepted').length;
        const bAcceptedBookings = b.bookings.filter(b => b.status === 'accepted').length;
        const aAvailableSeats = a.seats - aAcceptedBookings;
        const bAvailableSeats = b.seats - bAcceptedBookings;

        switch (filters.sortBy) {
          case 'date_asc':
            return new Date(`${a.date} ${a.time}`).getTime() - new Date(`${b.date} ${b.time}`).getTime();
          case 'date_desc':
            return new Date(`${b.date} ${b.time}`).getTime() - new Date(`${a.date} ${a.time}`).getTime();
          case 'price_asc':
            return a.price - b.price;
          case 'price_desc':
            return b.price - a.price;
          case 'seats_asc':
            return aAvailableSeats - bAvailableSeats;
          case 'seats_desc':
            return bAvailableSeats - aAvailableSeats;
          default:
            return 0;
        }
      });

      setTrips(filteredTrips);
    } catch (error) {
      console.error('Error fetching trips:', error);
      toast.error('Nu s-au putut încărca călătoriile. Vă rugăm încercați din nou.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      minSeats: '',
      sortBy: 'date_asc'
    });
  };

  const getHeaderText = () => {
    if (searchParams.from && searchParams.to) {
      return `${searchParams.from} → ${searchParams.to}`;
    }
    if (searchParams.from) {
      return `Călătorii din ${searchParams.from}`;
    }
    if (searchParams.to) {
      return `Călătorii spre ${searchParams.to}`;
    }
    return 'Toate călătoriile disponibile';
  };

  const getSubHeaderText = () => {
    if (isShowingAllTrips) {
      return 'Nu am găsit călătorii pentru căutarea dvs. Vă arătăm toate călătoriile disponibile.';
    }
    if (searchParams.date) {
      return `Data: ${searchParams.date}`;
    }
    return 'Găsiți călătoria perfectă pentru dvs.';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {getHeaderText()}
              </h1>
              <p className="text-gray-600 mt-1">
                {getSubHeaderText()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-medium text-gray-900">
                {trips.length} {trips.length === 1 ? 'călătorie găsită' : 'călătorii găsite'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <TripFilters
              filters={filters}
              onChange={setFilters}
              onReset={handleResetFilters}
            />
          </div>

          {/* Trips List */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : trips.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nu am găsit călătorii
                </h3>
                <p className="text-gray-600">
                  Încercați să modificați criteriile de căutare sau filtrele aplicate
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {trips.map((trip) => (
                  <TripCard key={trip.id} trip={trip} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}