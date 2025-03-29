import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../lib/store';
import {
  Car,
  Search,
  Filter,
  X,
  Check,
  Ban,
  Eye,
  MapPin,
  Shield,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

export function Trips() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, completed, cancelled
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'cancel' | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    checkAdminAccess();
    if (user?.email === 'asassin.damian@gmail.com') {
      fetchTrips();
    }
  }, [user, filter]);

  const checkAdminAccess = () => {
    if (user?.email !== 'asassin.damian@gmail.com') {
      toast.error('Acces neautorizat');
      navigate('/');
      return;
    }
  };

  const fetchTrips = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('trips')
        .select(`
          *,
          bus:buses!trips_bus_id_fkey(
            id,
            registration_number,
            model
          ),
          company:bus_companies!trips_company_id_fkey(
            id,
            company_name,
            email,
            phone,
            logo_url
          ),
          driver:profiles!trips_driver_id_fkey(
            id,
            full_name,
            avatar_url,
            id_verified
          ),
          bookings(
            id,
            status
          )
        `)
        .order('departure_date', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      setTrips(data || []);
    } catch (error) {
      console.error('Error fetching trips:', error);
      toast.error('Eroare la încărcarea călătoriilor');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selectedTrip || !actionReason) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('trips')
        .update({ 
          status: 'cancelled',
          cancellation_reason: actionReason,
          cancelled_at: new Date().toISOString()
        })
        .eq('id', selectedTrip.id);

      if (error) throw error;
      toast.success('Călătorie anulată');

      fetchTrips();
      setIsActionModalOpen(false);
      setSelectedTrip(null);
      setActionType(null);
      setActionReason('');
    } catch (error) {
      console.error('Error performing action:', error);
      toast.error('Eroare la executarea acțiunii');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTrips = trips.filter(trip => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        trip.from_city.toLowerCase().includes(query) ||
        trip.to_city.toLowerCase().includes(query) ||
        trip.driver.full_name.toLowerCase().includes(query) ||
        trip.driver.email.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const isPast = (date: string) => {
    return new Date(date) < new Date();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Gestionare călătorii
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Administrați și monitorizați călătoriile
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Căutare călătorie..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center px-4 py-2 border rounded-lg bg-white hover:bg-gray-50"
              >
                <Filter className="h-5 w-5 mr-2" />
                Filtrează
              </button>
              
              {isFilterOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 py-1">
                  <button
                    onClick={() => {
                      setFilter('all');
                      setIsFilterOpen(false);
                    }}
                    className={`block px-4 py-2 text-sm w-full text-left ${
                      filter === 'all' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Toate călătoriile
                  </button>
                  <button
                    onClick={() => {
                      setFilter('active');
                      setIsFilterOpen(false);
                    }}
                    className={`block px-4 py-2 text-sm w-full text-left ${
                      filter === 'active' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => {
                      setFilter('completed');
                      setIsFilterOpen(false);
                    }}
                    className={`block px-4 py-2 text-sm w-full text-left ${
                      filter === 'completed' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Finalizate
                  </button>
                  <button
                    onClick={() => {
                      setFilter('cancelled');
                      setIsFilterOpen(false);
                    }}
                    className={`block px-4 py-2 text-sm w-full text-left ${
                      filter === 'cancelled' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Anulate
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredTrips.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nu am găsit călătorii
            </h3>
            <p className="text-gray-600">
              {searchQuery
                ? 'Nu am găsit călătorii care să corespundă criteriilor de căutare.'
                : 'Nu există călătorii în această categorie.'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Șofer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Călătorie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acțiuni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTrips.map((trip) => {
                  const acceptedBookings = trip.bookings.filter((b: any) => b.status === 'accepted');
                  const isPastTrip = isPast(trip.departure_date);
                  
                  return (
                    <tr key={trip.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {trip.company ? (
                              <img
                                className="h-10 w-10 rounded-full"
                                src={trip.company?.logo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(trip.company?.company_name || '')}`}
                                alt=""
                              />
                            ) : (
                              <img
                                className="h-10 w-10 rounded-full"
                                src={trip.driver?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(trip.driver?.full_name || '')}`}
                                alt=""
                              />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <div className="text-sm font-medium text-gray-900">
                                {trip.company ? (
                                  <>
                                    {trip.company.company_name}
                                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      Bus Company
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    {trip.driver?.full_name}
                                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      Personal Trip
                                    </span>
                                    {trip.driver?.id_verified && (
                                      <Check className="h-4 w-4 text-green-500 ml-1" />
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="text-sm text-gray-500">
                              {trip.company ? trip.company.email : trip.driver?.email}
                            </div>
                            {trip.company && (
                              <div className="text-sm text-gray-500">
                                Bus: {trip.bus?.model} ({trip.bus?.registration_number})
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {trip.from_city} → {trip.to_city}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {acceptedBookings.length}/{trip.seats} locuri ocupate
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {format(new Date(trip.departure_date), 'PPP', { locale: ro })}
                        </div>
                        <div className="text-sm text-gray-500">
                          {trip.departure_time}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-2">
                          {trip.status === 'cancelled' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <Ban className="h-3 w-3 mr-1" />
                              Anulată
                            </span>
                          ) : isPastTrip ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              <Check className="h-3 w-3 mr-1" />
                              Finalizată
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <Clock className="h-3 w-3 mr-1" />
                              Activă
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => navigate(`/trip/${trip.id}`)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          {!isPastTrip && trip.status !== 'cancelled' && (
                            <button
                              onClick={() => {
                                setSelectedTrip(trip);
                                setActionType('cancel');
                                setIsActionModalOpen(true);
                              }}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Ban className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Action Modal */}
        {isActionModalOpen && selectedTrip && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Anulare călătorie
                </h3>
                <button
                  onClick={() => {
                    setIsActionModalOpen(false);
                    setSelectedTrip(null);
                    setActionType(null);
                    setActionReason('');
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-500">
                  Sunteți sigur că doriți să anulați această călătorie? Această acțiune va notifica toți pasagerii.
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Motiv anulare
                </label>
                <textarea
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Introduceți motivul anulării..."
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setIsActionModalOpen(false);
                    setSelectedTrip(null);
                    setActionType(null);
                    setActionReason('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Înapoi
                </button>
                <button
                  onClick={handleAction}
                  disabled={isSubmitting || !actionReason.trim()}
                  className="px-4 py-2 border border-transparent rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    'Anulează călătoria'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}