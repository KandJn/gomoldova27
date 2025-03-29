import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../lib/store';
import { Bus, Calendar, Info } from 'lucide-react';
import toast from 'react-hot-toast';

interface BusData {
  company_id: string;
  registration_number: string;
  model: string;
  capacity: number;
  year: number;
  last_maintenance_date: string;
  status: 'active';
}

export function NewBus() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    registration_number: '',
    model: '',
    capacity: '',
    year: new Date().getFullYear().toString(),
    last_maintenance_date: new Date().toISOString().split('T')[0]
  });

  const validateFormData = (): string | null => {
    if (!formData.registration_number) return 'Registration number is required';
    if (!formData.model) return 'Model is required';
    if (!formData.capacity) return 'Capacity is required';
    if (!formData.year) return 'Year is required';
    if (!formData.last_maintenance_date) return 'Last maintenance date is required';

    const capacity = parseInt(formData.capacity);
    if (isNaN(capacity) || capacity <= 0) return 'Capacity must be a positive number';

    const year = parseInt(formData.year);
    const currentYear = new Date().getFullYear();
    if (isNaN(year) || year < 1900 || year > currentYear + 1) {
      return `Year must be between 1900 and ${currentYear + 1}`;
    }

    const maintenanceDate = new Date(formData.last_maintenance_date);
    if (isNaN(maintenanceDate.getTime())) return 'Invalid maintenance date';

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

      // Get the company ID from the user's session
      const { data: companies, error: companyError } = await supabase
        .from('bus_companies')
        .select('id')
        .eq('owner_id', user?.id);

      if (companyError) {
        console.error('Error fetching company:', companyError);
        toast.error('Failed to fetch company details');
        setLoading(false);
        return;
      }

      if (!companies || companies.length === 0) {
        toast.error('No bus company found. Please create a company first.');
        setLoading(false);
        return;
      }

      const company_id = companies[0].id;

      // Create the bus
      const busData: BusData = {
        company_id: company_id,
        registration_number: formData.registration_number.trim().toUpperCase(),
        model: formData.model.trim(),
        capacity: parseInt(formData.capacity),
        year: parseInt(formData.year),
        last_maintenance_date: formData.last_maintenance_date,
        status: 'active'
      };

      console.log('Creating bus with data:', busData);

      const { error: insertError } = await supabase
        .from('buses')
        .insert([busData]);

      if (insertError) {
        console.error('Error creating bus:', insertError);
        toast.error('Failed to create bus: ' + insertError.message);
        setLoading(false);
        return;
      }

      toast.success('Bus created successfully');
      navigate('/bus-company/buses');
    } catch (error: any) {
      console.error('Error:', error);
      toast.error('Failed to create bus');
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Bus</h1>
          <p className="text-gray-600">Fill in the details to add a new bus to your fleet</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Bus Details Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Bus className="h-5 w-5 mr-2 text-blue-600" />
              Bus Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Number
                </label>
                <input
                  type="text"
                  name="registration_number"
                  value={formData.registration_number}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter registration number"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model
                </label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter bus model"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacity (Seats)
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  min="1"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter number of seats"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year
                </label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
            </div>
          </div>

          {/* Maintenance Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              Maintenance Information
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Maintenance Date
              </label>
              <input
                type="date"
                name="last_maintenance_date"
                value={formData.last_maintenance_date}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/bus-company/buses')}
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
              {loading ? 'Creating...' : 'Create Bus'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 