import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { CreditCard, ArrowRight, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface Transfer {
  id: number;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  description: string;
  sender_id: string;
  receiver_id: string;
  sender_profile: {
    full_name: string;
    avatar_url: string | null;
  };
  receiver_profile: {
    full_name: string;
    avatar_url: string | null;
  };
}

export function Transfers() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      fetchTransfers();
      subscribeToTransfers();
    }
  }, [user]);

  const fetchTransfers = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('transfers')
        .select(`
          *,
          sender_profile:profiles!transfers_sender_id_fkey(full_name, avatar_url),
          receiver_profile:profiles!transfers_receiver_id_fkey(full_name, avatar_url)
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransfers(data || []);
    } catch (error) {
      console.error('Error fetching transfers:', error);
      toast.error('Nu s-au putut încărca transferurile');
    } finally {
      setLoading(false);
    }
  };

  const subscribeToTransfers = () => {
    if (!user) return;

    const subscription = supabase
      .channel('transfers')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'transfers',
        filter: `or(sender_id.eq.${user.id},receiver_id.eq.${user.id})`,
      }, () => {
        fetchTransfers();
      })
      .subscribe();

    return () => subscription.unsubscribe();
  };

  const getStatusColor = (status: Transfer['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status: Transfer['status']) => {
    switch (status) {
      case 'completed':
        return <Check className="h-4 w-4" />;
      case 'failed':
        return <X className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Transferuri</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Se încarcă...</p>
          </div>
        ) : transfers.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
            <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Nu aveți transferuri</p>
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
                    De la
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Către
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sumă
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descriere
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transfers.map((transfer) => (
                  <tr key={transfer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {format(new Date(transfer.created_at), 'dd MMM yyyy, HH:mm', { locale: ro })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={transfer.sender_profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(transfer.sender_profile?.full_name || '')}&background=random`}
                          alt={transfer.sender_profile?.full_name}
                          className="h-8 w-8 rounded-full"
                        />
                        <span className="ml-2 text-sm text-gray-900">{transfer.sender_profile?.full_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={transfer.receiver_profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(transfer.receiver_profile?.full_name || '')}&background=random`}
                          alt={transfer.receiver_profile?.full_name}
                          className="h-8 w-8 rounded-full"
                        />
                        <span className="ml-2 text-sm text-gray-900">{transfer.receiver_profile?.full_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm font-medium">
                        <CreditCard className="h-4 w-4 text-gray-400 mr-1" />
                        {transfer.amount} MDL
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transfer.status)}`}>
                        {getStatusIcon(transfer.status)}
                        <span className="ml-1">{transfer.status.charAt(0).toUpperCase() + transfer.status.slice(1)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {transfer.description}
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