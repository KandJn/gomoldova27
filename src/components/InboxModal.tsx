import React, { useState, useEffect } from 'react';
import { X, MessageCircle, Bell } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import type { Message, Notification } from '../lib/types';

interface InboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenChat: (userId: string) => void;
}

export function InboxModal({ isOpen, onClose, onOpenChat }: InboxModalProps) {
  const [activeTab, setActiveTab] = useState<'notifications' | 'messages'>('notifications');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    if (isOpen && user) {
      fetchNotifications();
      fetchMessages();
      subscribeToNewMessages();
      subscribeToNewNotifications();
    }
  }, [isOpen, user]);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      toast.error('Eroare la încărcarea notificărilor');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(
            full_name,
            avatar_url
          )
        `)
        .or(`sender_id.eq.${user?.id},receiver_id.eq.${user?.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group messages by conversation partner
      const groupedMessages = data?.reduce((acc, message) => {
        const partnerId = message.sender_id === user?.id ? message.receiver_id : message.sender_id;
        if (!acc[partnerId]) {
          acc[partnerId] = message;
        }
        return acc;
      }, {} as Record<string, Message>);

      setMessages(Object.values(groupedMessages || {}));
    } catch (error) {
      toast.error('Eroare la încărcarea mesajelor');
    }
  };

  const subscribeToNewMessages = () => {
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${user?.id}`,
      }, () => {
        fetchMessages();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const subscribeToNewNotifications = () => {
    const subscription = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user?.id}`,
      }, () => {
        fetchNotifications();
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user?.id}`,
      }, () => {
        fetchNotifications();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const handleNotificationClick = async (notificationId: number) => {
    try {
      await supabase.rpc('mark_notification_as_read', {
        notification_id: notificationId
      });
      // Fetch notifications to update the UI
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMessageClick = async (messageId: number, partnerId: string) => {
    try {
      await supabase.rpc('mark_message_as_read', {
        message_id: messageId
      });
      onOpenChat(partnerId);
      onClose();
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex items-center px-4 py-2 rounded-md ${
                activeTab === 'notifications'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Bell className="h-5 w-5 mr-2" />
              Notificări
              {notifications.filter(n => !n.read_at).length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {notifications.filter(n => !n.read_at).length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`flex items-center px-4 py-2 rounded-md ${
                activeTab === 'messages'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Mesaje
              {messages.filter(m => !m.read_at && m.receiver_id === user?.id).length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {messages.filter(m => !m.read_at && m.receiver_id === user?.id).length}
                </span>
              )}
            </button>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(80vh-4rem)]">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Se încarcă...</p>
            </div>
          ) : activeTab === 'notifications' ? (
            <div className="divide-y divide-gray-200">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  Nu aveți notificări
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer ${
                      !notification.read_at ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification.id)}
                  >
                    {notification.type === 'booking_request' && (
                      <div>
                        <p className="text-gray-900">
                          Aveți o nouă cerere de rezervare pentru călătorie
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {format(new Date(notification.created_at), 'PPp')}
                        </p>
                      </div>
                    )}
                    {notification.type === 'booking_accepted' && (
                      <div>
                        <p className="text-gray-900">
                          Cererea dvs. de rezervare a fost acceptată
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {format(new Date(notification.created_at), 'PPp')}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {messages.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  Nu aveți mesaje
                </div>
              ) : (
                messages.map((message) => {
                  const partnerId = message.sender_id === user?.id ? message.receiver_id : message.sender_id;
                  return (
                    <div
                      key={message.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer ${
                        !message.read_at && message.receiver_id === user?.id
                          ? 'bg-blue-50'
                          : ''
                      }`}
                      onClick={() => handleMessageClick(message.id, partnerId)}
                    >
                      <div className="flex items-start space-x-3">
                        <img
                          src={
                            message.sender.avatar_url ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              message.sender.full_name
                            )}`
                          }
                          alt={message.sender.full_name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-gray-900">
                              {message.sender.full_name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {format(new Date(message.created_at), 'PPp')}
                            </p>
                          </div>
                          <p className="text-gray-600 mt-1">{message.content}</p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenChat(partnerId);
                              onClose();
                            }}
                            className="mt-2 text-blue-600 hover:text-blue-800 flex items-center"
                          >
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Răspunde
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}