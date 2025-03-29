import { supabase } from './supabase';
import type { Trip, Booking } from './types';
import toast from 'react-hot-toast';

export async function fetchTrip(id: string) {
  try {
    const { data, error } = await supabase
      .from('trips')
      .select(`
        *,
        driver:profiles!trips_driver_id_fkey(*),
        bookings(
          *,
          user:profiles!bookings_user_id_fkey(*)
        ),
        available_seats(available_seats)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching trip:', error);
      throw error;
    }
    
    return data as Trip;
  } catch (error) {
    console.error('Error in fetchTrip:', error);
    toast.error('Nu s-a putut încărca călătoria');
    throw error;
  }
}

export async function createBooking(tripId: number, userId: string) {
  try {
    // First check if a booking already exists
    const { data: existingBooking, error: checkError } = await supabase
      .from('bookings')
      .select('id, status')
      .eq('trip_id', tripId)
      .eq('user_id', userId)
      .not('status', 'in', ['rejected', 'cancelled'])
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing booking:', checkError);
      throw checkError;
    }

    if (existingBooking) {
      if (existingBooking.status === 'pending') {
        toast.error('Aveți deja o cerere de rezervare în așteptare pentru această călătorie');
      } else if (existingBooking.status === 'accepted') {
        toast.error('Aveți deja o rezervare acceptată pentru această călătorie');
      }
      throw new Error('Booking already exists');
    }

    // If no existing booking, create a new one
    const { data, error } = await supabase
      .from('bookings')
      .insert([
        {
          trip_id: tripId,
          user_id: userId,
          status: 'pending'
        },
      ])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // PostgreSQL unique violation error code
        toast.error('Aveți deja o rezervare pentru această călătorie');
        throw new Error('Booking already exists');
      }
      console.error('Error creating booking:', error);
      throw error;
    }
    
    return data as Booking;
  } catch (error) {
    console.error('Error in createBooking:', error);
    if (error instanceof Error && error.message === 'Booking already exists') {
      // Error already shown via toast
      throw error;
    }
    toast.error('Nu s-a putut crea rezervarea');
    throw error;
  }
}

export async function updateBookingStatus(
  bookingId: number,
  status: 'accepted' | 'rejected' | 'cancelled'
) {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
    
    return data as Booking;
  } catch (error) {
    console.error('Error in updateBookingStatus:', error);
    toast.error('Nu s-a putut actualiza statusul rezervării');
    throw error;
  }
}

export async function markNotificationAsRead(notificationId: number) {
  try {
    const { error } = await supabase.rpc('mark_notification_as_read', {
      notification_id: notificationId
    });

    if (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in markNotificationAsRead:', error);
    toast.error('Nu s-a putut marca notificarea ca citită');
    throw error;
  }
}

export async function markMessageAsRead(messageId: number) {
  try {
    const { error } = await supabase.rpc('mark_message_as_read', {
      message_id: messageId
    });

    if (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in markMessageAsRead:', error);
    toast.error('Nu s-a putut marca mesajul ca citit');
    throw error;
  }
}