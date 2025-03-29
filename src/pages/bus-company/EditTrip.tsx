import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../lib/store';
import { MapPin, Calendar, Clock, Users, CreditCard, Bus, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { PlacesAutocomplete } from '../../components/PlacesAutocomplete';
import { MapPreview } from '../../components/MapPreview';
import { useGoogleMaps, defaultMapCenter, defaultMapOptions } from '../../lib/maps.tsx';

interface BusOption {
  id: string;
  registration_number: string;
  model: string;
  capacity: number;
}

interface Coordinates {
  lat: number;
  lng: number;
}

export function EditTrip() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [buses, setBuses] = useState<BusOption[]>([]);
  const [departureCoords, setDepartureCoords] = useState<Coordinates | null>(null);
  const [arrivalCoords, setArrivalCoords] = useState<Coordinates | null>(null);
  const [formData, setFormData] = useState({
    departure_location: '',
    arrival_location: '',
    departure_date: '',
    departure_time: '',
    arrival_date: '',
    arrival_time: '',
    available_seats: '',
    price: '',
    bus_id: '',
    intermediate_stops: '',
    estimated_duration: '',
    amenities: {
      wifi: false,
      ac: false,
      usb: false,
      toilet: false,
      luggage: false
    }
  });

  useEffect(() => {
    fetchTrip();
    fetchBuses();
  }, []);

  useEffect(() => {
    const updateCoordinates = async () => {
      if (formData.departure_location) {
        try {
          const coords = await geocodeAddress(formData.departure_location);
          setDepartureCoords(coords);
        } catch (error) {
          console.error('Error geocoding departure location:', error);
        }
      }
    };
    updateCoordinates();
  }, [formData.departure_location]);

  useEffect(() => {
    const updateCoordinates = async () => {
      if (formData.arrival_location) {
        try {
          const coords = await geocodeAddress(formData.arrival_location);
          setArrivalCoords(coords);
        } catch (error) {
          console.error('Error geocoding arrival location:', error);
        }
      }
    };
    updateCoordinates();
  }, [formData.arrival_location]);

  const fetchTrip = async () => {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      // Convert the departure_datetime and arrival_datetime to date and time
      const departureDateTime = new Date(data.departure_datetime);
      const arrivalDateTime = new Date(data.arrival_datetime);
      
      setFormData({
        departure_location: data.departure_location,
        arrival_location: data.arrival_location,
        departure_date: departureDateTime.toISOString().split('T')[0],
        departure_time: departureDateTime.toTimeString().slice(0, 5),
        arrival_date: arrivalDateTime.toISOString().split('T')[0],
        arrival_time: arrivalDateTime.toTimeString().slice(0, 5),
        available_seats: data.available_seats.toString(),
        price: data.price.toString(),
        bus_id: data.bus_id,
        intermediate_stops: data.intermediate_stops || '',
        estimated_duration: data.estimated_duration || '',
        amenities: data.amenities || {
          wifi: false,
          ac: false,
          usb: false,
          toilet: false,
          luggage: false
        }
      });
    } catch (error) {
      console.error('Error fetching trip:', error);
      toast.error('Error loading trip');
      navigate('/bus-company/trips');
    }
  };

  const fetchBuses = async () => {
    try {
      const { data: companyData, error: companyError } = await supabase
        .from('bus_companies')
        .select('id')
        .eq('owner_id', user?.id)
        .single();

      if (companyError) throw companyError;

      const { data, error } = await supabase
        .from('buses')
        .select('*')
        .eq('company_id', companyData.id)
        .eq('status', 'active');

      if (error) throw error;
      setBuses(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching buses:', error);
      toast.error('Error loading buses');
      setLoading(false);
    }
  };

  const validateFormData = (): string | null => {
    if (!formData.departure_location) return 'Departure location is required';
    if (!formData.arrival_location) return 'Arrival location is required';
    if (!formData.departure_date) return 'Departure date is required';
    if (!formData.departure_time) return 'Departure time is required';
    if (!formData.arrival_date) return 'Arrival date is required';
    if (!formData.arrival_time) return 'Arrival time is required';
    if (!formData.available_seats) return 'Available seats is required';
    if (!formData.price) return 'Price is required';
    if (!formData.bus_id) return 'Bus selection is required';

    const seats = parseInt(formData.available_seats);
    if (isNaN(seats) || seats <= 0) return 'Available seats must be a positive number';

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) return 'Price must be a positive number';

    const departureDateTime = new Date(`${formData.departure_date}T${formData.departure_time}`);
    const arrivalDateTime = new Date(`${formData.arrival_date}T${formData.arrival_time}`);
    if (arrivalDateTime <= departureDateTime) {
      return 'Arrival time must be after departure time';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validationError = validateFormData();
      if (validationError) {
        toast.error(validationError);
        setLoading(false);
        return;
      }

      const tripData = {
        departure_location: formData.departure_location.trim(),
        arrival_location: formData.arrival_location.trim(),
        departure_datetime: `${formData.departure_date}T${formData.departure_time}:00`,
        arrival_datetime: `${formData.arrival_date}T${formData.arrival_time}:00`,
        available_seats: parseInt(formData.available_seats),
        price: parseFloat(formData.price),
        bus_id: formData.bus_id,
        intermediate_stops: formData.intermediate_stops.trim() || null,
        estimated_duration: formData.estimated_duration.trim() || null,
        amenities: formData.amenities
      };

      const { error } = await supabase
        .from('trips')
        .update(tripData)
        .eq('id', id);

      if (error) throw error;

      toast.success('Trip updated successfully');
      navigate('/bus-company/trips');
    } catch (error: any) {
      console.error('Error updating trip:', error);
      toast.error(error.message || 'Error updating trip');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        amenities: {
          ...prev.amenities,
          [name]: checkbox.checked
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg p-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Trip</h1>
          <p className="text-gray-600">Update the details of your trip</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Route Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-blue-600" />
              Route Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Departure Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <PlacesAutocomplete
                    value={formData.departure_location}
                    onChange={(value) => setFormData(prev => ({ ...prev, departure_location: value }))}
                    placeholder="Enter departure location"
                    className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Arrival Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <PlacesAutocomplete
                    value={formData.arrival_location}
                    onChange={(value) => setFormData(prev => ({ ...prev, arrival_location: value }))}
                    placeholder="Enter arrival location"
                    className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 h-64 rounded-lg overflow-hidden">
              <MapPreview
                departureLocation={{
                  address: formData.departure_location,
                  coordinates: departureCoords
                }}
                arrivalLocation={{
                  address: formData.arrival_location,
                  coordinates: arrivalCoords
                }}
                showDirections={true}
                className="w-full h-full"
              />
            </div>
          </div>

          {/* Schedule Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              Schedule
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Departure Date & Time
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      name="departure_date"
                      value={formData.departure_date}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="time"
                      name="departure_time"
                      value={formData.departure_time}
                      onChange={handleChange}
                      className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Arrival Date & Time
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      name="arrival_date"
                      value={formData.arrival_date}
                      onChange={handleChange}
                      min={formData.departure_date}
                      className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="time"
                      name="arrival_time"
                      value={formData.arrival_time}
                      onChange={handleChange}
                      className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bus and Capacity Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Bus className="h-5 w-5 mr-2 text-blue-600" />
              Bus and Capacity
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Bus
                </label>
                <div className="relative">
                  <Bus className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <select
                    name="bus_id"
                    value={formData.bus_id}
                    onChange={handleChange}
                    className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  >
                    <option value="">Select a bus</option>
                    {buses.map(bus => (
                      <option key={bus.id} value={bus.id}>
                        {bus.model} - {bus.registration_number} ({bus.capacity} seats)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Seats
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    name="available_seats"
                    value={formData.available_seats}
                    onChange={handleChange}
                    min="1"
                    className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Number of seats"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Price Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
              Price
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price per Seat (MDL)
              </label>
              <div className="relative max-w-xs">
                <CreditCard className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Price in MDL"
                  required
                />
              </div>
            </div>
          </div>

          {/* Additional Details Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Info className="h-5 w-5 mr-2 text-blue-600" />
              Additional Details
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Intermediate Stops (optional)
                </label>
                <textarea
                  name="intermediate_stops"
                  value={formData.intermediate_stops}
                  onChange={handleChange}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter intermediate stops (one per line)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Duration (optional)
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="estimated_duration"
                    value={formData.estimated_duration}
                    onChange={handleChange}
                    className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="e.g. 2.5 hours"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amenities
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Object.entries(formData.amenities).map(([key, value]) => (
                    <label key={key} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name={key}
                        checked={value}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 capitalize">{key}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/bus-company/trips')}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Updating...' : 'Update Trip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 