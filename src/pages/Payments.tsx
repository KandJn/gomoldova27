import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { CreditCard, Check, X, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface Payment {
  id: number;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  created_at: string;
  description: string;
  payment_type: 'trip' | 'refund' | 'other';
  user_id: string;
  trip_id?: string;
  user_profile: {
    full_name: string;
    avatar_url: string | null;
  };
  trip?: {
    from_city: string;
    to_city: string;
    departure_date: string;
  };
}

export function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      fetchPayments();
      subscribeToPayments();
    }
  }, [user]);

  const fetchPayments = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          profiles!inner(full_name, avatar_url),
          trips!payments_trip_id_fkey(from_city, to_city, departure_date)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match the expected format
      const transformedData = data?.map(payment => ({
        ...payment,
        user_profile: payment.profiles,
        trip: payment.trips
      }));
      
      setPayments(transformedData || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Nu s-au putut încărca plățile');
    } finally {
      setLoading(false);
    }
  };

  const subscribeToPayments = () => {
    if (!user) return;

    const subscription = supabase
      .channel('payments')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'payments',
        filter: `user_id=eq.${user.id}`,
      }, () => {
        fetchPayments();
      })
      .subscribe();

    return () => subscription.unsubscribe();
  };

  const getStatusColor = (status: Payment['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status: Payment['status']) => {
    switch (status) {
      case 'completed':
        return <Check className="h-4 w-4" />;
      case 'failed':
        return <X className="h-4 w-4" />;
      case 'refunded':
        return <ArrowRight className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const formatTripInfo = (payment: Payment) => {
    if (!payment.trip) return null;
    return (
      <div className="flex items-center text-sm text-gray-600">
        <span>{payment.trip.from_city}</span>
        <ArrowRight className="h-4 w-4 mx-1" />
        <span>{payment.trip.to_city}</span>
        <span className="mx-1">•</span>
        <span>{format(new Date(payment.trip.departure_date), 'dd MMM yyyy', { locale: ro })}</span>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Plăți și rambursări</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Se încarcă...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
            <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Nu aveți plăți</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tip
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Detalii
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sumă
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {format(new Date(payment.created_at), 'dd MMM yyyy, HH:mm', { locale: ro })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 capitalize">
                        {payment.payment_type === 'trip' ? 'Călătorie' :
                         payment.payment_type === 'refund' ? 'Rambursare' : 'Altele'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-900">{payment.description}</span>
                        {payment.trip && formatTripInfo(payment)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm font-medium">
                        <CreditCard className="h-4 w-4 text-gray-400 mr-1" />
                        {payment.amount} MDL
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {getStatusIcon(payment.status)}
                        <span className="ml-1">{payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}