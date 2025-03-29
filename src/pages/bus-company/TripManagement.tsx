import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../lib/store';
import { Button, Modal, TextInput, Label, Select } from 'flowbite-react';
import { HiPencil, HiTrash, HiPlus, HiEye } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Plus, Edit2, Trash2, Search, MapPin, Calendar, Clock, Users, CreditCard, Bus } from 'lucide-react';

interface Trip {
  id: string;
  bus_id: string;
  from_city: string;
  to_city: string;
  departure_date: string;
  departure_time: string;
  arrival_date: string;
  arrival_time: string;
  price: number;
  available_seats: number;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  bus: {
    registration_number: string;
    model: string;
  };
}

interface Bus {
  id: string;
  registration_number: string;
  model: string;
  capacity: number;
}

interface TripFormData {
  bus_id: string;
  from_city: string;
  to_city: string;
  departure_date: string;
  departure_time: string;
  arrival_date: string;
  arrival_time: string;
  price: number;
}

const formatDateTime = (datetime: string) => {
  const date = new Date(datetime);
  return {
    date: date.toLocaleDateString(),
    time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
};

export const BusCompanyTrips = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [formData, setFormData] = useState<TripFormData>({
    bus_id: '',
    from_city: '',
    to_city: '',
    departure_date: '',
    departure_time: '',
    arrival_date: '',
    arrival_time: '',
    price: 0
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTrips();
    fetchBuses();
  }, []);

  const fetchTrips = async () => {
    try {
      setLoading(true);

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
        .from('trips')
        .select(`
          *,
          bus:buses (
            registration_number,
            model
          )
        `)
        .eq('company_id', company.id)
        .order('departure_date', { ascending: true });

      if (error) throw error;
      setTrips(data || []);
    } catch (error) {
      console.error('Error fetching trips:', error);
      toast.error('Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  const fetchBuses = async () => {
    try {
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
    } catch (error) {
      console.error('Error fetching buses:', error);
      toast.error('Failed to load buses');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Get company ID
      const { data: company } = await supabase
        .from('bus_companies')
        .select('id')
        .eq('owner_id', user?.id)
        .single();

      if (!company) {
        toast.error('Company not found');
        return;
      }

      // Get bus capacity
      const bus = buses.find(b => b.id === formData.bus_id);
      if (!bus) {
        toast.error('Selected bus not found');
        return;
      }

      if (editingTrip) {
        // Update existing trip
        const { error } = await supabase
          .from('trips')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingTrip.id);

        if (error) throw error;
        toast.success('Trip updated successfully');
      } else {
        // Create new trip
        const { error } = await supabase
          .from('trips')
          .insert([
            {
              ...formData,
              company_id: company.id,
              status: 'scheduled',
              available_seats: bus.capacity
            }
          ]);

        if (error) throw error;
        toast.success('Trip created successfully');
      }

      setShowModal(false);
      setEditingTrip(null);
      resetForm();
      fetchTrips();
    } catch (error) {
      console.error('Error saving trip:', error);
      toast.error('Failed to save trip');
    }
  };

  const handleEdit = (trip: Trip) => {
    setEditingTrip(trip);
    setFormData({
      bus_id: trip.bus_id,
      from_city: trip.from_city,
      to_city: trip.to_city,
      departure_date: trip.departure_date,
      departure_time: trip.departure_time,
      arrival_date: trip.arrival_date,
      arrival_time: trip.arrival_time,
      price: trip.price
    });
    setShowModal(true);
  };

  const handleDelete = async (tripId: string) => {
    if (!confirm('Are you sure you want to delete this trip?')) return;

    try {
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', tripId);

      if (error) throw error;
      toast.success('Trip deleted successfully');
      fetchTrips();
    } catch (error) {
      console.error('Error deleting trip:', error);
      toast.error('Failed to delete trip');
    }
  };

  const resetForm = () => {
    setFormData({
      bus_id: '',
      from_city: '',
      to_city: '',
      departure_date: '',
      departure_time: '',
      arrival_date: '',
      arrival_time: '',
      price: 0
    });
  };

  const getStatusColor = (status: Trip['status']) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTrips = trips.filter(trip => {
    const searchLower = searchTerm.toLowerCase();
    return (
      trip.from_city.toLowerCase().includes(searchLower) ||
      trip.to_city.toLowerCase().includes(searchLower) ||
      trip.bus.model.toLowerCase().includes(searchLower) ||
      trip.bus.registration_number.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Trip Management</h1>
            <p className="text-gray-600">Manage your bus trips and schedules</p>
          </div>
          <button
            onClick={() => navigate('/bus-company/trips/new')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add New Trip
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading trips...</p>
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
            <Bus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Trips Found</h3>
            <p className="text-gray-600 mb-6">Get started by creating your first trip.</p>
            <button
              onClick={() => navigate('/bus-company/trips/new')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 inline-flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Add New Trip
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Route</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date & Time</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Bus</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Seats</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Price</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTrips.map((trip) => {
                    const departure = {
                      date: trip.departure_date,
                      time: trip.departure_time
                    };
                    const arrival = {
                      date: trip.arrival_date,
                      time: trip.arrival_time
                    };
                    return (
                      <tr key={trip.id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <div className="flex items-center text-sm text-gray-900 font-medium">
                              <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                              {trip.from_city}
                            </div>
                            <div className="flex items-center text-sm text-gray-600 mt-1">
                              <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                              {trip.to_city}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <div className="flex items-center text-sm text-gray-900">
                              <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                              {departure.date}
                            </div>
                            <div className="flex items-center text-sm text-gray-600 mt-1">
                              <Clock className="h-4 w-4 text-gray-400 mr-1" />
                              {departure.time}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm text-gray-900">{trip.bus.registration_number}</span>
                            <span className="text-sm text-gray-600">{trip.bus.model}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="h-4 w-4 text-gray-400 mr-1" />
                            {trip.available_seats}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <CreditCard className="h-4 w-4 text-gray-400 mr-1" />
                            {trip.price} MDL
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${trip.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                              trip.status === 'completed' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'}`}>
                            {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-3">
                          <button
                            onClick={() => navigate(`/bus-company/trips/${trip.id}/edit`)}
                            className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                          >
                            <Edit2 className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(trip.id)}
                            className="text-red-600 hover:text-red-800 transition-colors duration-200"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Trip Modal */}
      <Modal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingTrip(null);
          resetForm();
        }}
        size="xl"
      >
        <Modal.Header>
          {editingTrip ? 'Edit Trip' : 'Create New Trip'}
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="bus_id">Bus</Label>
              <Select
                id="bus_id"
                value={formData.bus_id}
                onChange={(e) => setFormData({ ...formData, bus_id: e.target.value })}
                required
              >
                <option value="">Select a bus</option>
                {buses.map((bus) => (
                  <option key={bus.id} value={bus.id}>
                    {bus.model} - {bus.registration_number} ({bus.capacity} seats)
                  </option>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="from_city">From City</Label>
                <TextInput
                  id="from_city"
                  value={formData.from_city}
                  onChange={(e) => setFormData({ ...formData, from_city: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="to_city">To City</Label>
                <TextInput
                  id="to_city"
                  value={formData.to_city}
                  onChange={(e) => setFormData({ ...formData, to_city: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="departure_date">Departure Date</Label>
                <TextInput
                  id="departure_date"
                  type="date"
                  value={formData.departure_date}
                  onChange={(e) => setFormData({ ...formData, departure_date: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="departure_time">Departure Time</Label>
                <TextInput
                  id="departure_time"
                  type="time"
                  value={formData.departure_time}
                  onChange={(e) => setFormData({ ...formData, departure_time: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="arrival_date">Arrival Date</Label>
                <TextInput
                  id="arrival_date"
                  type="date"
                  value={formData.arrival_date}
                  onChange={(e) => setFormData({ ...formData, arrival_date: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="arrival_time">Arrival Time</Label>
                <TextInput
                  id="arrival_time"
                  type="time"
                  value={formData.arrival_time}
                  onChange={(e) => setFormData({ ...formData, arrival_time: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="price">Price ($)</Label>
              <TextInput
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                required
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                color="gray"
                onClick={() => {
                  setShowModal(false);
                  setEditingTrip(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {editingTrip ? 'Update Trip' : 'Create Trip'}
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
}; 