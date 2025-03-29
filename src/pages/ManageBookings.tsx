import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import { Car, Calendar, Clock, Search, Filter, X, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { BookingApprovalCard } from '../components/BookingApprovalCard';

export function ManageBookings() {
  const { user } = useAuthStore();
  const [trips, setTrips] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);
  const [filter, setFilter] = useState('all'); // all, pending, accepted, rejected
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTripsAndBookings();
    }
  }, [user]);

  const fetchTripsAndBookings = async () => {
    try {
      setLoading(true);
      
      // Fetch all trips where the user is the driver
      const { data: tripsData, error: tripsError } = await supabase
        .from('trips')
        .select(`
          *,
          bookings(count)
        `)
        .eq('driver_id', user?.id)
        .order('date', { ascending: false });

      if (tripsError) throw tripsError;
      
      // Set trips and select the first one by default if available
      const tripsWithBookings = tripsData?.filter(trip => trip.bookings.count > 0) || [];
      setTrips(tripsWithBookings);
      
      if (tripsWithBookings.length > 0) {
        const firstTripId = tripsWithBookings[0].id;
        setSelectedTripId(firstTripId);
        
        // Fetch bookings for the first trip
        await fetchBookingsForTrip(firstTripId);
      } else {
        setBookings([]);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching trips and bookings:', error);
      toast.error('Nu s-au putut încărca călătoriile și rezervările');
      setLoading(false);
    }
  };

  const fetchBookingsForTrip = async (tripId: number) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          user:profiles!bookings_user_id_fkey(
            id,
            email,
            full_name,
            avatar_url,
            phone
          )
        `)
        .eq('trip_id', tripId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Nu s-au putut încărca rezervările');
    } finally {
      setLoading(false);
    }
  };

  const handleTripSelect = (tripId: number) => {
    setSelectedTripId(tripId);
    fetchBookingsForTrip(tripId);
  };

  const handleBookingStatusChange = () => {
    // Refresh bookings for the selected trip
    if (selectedTripId) {
      fetchBookingsForTrip(selectedTripId);
    }
  };

  const handleOpenChat = (userId: string) => {
    // This function would be passed from a parent component
    console.log('Open chat with user:', userId);
  };

  const getSelectedTrip = () => {
    return trips.find(trip => trip.id === selectedTripId);
  };

  const filteredBookings = bookings.filter(booking => {
    // Apply status filter
    if (filter !== 'all' && booking.status !== filter) {
      return false;
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        booking.user.full_name?.toLowerCase().includes(query) ||
        booking.user.email.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Gestionare rezervări</h1>
          <Link
            to="/offer-seats/departure"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Car className="h-4 w-4 mr-2" />
            Oferă un loc
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Trips Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Călătoriile mele</h2>
              
              {trips.length === 0 ? (
                <div className="text-center py-6">
                  <Car className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Nu aveți călătorii cu rezervări</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {trips.map((trip) => {
                    const pendingCount = trip.bookings.count;
                    return (
                      <button
                        key={trip.id}
                        onClick={() => handleTripSelect(trip.id)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          selectedTripId === trip.id
                            ? 'bg-blue-50 border border-blue-200'
                            : 'hover:bg-gray-50 border border-gray-200'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-gray-900">
                            {trip.from_city} → {trip.to_city}
                          </span>
                          {pendingCount > 0 && (
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                              {pendingCount}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          {trip.date}
                          <Clock className="h-4 w-4 ml-2 mr-1" />
                          {trip.time}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Bookings List */}
          <div className="lg:col-span-3">
            {trips.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nu aveți călătorii cu rezervări
                </h3>
                <p className="text-gray-600 mb-6">
                  Oferiți locuri în mașina dvs. pentru a primi rezervări de la pasageri.
                </p>
                <Link
                  to="/offer-seats/departure"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Oferă un loc
                </Link>
              </div>
            ) : selectedTripId ? (
              <>
                {/* Trip Summary */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-lg font-medium text-gray-900">
                        {getSelectedTrip()?.from_city} → {getSelectedTrip()?.to_city}
                      </h2>
                      <div className="flex items-center text-gray-500 mt-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        {getSelectedTrip()?.date}
                        <Clock className="h-4 w-4 ml-3 mr-1" />
                        {getSelectedTrip()?.time}
                        <Users className="h-4 w-4 ml-3 mr-1" />
                        {getSelectedTrip()?.seats} locuri
                      </div>
                    </div>
                    
                    <div className="mt-4 md:mt-0">
                      <div className="flex space-x-2">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Caută pasageri..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-8 pr-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                          />
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                          {searchQuery && (
                            <button
                              onClick={() => setSearchQuery('')}
                              className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        
                        <div className="relative">
                          <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="flex items-center px-3 py-2 border rounded-md bg-white hover:bg-gray-50"
                          >
                            <Filter className="h-4 w-4" />
                          </button>
                          
                          {isFilterOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 py-1">
                              <button
                                onClick={() => {
                                  setFilter('all');
                                  setIsFilterOpen(false);
                                }}
                                className={`block px-4 py-2 text-sm w-full text-left ${
                                  filter === 'all' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                Toate rezervările
                              </button>
                              <button
                                onClick={() => {
                                  setFilter('pending');
                                  setIsFilterOpen(false);
                                }}
                                className={`block px-4 py-2 text-sm w-full text-left ${
                                  filter === 'pending' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                În așteptare
                              </button>
                              <button
                                onClick={() => {
                                  setFilter('accepted');
                                  setIsFilterOpen(false);
                                }}
                                className={`block px-4 py-2 text-sm w-full text-left ${
                                  filter === 'accepted' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                Acceptate
                              </button>
                              <button
                                onClick={() => {
                                  setFilter('rejected');
                                  setIsFilterOpen(false);
                                }}
                                className={`block px-4 py-2 text-sm w-full text-left ${
                                  filter === 'rejected' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                Respinse
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Active filters */}
                  {filter !== 'all' && (
                    <div className="mt-3 flex items-center">
                      <span className="text-sm text-gray-500 mr-2">Filtre active:</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {filter === 'pending' ? 'În așteptare' : 
                         filter === 'accepted' ? 'Acceptate' : 'Respinse'}
                        <button
                          onClick={() => setFilter('all')}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Bookings List */}
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : filteredBookings.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nu există rezervări
                    </h3>
                    <p className="text-gray-600">
                      {searchQuery || filter !== 'all' 
                        ? 'Nu am găsit rezervări care să corespundă criteriilor de căutare sau filtrelor aplicate.' 
                        : 'Nu există încă rezervări pentru această călătorie.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredBookings.map((booking) => (
                      <BookingApprovalCard
                        key={booking.id}
                        booking={booking}
                        trip={getSelectedTrip()}
                        onStatusChange={handleBookingStatusChange}
                        onOpenChat={handleOpenChat}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Selectați o călătorie
                </h3>
                <p className="text-gray-600">
                  Alegeți o călătorie din lista din stânga pentru a vedea rezervările.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}