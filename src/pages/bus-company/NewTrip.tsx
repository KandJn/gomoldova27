import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../lib/store';
import { Bus, Calendar, Clock, MapPin, Users, CreditCard, Info } from 'lucide-react';
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

interface TripData {
  company_id: string;
  bus_id: string;
  departure_location: string;
  arrival_location: string;
  from_city: string;
  to_city: string;
  departure_date: string;
  departure_time: string;
  arrival_date: string;
  arrival_time: string;
  departure_datetime: string;
  arrival_datetime: string;
  available_seats: number;
  price: number;
  price_per_seat: number;
  intermediate_stops: string | null;
  estimated_duration: string | null;
  amenities: {
    wifi: boolean;
    ac: boolean;
    usb: boolean;
    toilet: boolean;
    luggage: boolean;
  };
  status: 'scheduled';
}

export function NewTrip() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [buses, setBuses] = useState<BusOption[]>([]);
  const [loadingBuses, setLoadingBuses] = useState(true);
  const [departureCoords, setDepartureCoords] = useState<Coordinates | null>(null);
  const [arrivalCoords, setArrivalCoords] = useState<Coordinates | null>(null);
  const [formData, setFormData] = useState({
    departure_location: '',
    arrival_location: '',
    departure_date: new Date().toISOString().split('T')[0],
    departure_time: '08:00',
    arrival_date: new Date().toISOString().split('T')[0],
    arrival_time: '10:00',
    available_seats: '',
    price_per_seat: '',
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

  const fetchBuses = async () => {
    try {
      setLoadingBuses(true);
      
      // Get company ID first
      const { data: company } = await supabase
        .from('bus_companies')
        .select('id')
        .eq('owner_id', user?.id)
        .single();

      if (!company) {
        toast.error('Company not found');
        return;
      }

      const { data, error } = await supabase
        .from('buses')
        .select('id, registration_number, model, capacity')
        .eq('company_id', company.id)
        .eq('status', 'active');

      if (error) throw error;
      setBuses(data || []);
    } catch (error: any) {
      console.error('Error fetching buses:', error);
      toast.error('Failed to load buses');
    } finally {
      setLoadingBuses(false);
    }
  };

  const validateFormData = (): string | null => {
    if (!formData.departure_location) return 'Departure location is required';
    if (!formData.arrival_location) return 'Arrival location is required';
    if (!formData.departure_date) return 'Departure date is required';
    if (!formData.departure_time) return 'Departure time is required';
    if (!formData.arrival_date) return 'Arrival date is required';
    if (!formData.arrival_time) return 'Arrival time is required';
    if (!formData.bus_id) return 'Please select a bus';
    if (!formData.available_seats) return 'Available seats is required';
    if (!formData.price_per_seat) return 'Price per seat is required';

    const departureDateTime = new Date(`${formData.departure_date}T${formData.departure_time}`);
    const arrivalDateTime = new Date(`${formData.arrival_date}T${formData.arrival_time}`);
    
    if (isNaN(departureDateTime.getTime())) return 'Invalid departure date/time';
    if (isNaN(arrivalDateTime.getTime())) return 'Invalid arrival date/time';
    if (arrivalDateTime <= departureDateTime) return 'Arrival time must be after departure time';

    const now = new Date();
    if (departureDateTime < now) return 'Departure time cannot be in the past';

    const availableSeats = parseInt(formData.available_seats);
    if (isNaN(availableSeats) || availableSeats <= 0) return 'Available seats must be a positive number';

    const price = parseFloat(formData.price_per_seat);
    if (isNaN(price) || price <= 0) return 'Price per seat must be a positive number';

    // Validate against selected bus capacity
    const selectedBus = buses.find(bus => bus.id === formData.bus_id);
    if (selectedBus && availableSeats > selectedBus.capacity) {
      return `Available seats cannot exceed bus capacity (${selectedBus.capacity} seats)`;
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form data
      const validationError = validateFormData();
      if (validationError) {
        toast.error(validationError);
        return;
      }

      // Get company ID
      const { data: company, error: companyError } = await supabase
        .from('bus_companies')
        .select('id')
        .eq('owner_id', user?.id)
        .single();

      if (companyError) {
        console.error('Error fetching company:', companyError);
        throw new Error('Failed to fetch company details');
      }

      if (!company) {
        throw new Error('Company not found');
      }

      const selectedBus = buses.find(bus => bus.id === formData.bus_id);
      if (!selectedBus) {
        throw new Error('Selected bus not found');
      }

      const tripData: TripData = {
        company_id: company.id,
        bus_id: formData.bus_id,
        departure_location: formData.departure_location.trim(),
        arrival_location: formData.arrival_location.trim(),
        from_city: formData.departure_location.trim(),
        to_city: formData.arrival_location.trim(),
        departure_date: formData.departure_date,
        departure_time: formData.departure_time,
        arrival_date: formData.arrival_date,
        arrival_time: formData.arrival_time,
        departure_datetime: `${formData.departure_date}T${formData.departure_time}:00`,
        arrival_datetime: `${formData.arrival_date}T${formData.arrival_time}:00`,
        available_seats: parseInt(formData.available_seats),
        price: parseFloat(formData.price_per_seat),
        price_per_seat: parseFloat(formData.price_per_seat),
        intermediate_stops: formData.intermediate_stops?.trim() || null,
        estimated_duration: formData.estimated_duration?.trim() || null,
        amenities: formData.amenities,
        status: 'scheduled'
      };

      console.log('Inserting trip data:', tripData); // Add this for debugging

      const { error: insertError } = await supabase
        .from('trips')
        .insert([tripData]);

      if (insertError) {
        console.error('Error inserting trip:', insertError);
        throw new Error(insertError.message || 'Failed to create trip');
      }

      toast.success('Trip created successfully');
      navigate('/bus-company/trips');
    } catch (error: any) {
      console.error('Error creating trip:', error);
      toast.error(error.message || 'Failed to create trip');
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

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Trip</h1>
          <p className="text-gray-600">Fill in the details to create a new trip schedule</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Journey Details Section */}
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

          {/* Bus and Capacity Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Bus className="h-5 w-5 mr-2 text-blue-600" />
              Bus and Capacity
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
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
                    placeholder="Enter number of seats"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price per Seat (MDL)
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    name="price_per_seat"
                    value={formData.price_per_seat}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter price per seat"
                    required
                  />
                </div>
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
                  {Object.entries({
                    wifi: 'WiFi',
                    ac: 'AC',
                    usb: 'USB',
                    toilet: 'Toilet',
                    luggage: 'Luggage'
                  }).map(([key, label]) => (
                    <label key={key} className="relative flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer transition-all duration-200">
                      <input
                        type="checkbox"
                        name={key}
                        checked={formData.amenities[key as keyof typeof formData.amenities]}
                        onChange={handleChange}
                        className="absolute h-full w-full opacity-0 cursor-pointer"
                      />
                      <span className={`text-sm font-medium ${
                        formData.amenities[key as keyof typeof formData.amenities]
                          ? 'text-blue-600'
                          : 'text-gray-600'
                      }`}>
                        {label}
                      </span>
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
              disabled={loading || loadingBuses}
              className={`px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 ${
                (loading || loadingBuses) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Creating...' : 'Create Trip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 