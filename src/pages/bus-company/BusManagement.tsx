import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../lib/store';
import { supabase } from '../../lib/supabase';
import { Plus, Search, Filter, Edit, Trash2, Bus } from 'lucide-react';
import toast from 'react-hot-toast';

interface BusType {
  id: string;
  registration_number: string;
  brand: string;
  model: string;
  year: number;
  seats: number;
  status: 'active' | 'maintenance' | 'inactive';
  created_at: string;
}

export const BusCompanyBuses: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [buses, setBuses] = useState<BusType[]>([]);
  const [filter, setFilter] = useState('all'); // all, active, maintenance, inactive
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBus, setSelectedBus] = useState<BusType | null>(null);

  useEffect(() => {
    fetchBuses();
  }, [user]);

  const fetchBuses = async () => {
    try {
      setLoading(true);
      
      if (!user) return;

      const { data: busCompany } = await supabase
        .from('bus_companies')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!busCompany) {
        toast.error('Nu s-a găsit compania de transport');
        return;
      }

      const { data: busesData, error } = await supabase
        .from('buses')
        .select('*')
        .eq('bus_company_id', busCompany.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setBuses(busesData || []);
    } catch (error) {
      console.error('Error fetching buses:', error);
      toast.error('Eroare la încărcarea autobuzelor');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedBus) return;

    try {
      const { error } = await supabase
        .from('buses')
        .delete()
        .eq('id', selectedBus.id);

      if (error) throw error;

      setBuses(buses.filter(bus => bus.id !== selectedBus.id));
      toast.success('Autobuz șters cu succes');
      setIsDeleteModalOpen(false);
      setSelectedBus(null);
    } catch (error) {
      console.error('Error deleting bus:', error);
      toast.error('Eroare la ștergerea autobuzului');
    }
  };

  const filteredBuses = buses.filter(bus => {
    if (filter !== 'all' && bus.status !== filter) {
      return false;
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        bus.registration_number.toLowerCase().includes(query) ||
        bus.brand.toLowerCase().includes(query) ||
        bus.model.toLowerCase().includes(query)
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
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Gestionare Autobuze</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Caută autobuz..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
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
                  Toate autobuzele
                </button>
                <button
                  onClick={() => {
                    setFilter('active');
                    setIsFilterOpen(false);
                  }}
                  className={`block px-4 py-2 text-sm w-full text-left ${
                    filter === 'active' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => {
                    setFilter('maintenance');
                    setIsFilterOpen(false);
                  }}
                  className={`block px-4 py-2 text-sm w-full text-left ${
                    filter === 'maintenance' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  În mentenanță
                </button>
                <button
                  onClick={() => {
                    setFilter('inactive');
                    setIsFilterOpen(false);
                  }}
                  className={`block px-4 py-2 text-sm w-full text-left ${
                    filter === 'inactive' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Inactive
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => navigate('new')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adaugă autobuz
          </button>
        </div>
      </div>

      {filteredBuses.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <Bus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nu am găsit autobuze
          </h3>
          <p className="text-gray-600">
            {searchQuery
              ? 'Nu am găsit autobuze care să corespundă criteriilor de căutare.'
              : 'Nu există autobuze în această categorie.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBuses.map((bus) => (
            <div
              key={bus.id}
              className="bg-white rounded-lg shadow-sm overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Bus className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-gray-900">
                      {bus.registration_number}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      bus.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : bus.status === 'maintenance'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {bus.status === 'active'
                        ? 'Activ'
                        : bus.status === 'maintenance'
                        ? 'În mentenanță'
                        : 'Inactiv'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-500">Marca și model:</span>
                    <p className="text-gray-900">{bus.brand} {bus.model}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">An fabricație:</span>
                    <p className="text-gray-900">{bus.year}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Locuri:</span>
                    <p className="text-gray-900">{bus.seats}</p>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => navigate(`${bus.id}/edit`)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editează
                  </button>
                  <button
                    onClick={() => {
                      setSelectedBus(bus);
                      setIsDeleteModalOpen(true);
                    }}
                    className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Șterge
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedBus && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirmare ștergere
            </h3>
            <p className="text-gray-600 mb-6">
              Sigur doriți să ștergeți autobuzul cu numărul de înmatriculare{' '}
              <span className="font-medium">{selectedBus.registration_number}</span>?
              Această acțiune nu poate fi anulată.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedBus(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Anulează
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 border border-transparent rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                Șterge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 