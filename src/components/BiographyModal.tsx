import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import toast from 'react-hot-toast';

interface BiographyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBio: string;
  onUpdate: () => void;
}

export function BiographyModal({ isOpen, onClose, currentBio, onUpdate }: BiographyModalProps) {
  const [bio, setBio] = useState(currentBio);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuthStore();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ bio })
        .eq('id', user?.id);

      if (error) throw error;

      toast.success('Biografie actualizată cu succes!');
      onUpdate();
      onClose();
    } catch (error) {
      toast.error('Eroare la actualizarea biografiei');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          Adăugați o mini-biografie
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Despre mine
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={6}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Spuneți-ne câteva lucruri despre dvs..."
            />
            <p className="mt-2 text-sm text-gray-500">
              Scrieți o scurtă descriere despre dvs., interesele și stilul dvs. de călătorie.
            </p>
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