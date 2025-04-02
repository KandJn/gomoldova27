import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import { BookingRequestCard } from '../components/BookingRequestCard';
import { Loader2, Filter, Search, SortAsc, SortDesc, Calendar, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button, Spinner, Badge } from 'flowbite-react';

export function BookingRequests() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          trip:trips (
            id,
            from_city,
            to_city,
            departure_date,
            departure_time,
            driver:profiles (
              id,
              full_name,
              avatar_url
            ),
            car:cars (
              brand,
              model,
              color,
              plate_number
            )
          ),
          profiles (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error(t('bookingRequests.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = () => {
    fetchBookings();
  };

  const filteredAndSortedBookings = () => {
    let result = bookings.filter(booking => {
      if (filter === 'all') return true;
      return booking.status === filter;
    });

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(booking => 
        booking.trip.from_city.toLowerCase().includes(query) ||
        booking.trip.to_city.toLowerCase().includes(query) ||
        booking.trip.driver?.full_name.toLowerCase().includes(query) ||
        booking.profiles.full_name.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      if (sortBy === 'date') {
        const aDate = new Date(a.created_at);
        const bDate = new Date(b.created_at);
        return sortOrder === 'asc' 
          ? aDate.getTime() - bDate.getTime()
          : bDate.getTime() - aDate.getTime();
      } else {
        return sortOrder === 'asc'
          ? a.status.localeCompare(b.status)
          : b.status.localeCompare(a.status);
      }
    });

    return result;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Spinner size="xl" />
          <span className="text-lg font-medium text-gray-600">{t('bookingRequests.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          {/* Header Section */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{t('bookingRequests.title')}</h1>
                <p className="mt-1 text-sm text-gray-500">
                  {t('bookingRequests.subtitle', { count: filteredAndSortedBookings().length })}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder={t('common.search')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64 transition-all"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button
                    color={sortBy === 'date' ? 'blue' : 'light'}
                    onClick={() => setSortBy('date')}
                    className="px-3 flex items-center gap-2"
                  >
                    <Calendar className="h-4 w-4" />
                    <span className="hidden sm:inline">{t('common.sortByDate')}</span>
                  </Button>
                  <Button
                    color={sortBy === 'status' ? 'blue' : 'light'}
                    onClick={() => setSortBy('status')}
                    className="px-3 flex items-center gap-2"
                  >
                    <Filter className="h-4 w-4" />
                    <span className="hidden sm:inline">{t('common.sortByStatus')}</span>
                  </Button>
                  <Button
                    color="light"
                    onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                    className="px-3"
                  >
                    {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mt-6">
              {(['all', 'pending', 'accepted', 'rejected'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filter === tab
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {t(`bookingRequests.filters.${tab}`)}
                  <Badge 
                    color={tab === 'pending' ? 'warning' : tab === 'accepted' ? 'success' : tab === 'rejected' ? 'failure' : 'light'}
                    className="ml-2"
                  >
                    {bookings.filter(b => tab === 'all' ? true : b.status === tab).length}
                  </Badge>
                </button>
              ))}
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6">
            <div className="space-y-4">
              {filteredAndSortedBookings().length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  <div className="max-w-sm mx-auto">
                    <p className="text-gray-500 text-lg font-medium mb-2">
                      {t(`bookingRequests.empty.${filter}`)}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {t('bookingRequests.empty.description')}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredAndSortedBookings().map((booking) => (
                    <BookingRequestCard
                      key={booking.id}
                      booking={booking}
                      onStatusUpdate={handleStatusUpdate}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 