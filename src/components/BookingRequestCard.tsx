import React, { useState } from 'react';
import { Check, X, Calendar, Clock, MapPin, CheckCircle, XCircle, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

interface Profile {
  id: string;
  full_name?: string;
  avatar_url?: string;
}

interface Company {
  id: string;
  company_name: string;
  phone?: string;
  avatar_url?: string;
}

interface BookingRequestProps {
  booking: {
    id: string;
    trip_id: string;
    user_id: string;
    seats: number;
    status: string;
    created_at: string;
    profiles: Profile;
    trip: {
      id: string;
      from_city: string;
      to_city: string;
      departure_date: string;
      departure_time: string;
      driver_id: string;
      company_id?: string;
      driver?: Profile;
      company?: Company;
    };
  };
  onStatusUpdate: () => void;
}

export function BookingRequestCard({ booking, onStatusUpdate }: BookingRequestProps) {
  const { user } = useAuthStore();
  const isDriver = booking.trip.driver_id === user?.id;
  const isOwnBooking = booking.user_id === user?.id;
  const [isProcessing, setIsProcessing] = useState(false);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  
  const getStatusBadge = () => {
    switch (booking.status.toLowerCase()) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            În așteptare
          </span>
        );
      case 'accepted':
      case 'confirmed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4 mr-1" />
            Aprobată
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-4 h-4 mr-1" />
            Respinsă
          </span>
        );
      case 'canceled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <X className="w-4 h-4 mr-1" />
            Anulată
          </span>
        );
      default:
        return null;
    }
  };

  const isPending = booking.status.toLowerCase() === 'pending';
  const isAccepted = ['accepted', 'confirmed'].includes(booking.status.toLowerCase());
  const isRejected = booking.status.toLowerCase() === 'rejected';
  
  // Show cancel button for:
  // 1. Passengers (isOwnBooking) when request is pending or accepted
  // 2. Drivers (isDriver) only after they've made a decision (accepted or rejected)
  const canCancel = isOwnBooking ? (isPending || isAccepted) : (isDriver && (isAccepted || isRejected));
  
  console.log('BookingRequestCard Debug:', {
    userId: user?.id,
    bookingUserId: booking.user_id,
    isOwnBooking,
    isDriver,
    bookingStatus: booking.status,
    isPending,
    isAccepted,
    isRejected,
    canCancel,
    shouldShowButtons: isDriver && isPending
  });

  const handleApprove = async () => {
    try {
      setIsProcessing(true);
      console.log('Approving booking:', booking.id);
      
      const { data: updatedBooking, error: bookingError } = await supabase
        .from('bookings')
        .update({ status: 'accepted' })
        .eq('id', booking.id)
        .select();

      if (bookingError) {
        console.error('Error details:', bookingError);
        throw bookingError;
      }
      
      console.log('Booking updated successfully:', updatedBooking);
      toast.success('Cerere de rezervare aprobată cu succes');
      setShowApproveConfirm(false);
      onStatusUpdate();
    } catch (error: any) {
      console.error('Error approving booking:', error);
      toast.error(`Eroare la aprobarea cererii de rezervare: ${error.message || 'Eroare necunoscută'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    try {
      setIsProcessing(true);
      console.log('Rejecting booking:', booking.id);
      
      const { data: updatedBooking, error: bookingError } = await supabase
        .from('bookings')
        .update({ status: 'rejected' })
        .eq('id', booking.id)
        .select();

      if (bookingError) {
        console.error('Error details:', bookingError);
        throw bookingError;
      }
      
      console.log('Booking updated successfully:', updatedBooking);
      toast.success('Cerere de rezervare respinsă');
      setShowRejectConfirm(false);
      onStatusUpdate();
    } catch (error: any) {
      console.error('Error rejecting booking:', error);
      toast.error(`Eroare la respingerea cererii de rezervare: ${error.message || 'Eroare necunoscută'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    try {
      setIsProcessing(true);
      console.log('Canceling booking:', booking.id);
      
      const { error } = await supabase
        .from('bookings')
        .update({
          status: 'canceled'
        })
        .match({ id: booking.id });

      if (error) {
        console.error('Error updating booking:', error);
        throw error;
      }

      console.log('Booking canceled successfully');
      
      let successMessage = '';
      if (isDriver) {
        successMessage = isAccepted 
          ? 'Rezervarea a fost anulată cu succes' 
          : 'Decizia a fost anulată cu succes';
      } else {
        successMessage = isPending 
          ? 'Cererea de rezervare a fost anulată' 
          : 'Rezervarea a fost anulată';
      }
      
      toast.success(successMessage, {
        duration: 3000,
        position: 'top-center'
      });
      
      setShowCancelConfirm(false);
      onStatusUpdate();
    } catch (error: any) {
      console.error('Error canceling booking:', error);
      const errorMessage = isDriver
        ? `Eroare la anularea ${isAccepted ? 'rezervării' : 'deciziei'}`
        : `Eroare la anularea ${isPending ? 'cererii' : 'rezervării'}`;
      toast.error(`${errorMessage}: ${error.message || 'Eroare necunoscută'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const getProviderInfo = () => {
    if (booking.trip.company) {
      return {
        name: booking.trip.company.company_name,
        avatar: booking.trip.company.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(booking.trip.company.company_name)}`,
        type: 'Companie de transport'
      };
    } else if (booking.trip.driver) {
      return {
        name: booking.trip.driver.full_name || 'Șofer necunoscut',
        avatar: booking.trip.driver.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(booking.trip.driver.full_name || 'Unknown')}`,
        type: 'Șofer'
      };
    } else {
      return {
        name: 'Furnizor necunoscut',
        avatar: `https://ui-avatars.com/api/?name=Unknown`,
        type: 'Furnizor'
      };
    }
  };

  const providerInfo = getProviderInfo();

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          {isDriver ? (
            <>
              <img
                src={booking.profiles.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(booking.profiles.full_name || 'Unknown')}`}
                alt="Passenger"
                className="h-12 w-12 rounded-full"
              />
              <div className="ml-4">
                <h3 className="font-medium text-gray-900">
                  {booking.profiles.full_name || 'Pasager necunoscut'}
                </h3>
                <p className="text-sm text-gray-500">
                  {booking.seats} {booking.seats === 1 ? 'loc' : 'locuri'} rezervate
                </p>
              </div>
            </>
          ) : (
            <>
              <img
                src={providerInfo.avatar}
                alt={providerInfo.name}
                className="h-12 w-12 rounded-full"
              />
              <div className="ml-4">
                <h3 className="font-medium text-gray-900">
                  {providerInfo.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {providerInfo.type}
                </p>
              </div>
            </>
          )}
          <div className="ml-4">
            {getStatusBadge()}
          </div>
        </div>
        <div className="flex items-center space-x-2 ml-auto">
          {isDriver && isPending && (
            <>
              <button
                onClick={() => setShowApproveConfirm(true)}
                className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <Check className="h-4 w-4 mr-1" />
                Aprobă cererea
              </button>
              <button
                onClick={() => setShowRejectConfirm(true)}
                className="flex items-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                <X className="h-4 w-4 mr-1" />
                Respinge cererea
              </button>
            </>
          )}
          {canCancel && (
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              <X className="h-4 w-4 mr-1" />
              {isDriver 
                ? (isAccepted ? 'Anulează rezervarea' : 'Anulează decizia')
                : (isPending ? 'Anulează cererea' : 'Anulează rezervarea')
              }
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 border-t pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="h-4 w-4 mr-1" />
              {format(new Date(booking.trip.departure_date), 'dd MMMM yyyy', { locale: ro })}
            </div>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <Clock className="h-4 w-4 mr-1" />
              {booking.trip.departure_time}
            </div>
          </div>
          <div>
            <div className="flex items-start text-sm text-gray-500">
              <MapPin className="h-4 w-4 mr-1 mt-1 flex-shrink-0" />
              <div>
                <p>De la: {booking.trip.from_city}</p>
                <p className="mt-1">Până la: {booking.trip.to_city}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Approve Confirmation Modal */}
      {showApproveConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirmă aprobarea</h3>
            <p className="text-gray-600 mb-6">
              Sunteți sigur că doriți să aprobați această cerere de rezervare? 
              Pasagerul va fi notificat și va putea vedea detaliile călătoriei.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowApproveConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Anulează
              </button>
              <button
                onClick={handleApprove}
                disabled={isProcessing}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                {isProcessing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  'Confirmă'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {showRejectConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirmă respingerea</h3>
            <p className="text-gray-600 mb-6">
              Sunteți sigur că doriți să respingeți această cerere de rezervare? 
              Pasagerul va fi notificat despre decizia dumneavoastră.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowRejectConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Anulează
              </button>
              <button
                onClick={handleReject}
                disabled={isProcessing}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                {isProcessing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  'Confirmă'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirmă anularea</h3>
            <p className="text-gray-600 mb-6">
              {isDriver
                ? (isAccepted 
                    ? 'Sunteți sigur că doriți să anulați această rezervare? Pasagerul va fi notificat despre anulare.'
                    : 'Sunteți sigur că doriți să anulați decizia dumneavoastră?')
                : (isPending 
                    ? 'Sunteți sigur că doriți să anulați această cerere de rezervare?'
                    : 'Sunteți sigur că doriți să anulați această rezervare? Pasagerul va fi notificat despre anulare.')}
              <br />
              Această acțiune nu poate fi anulată.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Înapoi
              </button>
              <button
                onClick={handleCancel}
                disabled={isProcessing}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                {isProcessing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  'Confirmă'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 