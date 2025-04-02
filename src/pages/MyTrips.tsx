import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { Loader2, MapPin, Calendar, Clock, CreditCard, User, Car, Bus, Search, Filter, SortAsc, SortDesc, Eye, MessageCircle, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Modal, Badge, Spinner } from 'flowbite-react';

interface Trip {
  id: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
  amount_paid: number;
  trip: {
    id: string;
    from_city: string;
    to_city: string;
    departure_date: string;
    departure_time: string;
    price: number;
    available_seats: number;
    driver: {
      full_name: string;
      avatar_url: string | null;
      rating: number;
    };
    car: {
      brand: string;
      model: string;
      color: string;
      plate_number: string;
    };
    company?: {
      company_name: string;
      logo_url: string | null;
    };
  };
}

export function MyTrips() {
  const { t } = useTranslation();
  const { user, profile } = useAuthStore();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'price'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [showTripModal, setShowTripModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const loadProfile = async () => {
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        if (profileData) {
          fetchTrips(profileData.id);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        setError(t('errors.profileLoad'));
        toast.error(t('errors.profileLoad'));
      }
    };

    loadProfile();
  }, [user]);

  const fetchTrips = async (userId: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          status,
          created_at,
          amount_paid,
          trips!inner (
            id,
            from_city,
            to_city,
            departure_date,
            departure_time,
            price,
            available_seats,
            profiles!inner (
              full_name,
              avatar_url
            ),
            cars!inner (
              brand,
              model,
              color,
              plate_number
            ),
            bus_companies (
              company_name,
              logo_url
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const validTrips = (data || []).filter(booking => booking.trips);
      setTrips(validTrips.map(booking => ({
        ...booking,
        trip: {
          ...booking.trips,
          driver: {
            ...booking.trips.profiles,
            rating: 0 // Default rating since it's not in the database
          }
        }
      })));
    } catch (error) {
      console.error('Error fetching trips:', error);
      setError(t('errors.tripsLoad'));
      toast.error(t('errors.tripsLoad'));
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: Trip['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Trip['status']) => {
    switch (status) {
      case 'pending':
        return t('trips.status.pending');
      case 'confirmed':
        return t('trips.status.confirmed');
      case 'completed':
        return t('trips.status.completed');
      case 'cancelled':
        return t('trips.status.cancelled');
      default:
        return status;
    }
  };

  const filterTrips = (type: 'upcoming' | 'past') => {
    const now = new Date();
    return trips.filter(trip => {
      if (!trip.trip?.departure_date) return false;
      const tripDate = new Date(trip.trip.departure_date);
      return type === 'upcoming' ? tripDate >= now : tripDate < now;
    });
  };

  const filteredAndSortedTrips = () => {
    let result = filterTrips(activeTab);

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(trip => 
        trip.trip.from_city.toLowerCase().includes(query) ||
        trip.trip.to_city.toLowerCase().includes(query) ||
        trip.trip.driver.full_name.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      const aDate = new Date(a.trip.departure_date);
      const bDate = new Date(b.trip.departure_date);
      
      if (sortBy === 'date') {
        return sortOrder === 'asc' 
          ? aDate.getTime() - bDate.getTime()
          : bDate.getTime() - aDate.getTime();
      } else {
        return sortOrder === 'asc'
          ? a.amount_paid - b.amount_paid
          : b.amount_paid - a.amount_paid;
      }
    });

    return result;
  };

  const handleViewTrip = (trip: Trip) => {
    setSelectedTrip(trip);
    setShowTripModal(true);
  };

  const handleContactDriver = (trip: Trip) => {
    // Implement chat functionality
    navigate(`/messages?user=${trip.trip.driver.full_name}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Spinner size="xl" />
          <span className="text-gray-600">{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">{t('myTrips.title')}</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder={t('myTrips.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              color="light"
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="px-3"
            >
              {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
            </Button>
            <Button
              color="light"
              onClick={() => setSortBy(prev => prev === 'date' ? 'price' : 'date')}
              className="px-3"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'upcoming'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('myTrips.upcoming')}
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'past'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('myTrips.past')}
            </button>
          </nav>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredAndSortedTrips().length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {activeTab === 'upcoming'
                  ? t('myTrips.noUpcoming')
                  : t('myTrips.noPast')}
              </p>
            </div>
          ) : (
            filteredAndSortedTrips().map((booking) => (
              <div key={booking.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-gray-500" />
                        <span className="font-medium">
                          {booking.trip?.from_city} → {booking.trip?.to_city}
                        </span>
                      </div>
                      <Badge color={getStatusColor(booking.status)}>
                        {getStatusText(booking.status)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>
                          {booking.trip?.departure_date 
                            ? format(new Date(booking.trip.departure_date), 'EEEE, d MMMM yyyy', { locale: ro })
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span>{booking.trip?.departure_time || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-gray-500" />
                        <span>{booking.amount_paid ? `${booking.amount_paid} MDL` : 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span>{booking.trip?.driver?.rating?.toFixed(1) || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span>{t('myTrips.driver')}: {booking.trip?.driver?.full_name || 'N/A'}</span>
                      </div>
                      {booking.trip?.car && (
                        <div className="flex items-center gap-2">
                          <Car className="w-4 h-4 text-gray-500" />
                          <span>
                            {[
                              booking.trip.car.brand,
                              booking.trip.car.model,
                              booking.trip.car.color,
                              booking.trip.car.plate_number
                            ].filter(Boolean).join(' • ') || 'N/A'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      color="light"
                      onClick={() => handleViewTrip(booking)}
                      className="px-3"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      color="light"
                      onClick={() => handleContactDriver(booking)}
                      className="px-3"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Trip Details Modal */}
      <Modal
        show={showTripModal}
        onClose={() => setShowTripModal(false)}
        size="xl"
        title={t('myTrips.tripDetails')}
      >
        {selectedTrip && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">{t('myTrips.from')}</h3>
                <p className="mt-1 text-lg font-medium">{selectedTrip.trip.from_city}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">{t('myTrips.to')}</h3>
                <p className="mt-1 text-lg font-medium">{selectedTrip.trip.to_city}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">{t('myTrips.date')}</h3>
                <p className="mt-1 text-lg font-medium">
                  {format(new Date(selectedTrip.trip.departure_date), 'EEEE, d MMMM yyyy', { locale: ro })}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">{t('myTrips.time')}</h3>
                <p className="mt-1 text-lg font-medium">{selectedTrip.trip.departure_time}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">{t('myTrips.price')}</h3>
                <p className="mt-1 text-lg font-medium">{selectedTrip.amount_paid} MDL</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">{t('myTrips.status')}</h3>
                <Badge color={getStatusColor(selectedTrip.status)} className="mt-1">
                  {getStatusText(selectedTrip.status)}
                </Badge>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium mb-4">{t('myTrips.driverInfo')}</h3>
              <div className="flex items-center gap-4">
                {selectedTrip.trip.driver.avatar_url && (
                  <img
                    src={selectedTrip.trip.driver.avatar_url}
                    alt={selectedTrip.trip.driver.full_name}
                    className="w-12 h-12 rounded-full"
                  />
                )}
                <div>
                  <p className="font-medium">{selectedTrip.trip.driver.full_name}</p>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span>{selectedTrip.trip.driver.rating?.toFixed(1) || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            {selectedTrip.trip.car && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium mb-4">{t('myTrips.vehicleInfo')}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">{t('myTrips.vehicle')}</h4>
                    <p className="mt-1">
                      {selectedTrip.trip.car.brand} {selectedTrip.trip.car.model}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">{t('myTrips.color')}</h4>
                    <p className="mt-1">{selectedTrip.trip.car.color}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">{t('myTrips.plate')}</h4>
                    <p className="mt-1">{selectedTrip.trip.car.plate_number}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}