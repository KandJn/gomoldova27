import React, { useState, useEffect, useRef } from 'react';
import { X, Bell } from 'lucide-react';
import { useAuthStore } from '../lib/store';
import { NotificationService } from '../lib/notificationService';
import { NotificationItem } from './NotificationItem';
import type { Notification } from '../lib/types';
import { AnimatePresence, motion } from 'framer-motion';

interface NotificationsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenChat?: (userId: string) => void;
  onUnreadCountChange?: (count: number) => void;
}

export function NotificationsDropdown({ isOpen, onClose, onOpenChat, onUnreadCountChange }: NotificationsDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const subscription = NotificationService.subscribeToNotifications(user.id, fetchNotifications);
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  useEffect(() => {
    const unreadCount = notifications.filter(n => !n.read_at).length;
    onUnreadCountChange?.(unreadCount);
  }, [notifications, onUnreadCountChange]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const fetchNotifications = async () => {
    if (!user) return;
    
    setLoading(true);
    const data = await NotificationService.fetchNotifications(user.id);
    setNotifications(data);
    setLoading(false);
  };

  const handleNotificationClick = async (notificationId: string) => {
    await NotificationService.markAsRead(notificationId);
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  if (!isOpen) return null;

  return (
    <div ref={dropdownRef} className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg overflow-hidden z-50">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center">
        <div className="flex items-center">
          <Bell className="h-5 w-5 text-blue-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Notificări</h2>
          {notifications.filter(n => !n.read_at).length > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {notifications.filter(n => !n.read_at).length}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="max-h-[60vh] overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Se încarcă...</p>
          </div>
        ) : (
          <AnimatePresence>
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Nu aveți notificări
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="hover:bg-gray-50"
                  >
                    <NotificationItem
                      notification={notification}
                      onMarkAsRead={handleNotificationClick}
                      onOpenChat={onOpenChat}
                      onClose={onClose}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
} 