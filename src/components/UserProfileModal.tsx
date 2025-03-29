import React, { useState } from 'react';
import { X, MessageCircle, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { ChatModal } from './ChatModal';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import toast from 'react-hot-toast';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    bio: string | null;
    travel_preferences: any;
    verification_status: string;
    created_at: string;
  } | null;
  onOpenChat: (userId: string) => void;
}

export function UserProfileModal({ isOpen, onClose, user, onOpenChat }: UserProfileModalProps) {
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const { user: currentUser } = useAuthStore();

  if (!isOpen || !user) return null;

  const handleSendMessage = async (message: string) => {
    if (!currentUser) {
      toast.error('Trebuie să fiți autentificat pentru a trimite mesaje');
      return;
    }

    try {
      // First send the message
      const { error } = await supabase.from('messages').insert([
        {
          content: message,
          sender_id: currentUser.id,
          receiver_id: user.id,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      // Close the chat modal
      setIsChatModalOpen(false);
      
      // Then open the chat with the user
      onOpenChat(user.id);
      
      toast.success('Mesaj trimis cu succes!');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Nu s-a putut trimite mesajul. Încercați din nou.');
      throw error; // Re-throw to be handled by the ChatModal
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg w-full max-w-md relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Profile content */}
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center space-x-4 mb-6">
              <img
                src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=random&color=fff&size=192`}
                alt={user.full_name}
                className="w-20 h-20 rounded-full object-cover"
              />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{user.full_name}</h2>
                <p className="text-gray-500">
                  Membru din {format(new Date(user.created_at), 'MMMM yyyy', { locale: ro })}
                </p>
                {user.verification_status === 'verified' && (
                  <div className="flex items-center mt-1 text-green-600">
                    <Shield className="h-4 w-4 mr-1" />
                    <span className="text-sm">Verificat</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bio */}
            {user.bio && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Despre</h3>
                <p className="text-gray-600">{user.bio}</p>
              </div>
            )}

            {/* Travel Preferences */}
            {user.travel_preferences && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Preferințe de călătorie</h3>
                <div className="space-y-2">
                  {user.travel_preferences.music && (
                    <div className="text-sm text-gray-600">🎵 Ascultă muzică în mașină</div>
                  )}
                  {user.travel_preferences.conversation && (
                    <div className="text-sm text-gray-600">💬 Deschis la conversație</div>
                  )}
                  {user.travel_preferences.pets && (
                    <div className="text-sm text-gray-600">🐾 Acceptă animale de companie</div>
                  )}
                </div>
              </div>
            )}

            {/* Message Button */}
            <button
              onClick={() => setIsChatModalOpen(true)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              disabled={!currentUser}
              title={!currentUser ? 'Trebuie să fiți autentificat pentru a trimite mesaje' : ''}
            >
              <MessageCircle className="h-5 w-5" />
              <span>Trimite mesaj</span>
            </button>
          </div>
        </div>
      </div>

      <ChatModal
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
        recipientName={user.full_name}
        onSendMessage={handleSendMessage}
      />
    </>
  );
} 