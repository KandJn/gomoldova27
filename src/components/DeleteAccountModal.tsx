import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import { AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { createClient } from '@supabase/supabase-js';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteAccountModal({ isOpen, onClose }: DeleteAccountModalProps) {
  const [password, setPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const { user, setUser, setProfile } = useAuthStore();

  const handleDeleteAccount = async () => {
    if (!user || !password) return;

    try {
      setIsDeleting(true);

      // First verify the password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: password
      });

      if (signInError) {
        throw new Error('Parola incorectă');
      }

      // Create a Supabase client with service role key
      const supabaseAdmin = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
      );

      // Delete user data from profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Delete user data from preferences table
      const { error: preferencesError } = await supabase
        .from('preferences')
        .delete()
        .eq('user_id', user.id);

      if (preferencesError) throw preferencesError;

      // Delete the user account using admin client
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

      if (deleteError) {
        throw new Error('Nu s-a putut șterge contul. Vă rugăm să încercați din nou.');
      }

      // Sign out and clear local state
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);

      toast.success('Contul a fost șters cu succes');
      onClose();
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast.error(error.message || 'Eroare la ștergerea contului');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center mb-4">
          <AlertTriangle className="h-6 w-6 text-red-500 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">Ștergere cont</h2>
        </div>
        
        <p className="text-gray-600 mb-4">
          Această acțiune nu poate fi anulată. Toate datele tale vor fi șterse permanent și nu vei putea să te autentifici din nou.
        </p>

        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Parolă pentru confirmare
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Introduceți parola pentru confirmare"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Anulare
          </button>
          <button
            onClick={handleDeleteAccount}
            disabled={isDeleting || !password}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? 'Se șterge...' : 'Șterge cont'}
          </button>
        </div>
      </div>
    </div>
  );
} 