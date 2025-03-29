import React, { useState, useEffect } from 'react';
import { X, MapPin, Calendar, Clock, Users, CreditCard, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import toast from 'react-hot-toast';
import { PlacesAutocomplete } from './PlacesAutocomplete';

interface CreateTripModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateTripModal({ isOpen, onClose }: CreateTripModalProps) {
  const user = useAuthStore((state) => state.user);
  const [isDriver, setIsDriver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [fromAddress, setFromAddress] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [tripData, setTripData] = useState({
    date: '',
    time: '',
    price: '',
    seats: '4',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      checkDriverStatus();
    }
  }, [user]);

  const checkDriverStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_driver')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setIsDriver(data?.is_driver || false);
    } catch (error) {
      toast.error('Eroare la verificarea statusului de șofer');
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!fromCity) {
      newErrors.from = 'Orașul de plecare este obligatoriu';
    }
    if (!toCity) {
      newErrors.to = 'Orașul de destinație este obligatoriu';
    }
    if (!fromAddress) {
      newErrors.fromAddress = 'Adresa de plecare este obligatorie';
    }
    if (!toAddress) {
      newErrors.toAddress = 'Adresa de destinație este obligatorie';
    }
    if (!tripData.date) {
      newErrors.date = 'Data este obligatorie';
    }
    if (!tripData.time) {
      newErrors.time = 'Ora este obligatorie';
    }
    if (!tripData.price || parseInt(tripData.price) <= 0) {
      newErrors.price = 'Prețul trebuie să fie mai mare decât 0';
    }
    if (!tripData.seats || parseInt(tripData.seats) < 1 || parseInt(tripData.seats) > 8) {
      newErrors.seats = 'Numărul de locuri trebuie să fie între 1 și 8';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isDriver) {
      toast.error('Trebuie să fiți șofer pentru a crea călătorii');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('trips').insert([
        {
          from_city: fromCity,
          to_city: toCity,
          from_address: fromAddress,
          to_address: toAddress,
          date: tripData.date,
          time: tripData.time,
          price: Number(tripData.price),
          seats: Number(tripData.seats),
          driver_id: user?.id,
        },
      ]);

      if (error) throw error;
      toast.success('Călătorie creată cu succes!');
      onClose();
    } catch (error) {
      toast.error('Eroare la crearea călătoriei');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTripData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>

        <h2 className="text-2xl font-bold mb-6">Creează o călătorie nouă</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Oraș de plecare
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <PlacesAutocomplete
                value={fromCity}
                onChange={setFromCity}
                placeholder="Selectați orașul de plecare"
              />
            </div>
            {errors.from && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.from}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="from-address" className="block text-sm font-medium text-gray-700 mb-1">
              Adresa de plecare
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                id="from-address"
                name="from-address"
                type="text"
                value={fromAddress}
                onChange={(e) => setFromAddress(e.target.value)}
                placeholder="Introduceți adresa exactă"
                className="pl-10 w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                aria-label="Adresa de plecare"
              />
            </div>
            {errors.fromAddress && (
              <p className="mt-1 text-sm text-red-600 flex items-center" role="alert">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.fromAddress}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="to-city" className="block text-sm font-medium text-gray-700 mb-1">
              Oraș de destinație
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <PlacesAutocomplete
                id="to-city"
                name="to-city"
                value={toCity}
                onChange={setToCity}
                placeholder="Selectați orașul de destinație"
              />
            </div>
            {errors.to && (
              <p className="mt-1 text-sm text-red-600 flex items-center" role="alert">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.to}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="to-address" className="block text-sm font-medium text-gray-700 mb-1">
              Adresa de destinație
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                id="to-address"
                name="to-address"
                type="text"
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
                placeholder="Introduceți adresa exactă"
                className="pl-10 w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                aria-label="Adresa de destinație"
              />
            </div>
            {errors.toAddress && (
              <p className="mt-1 text-sm text-red-600 flex items-center" role="alert">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.toAddress}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="trip-date" className="block text-sm font-medium text-gray-700 mb-1">
                Data
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  id="trip-date"
                  name="trip-date"
                  type="date"
                  value={tripData.date}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="pl-10 w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  aria-label="Data călătoriei"
                />
              </div>
              {errors.date && (
                <p className="mt-1 text-sm text-red-600 flex items-center" role="alert">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.date}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="trip-time" className="block text-sm font-medium text-gray-700 mb-1">
                Ora
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  id="trip-time"
                  name="trip-time"
                  type="time"
                  value={tripData.time}
                  onChange={handleChange}
                  className="pl-10 w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  aria-label="Ora călătoriei"
                />
              </div>
              {errors.time && (
                <p className="mt-1 text-sm text-red-600 flex items-center" role="alert">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.time}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="trip-price" className="block text-sm font-medium text-gray-700 mb-1">
                Preț (MDL)
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  id="trip-price"
                  name="trip-price"
                  type="number"
                  value={tripData.price}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className="pl-10 w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  aria-label="Preț per loc"
                />
              </div>
              {errors.price && (
                <p className="mt-1 text-sm text-red-600 flex items-center" role="alert">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.price}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="trip-seats" className="block text-sm font-medium text-gray-700 mb-1">
                Locuri disponibile
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  id="trip-seats"
                  name="trip-seats"
                  type="number"
                  value={tripData.seats}
                  onChange={handleChange}
                  min="1"
                  max="8"
                  className="pl-10 w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  aria-label="Număr de locuri disponibile"
                />
              </div>
              {errors.seats && (
                <p className="mt-1 text-sm text-red-600 flex items-center" role="alert">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.seats}
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full flex items-center justify-center py-3 px-4 rounded-md text-white transition-colors ${
              isSubmitting
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Se creează...
              </>
            ) : (
              'Creează călătoria'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}