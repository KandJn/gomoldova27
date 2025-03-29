import { supabase } from './supabase';
import { Notification } from './types';
import toast from 'react-hot-toast';

export const NotificationService = {
  // Fetch all notifications for a user
  async fetchNotifications(userId: string): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Nu s-au putut încărca notificările');
      return [];
    }
  },

  // Subscribe to new notifications
  subscribeToNotifications(userId: string, onUpdate: () => void) {
    return supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, () => {
        onUpdate();
        toast('Aveți o notificare nouă', {
          icon: '🔔',
        });
      })
      .subscribe();
  },

  // Mark a notification as read
  async markAsRead(notificationId: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Nu s-a putut marca notificarea ca citită');
    }
  },

  // Delete a notification
  async deleteNotification(notificationId: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Nu s-a putut șterge notificarea');
    }
  },

  // Create a new notification
  async createNotification(notification: Omit<Notification, 'id' | 'created_at' | 'read_at'>): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert([notification]);

      if (error) throw error;
    } catch (error) {
      console.error('Error creating notification:', error);
      toast.error('Nu s-a putut crea notificarea');
    }
  }
}; 