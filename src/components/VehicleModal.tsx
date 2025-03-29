import React, { useState, useEffect } from 'react';
import { X, Save, Car, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import toast from 'react-hot-toast';

interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

interface Make {
  id: string;
  name: string;
}

interface Model {
  id: string;
  name: string;
}

export function VehicleModal({ isOpen, onClose, onUpdate }: VehicleModalProps) {
  const [vehicle, setVehicle] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    plate_number: '',
    comfort_level: 'standard'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [makes, setMakes] = useState<Make[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [makeSearch, setMakeSearch] = useState('');
  const [modelSearch, setModelSearch] = useState('');
  const [showMakeDropdown, setShowMakeDropdown] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [selectedMakeId, setSelectedMakeId] = useState<string | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchMakes();
  }, []);

  useEffect(() => {
    if (selectedMakeId) {
      fetchModels(selectedMakeId);
    } else {
      setModels([]);
    }
  }, [selectedMakeId]);

  const fetchMakes = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicle_makes')
        .select('*')
        .order('name');

      if (error) throw error;
      setMakes(data || []);
    } catch (error) {
      console.error('Error fetching makes:', error);
    }
  };

  const fetchModels = async (makeId: string) => {
    try {
      const { data, error } = await supabase
        .from('vehicle_models')
        .select('*')
        .eq('make_id', makeId)
        .order('name');

      if (error) throw error;
      setModels(data || []);
    } catch (error) {
      console.error('Error fetching models:', error);
    }
  };

  const filteredMakes = makeSearch
    ? makes.filter(make => 
        make.name.toLowerCase().includes(makeSearch.toLowerCase())
      )
    : makes;

  const filteredModels = modelSearch
    ? models.filter(model =>
        model.name.toLowerCase().includes(modelSearch.toLowerCase())
      )
    : models;

  const handleMakeSelect = (make: Make) => {
    setVehicle({ ...vehicle, make: make.name, model: '' });
    setSelectedMakeId(make.id);
    setShowMakeDropdown(false);
    setMakeSearch('');
  };

  const handleModelSelect = (model: Model) => {
    setVehicle({ ...vehicle, model: model.name });
    setShowModelDropdown(false);
    setModelSearch('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('vehicles')
        .insert([
          {
            ...vehicle,
            owner_id: user?.id
          }
        ]);

      if (error) throw error;

      toast.success('Vehicul adăugat cu succes!');
      onUpdate();
      onClose();
    } catch (error) {
      toast.error('Eroare la adăugarea vehiculului');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Adăugați un vehicul
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marca
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={makeSearch || vehicle.make}
                  onChange={(e) => {
                    setMakeSearch(e.target.value);
                    setShowMakeDropdown(true);
                    if (!e.target.value) {
                      setSelectedMakeId(null);
                      setVehicle({ ...vehicle, make: '', model: '' });
                    }
                  }}
                  onFocus={() => setShowMakeDropdown(true)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pr-10"
                  placeholder="Selectați marca"
                  required
                />
                <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              {showMakeDropdown && filteredMakes.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredMakes.map((make) => (
                    <button
                      key={make.id}
                      type="button"
                      onClick={() => handleMakeSelect(make)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      {make.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={modelSearch || vehicle.model}
                  onChange={(e) => {
                    setModelSearch(e.target.value);
                    setShowModelDropdown(true);
                    if (!e.target.value) {
                      setVehicle({ ...vehicle, model: '' });
                    }
                  }}
                  onFocus={() => setShowModelDropdown(true)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pr-10"
                  placeholder="Selectați modelul"
                  required
                  disabled={!selectedMakeId}
                />
                <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              {showModelDropdown && filteredModels.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredModels.map((model) => (
                    <button
                      key={model.id}
                      type="button"
                      onClick={() => handleModelSelect(model)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      {model.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                An fabricație
              </label>
              <select
                value={vehicle.year}
                onChange={(e) => setVehicle({ ...vehicle, year: parseInt(e.target.value) })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Culoare
              </label>
              <input
                type="text"
                value={vehicle.color}
                onChange={(e) => setVehicle({ ...vehicle, color: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Număr de înmatriculare
            </label>
            <input
              type="text"
              value={vehicle.plate_number}
              onChange={(e) => setVehicle({ ...vehicle, plate_number: e.target.value })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
              placeholder="Exemplu: ABC 123"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nivel de confort
            </label>
            <select
              value={vehicle.comfort_level}
              onChange={(e) => setVehicle({ ...vehicle, comfort_level: e.target.value })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="basic">Basic</option>
              <option value="standard">Standard</option>
              <option value="premium">Premium</option>
              <option value="luxury">Luxury</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Anulează
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex items-center px-4 py-2 border border-transparent rounded-md text-white ${
                isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Salvează
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}