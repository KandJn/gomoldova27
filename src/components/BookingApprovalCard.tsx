import React, { useState } from 'react';
import { Check, X, MessageCircle, Clock, Calendar, MapPin, User, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { NotificationService } from '../lib/notificationService';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import type { Booking, Trip } from '../lib/types';

interface BookingApprovalCardProps {
  booking: Booking & { user: any };
  trip: Trip;
  onStatusChange: () => void;
  onOpenChat: (userId: string) => void;
}

export function BookingApprovalCard({ booking, trip, onStatusChange, onOpenChat }: BookingApprovalCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmReject, setShowConfirmReject] = useState(false);
  
  const handleApprove = async () => {
    try {
      setIsProcessing(true);
      
      // Check if there are still seats available
      const { data: tripData, error: tripError } = await supabase
        .from('trips')
        .select(`
          *,
          bookings(
            id,
            status
          )
        `)
        .eq('id', trip.id)
        .single();
        
      if (tripError) throw tripError;
      
      const acceptedBookings = tripData.bookings.filter((b: any) => b.status === 'accepted').length;
      const availableSeats = tripData.seats - acceptedBookings;
      
      if (availableSeats <= 0) {
        toast.error('Nu mai sunt locuri disponibile pentru această călătorie');
        return;
      }
      
      // Update booking status
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'accepted' })
        .eq('id', booking.id);
        
      if (error) throw error;
      
      // Create notification for passenger
      await NotificationService.createNotification({
        user_id: booking.user.id,
        type: 'booking_approved',
        content: {
          booking_id: booking.id,
          trip_id: trip.id,
          driver_id: trip.driver_id,
          driver_name: trip.driver.full_name || 'Șofer',
          trip_details: {
            from_city: trip.from_city,
            to_city: trip.to_city,
            date: trip.date,
            time: trip.time
          }
        }
      });
      
      toast.success('Rezervare acceptată cu succes!');
      onStatusChange();
    } catch (error) {
      console.error('Error approving booking:', error);
      toast.error('Eroare la aprobarea rezervării');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleReject = async () => {
    try {
      setIsProcessing(true);
      
      // Update booking status
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'rejected' })
        .eq('id', booking.id);
        
      if (error) throw error;
      
      // Create notification for passenger
      await NotificationService.createNotification({
        user_id: booking.user.id,
        type: 'booking_rejected',
        content: {
          booking_id: booking.id,
          trip_id: trip.id,
          driver_id: trip.driver_id,
          driver_name: trip.driver.full_name || 'Șofer',
          trip_details: {
            from_city: trip.from_city,
            to_city: trip.to_city,
            date: trip.date,
            time: trip.time
          }
        }
      });
      
      toast.success('Rezervare respinsă');
      setShowConfirmReject(false);
      onStatusChange();
    } catch (error) {
      console.error('Error rejecting booking:', error);
      toast.error('Eroare la respingerea rezervării');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PPP', { locale: ro });
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-all-300">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img
              src={booking.user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(booking.user.full_name || booking.user.email)}`}
              alt={booking.user.full_name || booking.user.email}
              className="w-10 h-10 rounded-full mr-3"
            />
            <div>
              <h3 className="font-medium text-gray-900">{booking.user.full_name || booking.user.email}</h3>
              <p className="text-sm text-gray-500">
                Cerere primită: {format(new Date(booking.created_at), 'dd MMM yyyy, HH:mm', { locale: ro })}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              booking.status === 'accepted' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }`}>
              {booking.status === 'pending' ? 'În așteptare' :
               booking.status === 'accepted' ? 'Acceptată' : 'Respinsă'}
            </span>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-start">
            <Calendar className="h-5 w-5 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-500">Data călătoriei</p>
              <p className="font-medium">{formatDate(trip.date)}</p>
            </div>
          </div>
          <div className="flex items-start">
            <Clock className="h-5 w-5 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-500">Ora plecării</p>
              <p className="font-medium">{trip.time}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-start mb-4">
          <MapPin className="h-5 w-5 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <p className="text-sm text-gray-500">Ruta</p>
            <p className="font-medium">{trip.from_city} → {trip.to_city}</p>
          </div>
        </div>
        
        <div className="flex items-start mb-4">
          <User className="h-5 w-5 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <p className="text-sm text-gray-500">Locuri rezervate</p>
            <p className="font-medium">1 loc</p>
          </div>
        </div>
        
        {booking.status === 'pending' && (
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-4">
            <button
              onClick={() => onOpenChat(booking.user.id)}
              className="flex-1 flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-all-300"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Chat
            </button>
            <button
              onClick={() => setShowConfirmReject(true)}
              disabled={isProcessing}
              className="flex-1 flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md text-red-600 bg-white hover:bg-red-50 transition-all-300"
            >
              <X className="h-4 w-4 mr-2" />
              Respinge
            </button>
            <button
              onClick={handleApprove}
              disabled={isProcessing}
              className="flex-1 flex items-center justify-center py-2 px-4 border border-transparent rounded-md text-white bg-green-600 hover:bg-green-700 transition-all-300"
            >
              {isProcessing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Acceptă
                </>
              )}
            </button>
          </div>
        )}
        
        {booking.status === 'accepted' && (
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-4">
            <button
              onClick={() => onOpenChat(booking.user.id)}
              className="flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-all-300"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Chat cu pasagerul
            </button>
          </div>
        )}
      </div>
      
      {/* Confirmation Dialog for Reject */}
      {showConfirmReject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-start mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">Confirmați respingerea</h3>
                <p className="text-gray-500 mt-1">
                  Sunteți sigur că doriți să respingeți cererea de rezervare de la {booking.user.full_name || booking.user.email}?
                </p>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmReject(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Anulează
              </button>
              <button
                onClick={handleReject}
                disabled={isProcessing}
                className="px-4 py-2 border border-transparent rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                {isProcessing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  'Respinge'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}