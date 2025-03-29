import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../lib/store';
import {
  FileCheck,
  Search,
  Filter,
  X,
  Check,
  AlertTriangle,
  Download,
  Eye
} from 'lucide-react';
import toast from 'react-hot-toast';

export function AdminVerifications() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [verifications, setVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedVerification, setSelectedVerification] = useState<any>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    checkAdminAccess();
    if (user?.email === 'asassin.damian@gmail.com') {
      fetchVerifications();
    }
  }, [user, filter]);

  const checkAdminAccess = () => {
    if (user?.email !== 'asassin.damian@gmail.com') {
      toast.error('Acces neautorizat');
      navigate('/');
      return;
    }
  };

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('profiles')
        .select('*')
        .not('verification_status', 'eq', 'verified')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('verification_status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setVerifications(data || []);
    } catch (error) {
      console.error('Error fetching verifications:', error);
      toast.error('Eroare la încărcarea verificărilor');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedVerification) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase.rpc('verify_user', {
        user_id: selectedVerification.id,
        verification_type: 'both',
        notes: reviewNotes
      });

      if (error) throw error;

      toast.success('Utilizator verificat cu succes');
      setIsReviewModalOpen(false);
      setSelectedVerification(null);
      setReviewNotes('');
      fetchVerifications();
    } catch (error) {
      console.error('Error approving verification:', error);
      toast.error('Eroare la aprobarea verificării');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedVerification) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase.rpc('reject_user_verification', {
        user_id: selectedVerification.id,
        notes: reviewNotes
      });

      if (error) throw error;

      toast.success('Verificare respinsă');
      setIsReviewModalOpen(false);
      setSelectedVerification(null);
      setReviewNotes('');
      fetchVerifications();
    } catch (error) {
      console.error('Error rejecting verification:', error);
      toast.error('Eroare la respingerea verificării');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredVerifications = verifications.filter(verification => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        verification.full_name?.toLowerCase().includes(query) ||
        verification.email.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Verificări utilizatori
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Gestionați verificările de identitate, email și telefon
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Căutare utilizator..."
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
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setFilter('all');
                        setIsFilterOpen(false);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        filter === 'all' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Toate
                    </button>
                    <button
                      onClick={() => {
                        setFilter('pending');
                        setIsFilterOpen(false);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        filter === 'pending' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      În așteptare
                    </button>
                    <button
                      onClick={() => {
                        setFilter('rejected');
                        setIsFilterOpen(false);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        filter === 'rejected' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Respinse
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredVerifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <FileCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nu există verificări
            </h3>
            <p className="text-gray-600">
              {searchQuery
                ? 'Nu am găsit verificări care să corespundă criteriilor de căutare.'
                : 'Nu există verificări de procesat în acest moment.'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilizator
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acțiuni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredVerifications.map((verification) => (
                  <tr key={verification.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full"
                            src={verification.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(verification.full_name || verification.email)}`}
                            alt=""
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {verification.full_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {verification.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        verification.verification_status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : verification.verification_status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {verification.verification_status === 'pending'
                          ? 'În așteptare'
                          : verification.verification_status === 'rejected'
                          ? 'Respins'
                          : 'Neverificat'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(verification.created_at).toLocaleDateString('ro-RO')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => {
                            setSelectedVerification(verification);
                            setIsReviewModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Review Modal */}
        {isReviewModalOpen && selectedVerification && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Verificare utilizator
                </h2>
                <button
                  onClick={() => {
                    setIsReviewModalOpen(false);
                    setSelectedVerification(null);
                    setReviewNotes('');
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      Utilizator
                    </h3>
                    <p className="text-base font-medium text-gray-900">
                      {selectedVerification.full_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {selectedVerification.email}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      Status curent
                    </h3>
                    <p className="text-base font-medium text-gray-900">
                      {selectedVerification.verification_status === 'pending'
                        ? 'În așteptare'
                        : selectedVerification.verification_status === 'rejected'
                        ? 'Respins'
                        : 'Neverificat'}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Note verificare
                  </label>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    rows={4}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Adăugați note despre verificare..."
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setIsReviewModalOpen(false);
                      setSelectedVerification(null);
                      setReviewNotes('');
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Anulează
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={isSubmitting}
                    className="px-4 py-2 border border-transparent rounded-md text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <AlertTriangle className="h-5 w-5 mr-2 inline" />
                        Respinge
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={isSubmitting}
                    className="px-4 py-2 border border-transparent rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Check className="h-5 w-5 mr-2 inline" />
                        Aprobă
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}