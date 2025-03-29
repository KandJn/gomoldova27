import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import { BookingRequestCard } from '../components/BookingRequestCard';
import { Loader2, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

export function BookingRequests() {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
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

      console.log('Fetched bookings:', data);
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Eroare la încărcarea rezervărilor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = () => {
    fetchBookings();
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Se încarcă rezervările...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Rezervările mele</h1>
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="all">Toate rezervările</option>
            <option value="pending">În așteptare</option>
            <option value="accepted">Acceptate</option>
            <option value="rejected">Respinse</option>
          </select>
        </div>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-600">
            {filter === 'all'
              ? 'Nu aveți rezervări'
              : filter === 'pending'
              ? 'Nu aveți rezervări în așteptare'
              : filter === 'accepted'
              ? 'Nu aveți rezervări acceptate'
              : 'Nu aveți rezervări respinse'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <BookingRequestCard
              key={booking.id}
              booking={booking}
              onStatusUpdate={handleStatusUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
} 