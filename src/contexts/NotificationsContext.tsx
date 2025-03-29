import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';

interface Notification {
  id: string;
  type: string;
  content: string;
  created_at: string;
  read_at: string | null;
  receiver_id?: string;
  sender_id?: string;
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  pendingRegistrations: any[];
  refetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType>({
  notifications: [],
  unreadCount: 0,
  pendingRegistrations: [],
  refetchNotifications: async () => {},
  markAsRead: async () => {},
});

// Export the context provider as a named export
export const NotificationsProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingRegistrations, setPendingRegistrations] = useState<any[]>([]);
  const { user } = useAuthStore();

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      // Get all notifications
      const { data: notificationsData, error: notificationsError } = await supabase
        .from('messages')
        .select('id, content, created_at, read_at, receiver_id, sender_id')
        .eq('receiver_id', user.id)
        .order('created_at', { ascending: false });

      if (notificationsError) {
        console.error('Notifications error:', notificationsError);
        return;
      }
      
      // Add type field to messages
      const messagesWithType = (notificationsData || []).map(msg => ({
        ...msg,
        type: 'message'
      }));
      
      setNotifications(messagesWithType);

      // Calculate unread count from notifications data
      const unreadCount = messagesWithType.filter(msg => !msg.read_at).length;
      setUnreadCount(unreadCount);

      // Get pending company registrations if user is admin
      const checkIsAdmin = async () => {
        try {
          const { data: adminData, error } = await supabase.rpc('is_admin');
          
          if (error) {
            console.error('Admin check error:', error);
            return false;
          }

          return adminData || false;
        } catch (error) {
          console.error('Admin check error:', error);
          return false;
        }
      };

      const isAdmin = await checkIsAdmin();

      if (isAdmin) {
        // Query bus companies with status = 'pending'
        const { data: registrations, error: registrationsError } = await supabase
          .from('bus_companies')
          .select('id, company_name, created_at, status')
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        if (registrationsError) {
          console.error('Error fetching pending registrations:', registrationsError);
          return;
        }

        setPendingRegistrations(registrations || []);

        if (registrations) {
          // Add pending registrations to notifications
          const pendingRegistrationsNotifications = registrations.map((registration: any) => ({
            id: `pending-registration-${registration.id}`,
            type: 'pending_registration',
            content: `New bus company registration: ${registration.company_name}`,
            created_at: registration.created_at,
            read_at: null,
          }));

          setNotifications(prev => [...prev, ...pendingRegistrationsNotifications]);
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Set default values in case of error
      setNotifications([]);
      setUnreadCount(0);
      setPendingRegistrations([]);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase.rpc('mark_notification_as_read_v2', {
        notification_id: notificationId
      });

      if (error) throw error;
      await fetchNotifications(); // Refresh notifications after marking as read
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  useEffect(() => {
    let mounted = true;
    
    if (user) {
      fetchNotifications();

      // Subscribe to new messages
      const messagesSubscription = supabase
        .channel('messages')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`,
        }, () => {
          if (mounted) {
            fetchNotifications();
          }
        })
        .subscribe();

      // Subscribe to company registrations if admin
      const registrationsSubscription = supabase
        .channel('bus_companies')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'bus_companies',
          filter: 'status=eq.pending',
        }, () => {
          if (mounted) {
            fetchNotifications();
          }
        })
        .subscribe();

      return () => {
        mounted = false;
        messagesSubscription.unsubscribe();
        registrationsSubscription.unsubscribe();
      };
    }
  }, [user]);

  const value = {
    notifications,
    unreadCount,
    pendingRegistrations,
    refetchNotifications: fetchNotifications,
    markAsRead
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

// Export the hook as a named export
export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}; 