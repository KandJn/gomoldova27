import React, { useEffect, useState } from 'react';
import { X, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import toast from 'react-hot-toast';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Profile {
  full_name: string;
  phone: string;
  bio: string;
  is_driver: boolean;
  avatar_url: string;
  id_number: string;
  driver_license: string;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const user = useAuthStore((state) => state.user);
  const [profile, setProfile] = useState<Profile>({
    full_name: '',
    phone: '',
    bio: '',
    is_driver: false,
    avatar_url: '',
    id_number: '',
    driver_license: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      if (data) {
        setProfile({
          full_name: data.full_name || '',
          phone: data.phone || '',
          bio: data.bio || '',
          is_driver: data.is_driver || false,
          avatar_url: data.avatar_url || '',
          id_number: data.id_number || '',
          driver_license: data.driver_license || ''
        });
      }
    } catch (error) {
      toast.error('Eroare la încărcarea profilului');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
          bio: profile.bio,
          is_driver: profile.is_driver,
          avatar_url: profile.avatar_url,
          id_number: profile.id_number,
          driver_license: profile.driver_license
        })
        .eq('id', user?.id);

      if (error) throw error;
      toast.success('Profil actualizat cu succes!');
      onClose();
    } catch (error) {
      toast.error('Eroare la actualizarea profilului');
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="flex items-center mb-6">
          <User className="h-8 w-8 text-blue-600 mr-2" />
          <h2 className="text-2xl font-bold">Profilul meu</h2>
        </div>

        {loading ? (
          <div className="text-center py-4">Se încarcă...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nume complet
              </label>
              <input
                type="text"
                name="full_name"
                value={profile.full_name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Telefon
              </label>
              <input
                type="tel"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Număr buletin
              </label>
              <input
                type="text"
                name="id_number"
                value={profile.id_number}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Despre mine
              </label>
              <textarea
                name="bio"
                value={profile.bio}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                URL Avatar
              </label>
              <input
                type="url"
                name="avatar_url"
                value={profile.avatar_url}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="https://example.com/avatar.jpg"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_driver"
                  checked={profile.is_driver}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Vreau să devin șofer
                </label>
              </div>

              {profile.is_driver && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Număr permis de conducere
                  </label>
                  <input
                    type="text"
                    name="driver_license"
                    value={profile.driver_license}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Salvează modificările
            </button>
          </form>
        )}
      </div>
    </div>
  );
}