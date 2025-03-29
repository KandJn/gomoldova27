import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { TripCard } from '../components/TripCard';
import { TripFilters } from '../components/TripFilters';
import { Car, Bus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDebug } from '../contexts/DebugContext';
import type { Trip as TripType } from '../lib/types';
import { useAuthStore } from '../lib/store';

interface SearchParams {
  fromCity: string;
  toCity: string;
  date: Date | null;
  seats: number;
}

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

export function TripsListing() {
  const [trips, setTrips] = useState<TripType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isShowingAllTrips, setIsShowingAllTrips] = useState(false);
  const [searchParams, setSearchParams] = useState<SearchParams>({
    fromCity: '',
    toCity: '',
    date: null,
    seats: 1
  });
  const [filters, setFilters] = useState<Filters>({
    priceRange: [0, 1000],
    sortBy: 'date_asc',
    vehicleType: 'all',
    departureTime: 'all',
    minSeats: 1,
    minRating: 0,
    preferences: {
      smoking: false,
      music: false,
      pets: false
    }
  });
  const { setDebugData } = useDebug();
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setIsLoading(true);
        setIsShowingAllTrips(false);
        
        let query = supabase
          .from('trips')
          .select(`
            *,
            driver:profiles!trips_driver_id_fkey (
              id,
              full_name,
              avatar_url,
              bio,
              travel_preferences,
              verification_status
            ),
            company:bus_companies!trips_company_id_fkey (
              id,
              company_name,
              email,
              phone,
              description
            ),
            bookings (
              id,
              status,
              user:profiles!bookings_user_id_fkey (
                id,
                full_name,
                avatar_url
              )
            )
          `);

        // Apply vehicle type filter
        if (filters.vehicleType === 'car') {
          query = query.is('company_id', null);
        } else if (filters.vehicleType === 'bus') {
          query = query.not('company_id', 'is', null);
        }

        // Apply search filters
        if (searchParams.fromCity) {
          query = query.ilike('from_city', `%${searchParams.fromCity}%`);
        }
        if (searchParams.toCity) {
          query = query.ilike('to_city', `%${searchParams.toCity}%`);
        }
        if (searchParams.date) {
          query = query.eq('departure_date', searchParams.date.toISOString().split('T')[0]);
        }

        const { data: searchResults, error } = await query;

        if (error) {
          console.error('Error fetching trips:', error);
          throw error;
        }

        // If no results found with search criteria, fetch all trips
        let allTrips = searchResults || [];
        
        if (allTrips.length === 0 && (searchParams.fromCity || searchParams.toCity || searchParams.date)) {
          setIsShowingAllTrips(true);
          const { data: fallbackTrips, error: fallbackError } = await supabase
            .from('trips')
            .select(`
              *,
              driver:profiles!trips_driver_id_fkey (
                id,
                full_name,
                avatar_url,
                bio,
                travel_preferences,
                verification_status
              ),
              company:bus_companies!trips_company_id_fkey (
                id,
                company_name,
                email,
                phone,
                description
              ),
              bookings (
                id,
                status,
                user:profiles!bookings_user_id_fkey (
                  id,
                  full_name,
                  avatar_url
                )
              )
            `)
            .gte('departure_date', new Date().toISOString().split('T')[0]);

          if (fallbackError) {
            console.error('Error fetching fallback trips:', fallbackError);
            throw fallbackError;
          }
          allTrips = fallbackTrips || [];
        }

        // Map the trips data
        const mappedTrips: TripType[] = allTrips.map(trip => {
          // Skip trips with missing essential data
          if (!trip.driver && !trip.company_id) {
            console.warn('Skipping trip with missing user/company data:', trip.id);
            return null;
          }

          return {
            id: trip.id,
            company_id: trip.company_id,
            from_city: trip.from_city,
            to_city: trip.to_city,
            from_address: trip.from_address || '',
            to_address: trip.to_address || '',
            from_coordinates: trip.from_coordinates,
            to_coordinates: trip.to_coordinates,
            departure_date: trip.departure_date,
            departure_time: trip.departure_time || '00:00',
            arrival_date: trip.arrival_date || trip.departure_date,
            arrival_time: trip.arrival_time || '00:00',
            price: trip.price,
            seats: trip.seats,
            available_seats: trip.seats - (trip.bookings?.filter((b: any) => b.status === 'accepted').length || 0),
            status: trip.status || 'scheduled',
            created_at: trip.created_at,
            vehicle_type: trip.company_id ? 'bus' : 'car',
            driver: trip.company_id ? {
              id: trip.company?.id || 'unknown',
              email: trip.company?.email || 'unknown@example.com',
              full_name: trip.company?.company_name || 'Unknown Company',
              phone: trip.company?.phone || '',
              bio: trip.company?.description || '',
              avatar_url: null,
              is_driver: true,
              id_number: null,
              driver_license: null,
              id_verified: false,
              license_verified: false,
              created_at: trip.created_at,
              verification_status: 'unverified',
              rating: 4.5 // Default rating for companies
            } : {
              id: trip.driver?.id || 'unknown',
              email: trip.driver?.id || 'unknown@example.com',
              full_name: trip.driver?.full_name || 'Unknown Driver',
              phone: trip.driver?.phone || '',
              bio: trip.driver?.bio || '',
              avatar_url: trip.driver?.avatar_url || null,
              is_driver: true,
              id_number: null,
              driver_license: null,
              id_verified: false,
              license_verified: false,
              created_at: trip.created_at,
              verification_status: trip.driver?.verification_status || 'unverified',
              rating: 4.5 // Default rating for drivers
            },
            bus: null,
            bookings: trip.bookings || [],
            preferences: trip.driver?.travel_preferences || {
              smoking: false,
              music: false,
              pets: false
            }
          } as TripType;
        }).filter((trip): trip is TripType => trip !== null);

        // Apply filters
        let filteredTrips = mappedTrips;

        // Apply price filter
        filteredTrips = filteredTrips.filter(trip => 
          trip.price >= filters.priceRange[0] && trip.price <= filters.priceRange[1]
        );

        // Apply seats filter
        if (filters.minSeats > 1) {
          filteredTrips = filteredTrips.filter(trip => 
            trip.available_seats >= filters.minSeats
          );
        }

        // Apply rating filter
        if (filters.minRating > 0) {
          filteredTrips = filteredTrips.filter(trip => 
            trip.driver.rating >= filters.minRating
          );
        }

        // Apply departure time filter
        if (filters.departureTime !== 'all') {
          filteredTrips = filteredTrips.filter(trip => {
            const hour = parseInt(trip.departure_time.split(':')[0]);
            switch (filters.departureTime) {
              case 'morning':
                return hour >= 5 && hour < 12;
              case 'afternoon':
                return hour >= 12 && hour < 17;
              case 'evening':
                return hour >= 17 && hour < 22;
              case 'night':
                return hour >= 22 || hour < 5;
              default:
                return true;
            }
          });
        }

        // Apply preferences filters
        if (filters.preferences.smoking) {
          filteredTrips = filteredTrips.filter(trip => trip.preferences.smoking);
        }
        if (filters.preferences.music) {
          filteredTrips = filteredTrips.filter(trip => trip.preferences.music);
        }
        if (filters.preferences.pets) {
          filteredTrips = filteredTrips.filter(trip => trip.preferences.pets);
        }

        // Apply sorting
        filteredTrips.sort((a, b) => {
          const aAcceptedBookings = a.bookings.filter(b => b.status === 'accepted').length;
          const bAcceptedBookings = b.bookings.filter(b => b.status === 'accepted').length;
          const aAvailableSeats = a.seats - aAcceptedBookings;
          const bAvailableSeats = b.seats - bAcceptedBookings;

          switch (filters.sortBy) {
            case 'date_asc':
              return new Date(`${a.departure_date} ${a.departure_time}`).getTime() - new Date(`${b.departure_date} ${b.departure_time}`).getTime();
            case 'date_desc':
              return new Date(`${b.departure_date} ${b.departure_time}`).getTime() - new Date(`${a.departure_date} ${a.departure_time}`).getTime();
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
        toast.error('Nu s-au putut încărca călătoriile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrips();
  }, [searchParams, filters]);

  const handleResetFilters = () => {
    setFilters({
      priceRange: [0, 1000],
      sortBy: 'date_asc',
      vehicleType: 'all',
      departureTime: 'all',
      minSeats: 1,
      minRating: 0,
      preferences: {
        smoking: false,
        music: false,
        pets: false
      }
    });
  };

  const getHeaderText = () => {
    if (searchParams.fromCity && searchParams.toCity) {
      return `${searchParams.fromCity} → ${searchParams.toCity}`;
    }
    if (searchParams.fromCity) {
      return `Călătorii din ${searchParams.fromCity}`;
    }
    if (searchParams.toCity) {
      return `Călătorii spre ${searchParams.toCity}`;
    }
    return 'Toate călătoriile disponibile';
  };

  const getSubHeaderText = () => {
    if (isShowingAllTrips) {
      return 'Nu au fost găsite călătorii pentru criteriile selectate. Afișăm toate călătoriile disponibile.';
    }
    return '';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {getHeaderText()}
          </h1>
          <p className="text-gray-600 mt-1">
            {getSubHeaderText()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <TripFilters
              filters={filters}
              onChange={setFilters}
              onReset={handleResetFilters}
            />
          </div>
        </div>

        {/* Trips List */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : trips.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {trips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Nu au fost găsite călătorii care să corespundă criteriilor de căutare.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}