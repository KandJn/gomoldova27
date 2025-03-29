import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../lib/store';
import {
  Users,
  Search,
  Filter,
  X,
  Check,
  Ban,
  Shield,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

export function AdminUsers() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, verified, unverified, blocked
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'verify' | 'block' | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.email === 'asassin.damian@gmail.com') {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error loading users');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selectedUser || !actionType || !actionReason) return;
    
    setIsSubmitting(true);
    try {
      if (actionType === 'verify') {
        const { error } = await supabase
          .from('profiles')
          .update({ 
            verification_status: 'verified',
            verification_notes: actionReason,
            verified_at: new Date().toISOString(),
            verified_by: user?.id
          })
          .eq('id', selectedUser.id);

        if (error) throw error;
        toast.success('Utilizator verificat cu succes');
      } else if (actionType === 'block') {
        const { error } = await supabase
          .from('profiles')
          .update({ 
            is_blocked: true,
            block_reason: actionReason,
            blocked_at: new Date().toISOString(),
            blocked_by: user?.id
          })
          .eq('id', selectedUser.id);

        if (error) throw error;
        toast.success('Utilizator blocat cu succes');
      }

      fetchUsers();
      setIsActionModalOpen(false);
      setSelectedUser(null);
      setActionType(null);
      setActionReason('');
    } catch (error) {
      console.error('Error performing action:', error);
      toast.error('Eroare la executarea acțiunii');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter(user => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        user.full_name?.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Gestionare utilizatori
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Administrați și monitorizați utilizatorii platformei
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
                    Toți utilizatorii
                  </button>
                  <button
                    onClick={() => {
                      setFilter('verified');
                      setIsFilterOpen(false);
                    }}
                    className={`block px-4 py-2 text-sm w-full text-left ${
                      filter === 'verified' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Verificați
                  </button>
                  <button
                    onClick={() => {
                      setFilter('unverified');
                      setIsFilterOpen(false);
                    }}
                    className={`block px-4 py-2 text-sm w-full text-left ${
                      filter === 'unverified' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Neverificați
                  </button>
                  <button
                    onClick={() => {
                      setFilter('blocked');
                      setIsFilterOpen(false);
                    }}
                    className={`block px-4 py-2 text-sm w-full text-left ${
                      filter === 'blocked' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Blocați
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
        ) : filteredUsers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nu am găsit utilizatori
            </h3>
            <p className="text-gray-600">
              {searchQuery
                ? 'Nu am găsit utilizatori care să corespundă criteriilor de căutare.'
                : 'Nu există utilizatori în această categorie.'}
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
                    Data înregistrării
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acțiuni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full"
                            src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || user.email)}`}
                            alt=""
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.full_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.verification_status === 'verified'
                            ? 'bg-green-100 text-green-800'
                            : user.verification_status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.verification_status === 'verified' ? 'Verificat' :
                           user.verification_status === 'pending' ? 'În așteptare' : 'Neverificat'}
                        </span>
                        {user.is_blocked && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Blocat
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString('ro-RO')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {user.verification_status !== 'verified' && (
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setActionType('verify');
                              setIsActionModalOpen(true);
                            }}
                            className="text-green-600 hover:text-green-900"
                            title="Verifică utilizator"
                          >
                            <Check className="h-5 w-5" />
                          </button>
                        )}
                        {!user.is_blocked && (
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setActionType('block');
                              setIsActionModalOpen(true);
                            }}
                            className="text-red-600 hover:text-red-900"
                            title="Blochează utilizator"
                          >
                            <Ban className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Action Modal */}
        {isActionModalOpen && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {actionType === 'verify' ? 'Verificare utilizator' : 'Blocare utilizator'}
                </h3>
                <button
                  onClick={() => {
                    setIsActionModalOpen(false);
                    setSelectedUser(null);
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
                  {actionType === 'verify'
                    ? 'Confirmați verificarea acestui utilizator? Această acțiune va marca contul ca fiind verificat.'
                    : 'Confirmați blocarea acestui utilizator? Această acțiune va restricționa accesul utilizatorului la platformă.'}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  {actionType === 'verify' ? 'Note verificare' : 'Motiv blocare'}
                </label>
                <textarea
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder={actionType === 'verify' ? 'Adăugați note despre verificare...' : 'Explicați motivul blocării...'}
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setIsActionModalOpen(false);
                    setSelectedUser(null);
                    setActionType(null);
                    setActionReason('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Anulează
                </button>
                <button
                  onClick={handleAction}
                  disabled={isSubmitting || !actionReason.trim()}
                  className={`px-4 py-2 border border-transparent rounded-md text-white ${
                    actionType === 'verify'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : actionType === 'verify' ? (
                    'Verifică'
                  ) : (
                    'Blochează'
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