import React, { useState } from 'react';
import { Check, X, Calendar, Clock, MapPin, CheckCircle, XCircle, User, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button, Badge } from 'flowbite-react';

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
  const { t } = useTranslation();
  const navigate = useNavigate();
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
          <Badge color="warning">
            {t('trips.status.pending')}
          </Badge>
        );
      case 'accepted':
      case 'confirmed':
        return (
          <Badge color="success">
            {t('trips.status.confirmed')}
          </Badge>
        );
      case 'rejected':
        return (
          <Badge color="failure">
            {t('trips.status.rejected')}
          </Badge>
        );
      case 'canceled':
        return (
          <Badge color="gray">
            {t('trips.status.cancelled')}
          </Badge>
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
      toast.success(t('bookingRequests.card.actions.approve'));
      setShowApproveConfirm(false);
      onStatusUpdate();
    } catch (error: any) {
      console.error('Error approving booking:', error);
      toast.error(error.message || t('common.error'));
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
      toast.success(t('bookingRequests.card.actions.reject'));
      setShowRejectConfirm(false);
      onStatusUpdate();
    } catch (error: any) {
      console.error('Error rejecting booking:', error);
      toast.error(error.message || t('common.error'));
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
          ? t('bookingRequests.card.actions.cancelBooking')
          : t('bookingRequests.card.actions.cancelDecision');
      } else {
        successMessage = isPending 
          ? t('bookingRequests.card.actions.cancelRequest')
          : t('bookingRequests.card.actions.cancelBooking');
      }
      
      toast.success(successMessage);
      
      setShowCancelConfirm(false);
      onStatusUpdate();
    } catch (error: any) {
      console.error('Error canceling booking:', error);
      toast.error(error.message || t('common.error'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleContact = () => {
    const userId = isDriver ? booking.profiles.id : booking.trip.driver_id;
    navigate(`/messages?user=${userId}`);
  };

  const getProviderInfo = () => {
    if (booking.trip.company) {
      return {
        name: booking.trip.company.company_name,
        avatar: booking.trip.company.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(booking.trip.company.company_name)}`,
        type: t('bookingRequests.card.company')
      };
    } else if (booking.trip.driver) {
      return {
        name: booking.trip.driver.full_name || t('bookingRequests.card.unknownProvider'),
        avatar: booking.trip.driver.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(booking.trip.driver.full_name || 'Unknown')}`,
        type: t('bookingRequests.card.driver')
      };
    } else {
      return {
        name: t('bookingRequests.card.unknownProvider'),
        avatar: `https://ui-avatars.com/api/?name=Unknown`,
        type: t('bookingRequests.card.unknownProvider')
      };
    }
  };

  const providerInfo = getProviderInfo();

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-4 hover:shadow-md transition-shadow">
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
                  {booking.profiles.full_name || t('bookingRequests.card.unknownPassenger')}
                </h3>
                <p className="text-sm text-gray-500">
                  {t('bookingRequests.card.seats', { count: booking.seats })}
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
              <Button
                color="success"
                onClick={() => setShowApproveConfirm(true)}
                className="flex items-center px-4 py-2 gap-2 text-sm font-medium"
              >
                <Check className="h-4 w-4" />
                {t('bookingRequests.card.actions.approve')}
              </Button>
              <Button
                color="failure"
                onClick={() => setShowRejectConfirm(true)}
                className="flex items-center px-4 py-2 gap-2 text-sm font-medium"
              >
                <X className="h-4 w-4" />
                {t('bookingRequests.card.actions.reject')}
              </Button>
            </>
          )}
          {canCancel && (
            <Button
              color="light"
              onClick={() => setShowCancelConfirm(true)}
              className="flex items-center px-4 py-2 gap-2 text-sm font-medium border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <X className="h-4 w-4 text-gray-600" />
              <span className="text-gray-700">
                {isDriver 
                  ? (isAccepted ? t('bookingRequests.card.actions.cancelBooking') : t('bookingRequests.card.actions.cancelDecision'))
                  : (isPending ? t('bookingRequests.card.actions.cancelRequest') : t('bookingRequests.card.actions.cancelBooking'))
                }
              </span>
            </Button>
          )}
          <Button
            color="light"
            onClick={handleContact}
            className="flex items-center px-4 py-2 gap-2 text-sm font-medium bg-blue-50 border-blue-100 hover:bg-blue-100 transition-colors"
          >
            <MessageCircle className="h-4 w-4 text-blue-600" />
            <span className="text-blue-700">{t('common.contact')}</span>
          </Button>
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
                <p>{t('bookingRequests.card.from')}: {booking.trip.from_city}</p>
                <p className="mt-1">{t('bookingRequests.card.to')}: {booking.trip.to_city}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Approve Confirmation Modal */}
      {showApproveConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('bookingRequests.card.confirmations.approve.title')}</h3>
            <p className="text-gray-600 mb-6">
              {t('bookingRequests.card.confirmations.approve.message')}
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                color="light"
                onClick={() => setShowApproveConfirm(false)}
              >
                {t('bookingRequests.card.confirmations.approve.cancel')}
              </Button>
              <Button
                color="success"
                onClick={handleApprove}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  t('bookingRequests.card.confirmations.approve.confirm')
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {showRejectConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('bookingRequests.card.confirmations.reject.title')}</h3>
            <p className="text-gray-600 mb-6">
              {t('bookingRequests.card.confirmations.reject.message')}
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                color="light"
                onClick={() => setShowRejectConfirm(false)}
              >
                {t('bookingRequests.card.confirmations.reject.cancel')}
              </Button>
              <Button
                color="failure"
                onClick={handleReject}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  t('bookingRequests.card.confirmations.reject.confirm')
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('bookingRequests.card.confirmations.cancel.title')}</h3>
            <p className="text-gray-600 mb-6">
              {t(`bookingRequests.card.confirmations.cancel.message.${isDriver ? 'driver' : 'passenger'}.${isAccepted ? 'accepted' : 'pending'}`)}
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                color="light"
                onClick={() => setShowCancelConfirm(false)}
              >
                {t('bookingRequests.card.confirmations.cancel.back')}
              </Button>
              <Button
                color="gray"
                onClick={handleCancel}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  t('bookingRequests.card.confirmations.cancel.confirm')
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 