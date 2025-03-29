import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, Calendar, Clock, MapPin, CreditCard, Wifi, Coffee, Tv, Plus, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import { PlacesAutocomplete } from '../components/PlacesAutocomplete';
import toast from 'react-hot-toast';

export function BusRouteCreation() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fromCity: '',
    toCity: '',
    departureDate: '',
    departureTime: '',
    arrivalDate: '',
    arrivalTime: '',
    price: '',
    seats: '',
    busType: '',
    amenities: {
      wifi: false,
      powerOutlets: false,
      airConditioning: false,
      toilet: false,
      entertainment: false,
      snacks: false,
      recliningSeats: false,
      luggageSpace: false
    },
    pickupPoint: '',
    dropoffPoint: '',
    bookingConditions: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!user) {
        throw new Error('Trebuie să fiți autentificat pentru a crea o rută');
      }

      // Verify company status
      const { data: company, error: companyError } = await supabase
        .from('bus_companies')
        .select('verification_status')
        .eq('owner_id', user.id)
        .single();

      if (companyError) throw companyError;

      if (!company || company.verification_status !== 'verified') {
        throw new Error('Compania dvs. trebuie să fie verificată pentru a putea crea rute');
      }

      // Create route
      const { error: routeError } = await supabase
        .from('bus_routes')
        .insert([
          {
            company_id: company.id,
            from_city: formData.fromCity,
            to_city: formData.toCity,
            departure_date: formData.departureDate,
            departure_time: formData.departureTime,
            arrival_date: formData.arrivalDate,
            arrival_time: formData.arrivalTime,
            price: parseInt(formData.price),
            seats: parseInt(formData.seats),
            bus_type: formData.busType,
            amenities: formData.amenities,
            pickup_point: formData.pickupPoint,
            dropoff_point: formData.dropoffPoint,
            booking_conditions: formData.bookingConditions
          }
        ]);

      if (routeError) throw routeError;

      toast.success('Ruta a fost creată cu succes!');
      navigate('/bus-routes');
    } catch (error: any) {
      console.error('Error creating route:', error);
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <Bus className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">
            Creează o Rută Nouă
          </h1>
          <p className="mt-2 text-gray-600">
            Completați detaliile pentru noua rută internațională
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Route Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Informații Rută
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Oraș plecare (Moldova)
                  </label>
                  <PlacesAutocomplete
                    value={formData.fromCity}
                    onChange={(value) => setFormData({ ...formData, fromCity: value })}
                    placeholder="Selectați orașul de plecare"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Oraș destinație
                  </label>
                  <input
                    type="text"
                    value={formData.toCity}
                    onChange={(e) => setFormData({ ...formData, toCity: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Program
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Data plecării
                  </label>
                  <input
                    type="date"
                    value={formData.departureDate}
                    onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Ora plecării
                  </label>
                  <input
                    type="time"
                    value={formData.departureTime}
                    onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Data sosirii
                  </label>
                  <input
                    type="date"
                    value={formData.arrivalDate}
                    onChange={(e) => setFormData({ ...formData, arrivalDate: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Ora sosirii
                  </label>
                  <input
                    type="time"
                    value={formData.arrivalTime}
                    onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Bus Details */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Detalii Autocar
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tip autocar
                  </label>
                  <select
                    value={formData.busType}
                    onChange={(e) => setFormData({ ...formData, busType: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option value="">Selectați tipul</option>
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
                    <option value="luxury">Luxury</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Număr locuri
                  </label>
                  <input
                    type="number"
                    value={formData.seats}
                    onChange={(e) => setFormData({ ...formData, seats: e.target.value })}
                    min="1"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Facilități
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.amenities.wifi}
                    onChange={(e) => setFormData({
                      ...formData,
                      amenities: { ...formData.amenities, wifi: e.target.checked }
                    })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-gray-700">Wi-Fi</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.amenities.powerOutlets}
                    onChange={(e) => setFormData({
                      ...formData,
                      amenities: { ...formData.amenities, powerOutlets: e.target.checked }
                    })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-gray-700">Prize electrice</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.amenities.airConditioning}
                    onChange={(e) => setFormData({
                      ...formData,
                      amenities: { ...formData.amenities, airConditioning: e.target.checked }
                    })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-gray-700">Aer condiționat</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.amenities.toilet}
                    onChange={(e) => setFormData({
                      ...formData,
                      amenities: { ...formData.amenities, toilet: e.target.checked }
                    })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-gray-700">Toaletă</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.amenities.entertainment}
                    onChange={(e) => setFormData({
                      ...formData,
                      amenities: { ...formData.amenities, entertainment: e.target.checked }
                    })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-gray-700">Sistem multimedia</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.amenities.snacks}
                    onChange={(e) => setFormData({
                      ...formData,
                      amenities: { ...formData.amenities, snacks: e.target.checked }
                    })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-gray-700">Gustări și băuturi</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.amenities.recliningSeats}
                    onChange={(e) => setFormData({
                      ...formData,
                      amenities: { ...formData.amenities, recliningSeats: e.target.checked }
                    })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-gray-700">Scaune rabatabile</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.amenities.luggageSpace}
                    onChange={(e) => setFormData({
                      ...formData,
                      amenities: { ...formData.amenities, luggageSpace: e.target.checked }
                    })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-gray-700">Spațiu bagaje mare</span>
                </label>
              </div>
            </div>

            {/* Pickup and Drop-off */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Puncte de Îmbarcare/Debarcare
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Punct de îmbarcare
                  </label>
                  <textarea
                    value={formData.pickupPoint}
                    onChange={(e) => setFormData({ ...formData, pickupPoint: e.target.value })}
                    rows={2}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Descrieți locația exactă de îmbarcare"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Punct de debarcare
                  </label>
                  <textarea
                    value={formData.dropoffPoint}
                    onChange={(e) => setFormData({ ...formData, dropoffPoint: e.target.value })}
                    rows={2}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Descrieți locația exactă de debarcare"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Price and Conditions */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Preț și Condiții
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Preț per loc (MDL)
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    min="0"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Condiții de rezervare
                  </label>
                  <textarea
                    value={formData.bookingConditions}
                    onChange={(e) => setFormData({ ...formData, bookingConditions: e.target.value })}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Descrieți condițiile de rezervare, politica de anulare, etc."
                    required
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white ${
                  isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Se procesează...
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5 mr-2" />
                    Publică ruta
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}