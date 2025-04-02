import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Car, MessageCircle, CreditCard, Settings, LogOut, Shield, ClipboardList, LayoutDashboard, Bus } from 'lucide-react';
import { useAuthStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { useNotifications } from '../contexts/NotificationsContext';
import { useAvatar } from '../contexts/AvatarContext';
import { useTranslation } from 'react-i18next';

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onMouseLeave?: () => void;
  onOpenChat?: (userId: string) => void;
}

export function ProfileDropdown({ isOpen, onClose, onMouseLeave, onOpenChat }: ProfileDropdownProps) {
  const { user, setUser, profile } = useAuthStore();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const { notifications, unreadCount, pendingRegistrations, markAsRead } = useNotifications();
  const { avatarTimestamp } = useAvatar();
  const [isCompanyProfile, setIsCompanyProfile] = useState(false);
  const [localProfile, setLocalProfile] = useState(profile);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mounted = useRef(false);
  const [imageError, setImageError] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    mounted.current = true;
    console.log('ProfileDropdown mounted/updated with user:', user?.id);
    
    const fetchData = async () => {
      if (!user?.id || !mounted.current) return;
      
      try {
        console.log('Fetching profile data');
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;
        if (mounted.current && profileData) {
          console.log('Setting local profile:', profileData);
          setLocalProfile(profileData);
        }

        const { data: companyData, error: companyError } = await supabase
          .from('bus_companies')
          .select('id, user_id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (companyError && companyError.code !== 'PGRST116') {
          throw companyError;
        }

        if (mounted.current) {
          setIsCompanyProfile(!!companyData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();

    return () => {
      mounted.current = false;
      console.log('ProfileDropdown cleanup');
    };
  }, [user?.id]);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleMouseLeave = () => {
    if (onMouseLeave) {
      timeoutRef.current = setTimeout(onMouseLeave, 500);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      toast.success(t('profile.dropdown.logout_success'));
    } catch (error) {
      toast.error(t('profile.dropdown.logout_error'));
    }
  };

  const getNotificationCount = (type: string) => {
    return notifications?.filter(n => n?.type?.startsWith(type))?.length || 0;
  };

  const handleMarkAsRead = async (type: string) => {
    const notificationsToMark = notifications.filter(n => n.type.startsWith(type) && !n.read_at);
    for (const notification of notificationsToMark) {
      await markAsRead(notification.id);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const getAvatarUrl = () => {
    if (imageError || !localProfile?.avatar_url) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(localProfile?.full_name || 'User')}&background=random&color=fff&size=192`;
    }
    return localProfile.avatar_url;
  };

  if (!user) return null;

  return (
    <div className="relative inline-block w-full" ref={dropdownRef}>
      {isOpen && (
        <div 
          className="profile-dropdown absolute left-1/2 -translate-x-1/2 mt-12 w-64 bg-white rounded-lg shadow-lg overflow-hidden z-50 border border-gray-200"
          style={{ 
            transformOrigin: 'center top',
            transform: 'translateX(-50%)'
          }}
          onMouseEnter={() => {
            handleMouseEnter();
            // Ensure dropdown stays open on hover
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }
          }}
          onMouseLeave={handleMouseLeave}
        >
          <div className="p-4 bg-gray-50 flex items-center border-b border-gray-200">
            <div className="flex-shrink-0 mr-3">
              <div className="w-12 h-12 rounded-full overflow-hidden">
                <img
                  src={getAvatarUrl()}
                  alt={localProfile?.full_name || 'User'}
                  className="w-12 h-12 rounded-full object-cover"
                  onError={handleImageError}
                />
              </div>
            </div>
            <div>
              <div className="font-medium text-gray-800">
                {localProfile?.full_name || 'Utilizator'}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {user?.email || 'No email'}
              </div>
            </div>
          </div>
          <div className="py-1">
            <Link
              to="/profile"
              onClick={() => {
                handleMarkAsRead('profile');
                onClose();
              }}
              className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 relative"
            >
              <div className="flex items-center">
                <User className="h-4 w-4 mr-3" />
                {t('profile.dropdown.my_profile')}
              </div>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>

            <Link
              to="/my-trips"
              onClick={() => {
                handleMarkAsRead('trip');
                onClose();
              }}
              className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <div className="flex items-center">
                <Car className="h-4 w-4 mr-3" />
                {t('profile.dropdown.my_trips')}
              </div>
              {getNotificationCount('trip') > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getNotificationCount('trip')}
                </span>
              )}
            </Link>

            <Link
              to="/booking-requests"
              onClick={() => {
                handleMarkAsRead('booking');
                onClose();
              }}
              className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <div className="flex items-center">
                <ClipboardList className="h-4 w-4 mr-3" />
                {t('profile.dropdown.my_bookings')}
              </div>
              {getNotificationCount('booking') > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getNotificationCount('booking')}
                </span>
              )}
            </Link>

            <Link
              to="/messages"
              onClick={() => {
                handleMarkAsRead('message');
                onClose();
              }}
              className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <div className="flex items-center">
                <MessageCircle className="h-4 w-4 mr-3" />
                {t('profile.dropdown.messages')}
              </div>
              {getNotificationCount('message') > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getNotificationCount('message')}
                </span>
              )}
            </Link>

            <Link
              to="/transfers"
              onClick={() => {
                handleMarkAsRead('transfer');
                onClose();
              }}
              className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <div className="flex items-center">
                <CreditCard className="h-4 w-4 mr-3" />
                {t('profile.dropdown.payments')}
              </div>
              {getNotificationCount('transfer') > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getNotificationCount('transfer')}
                </span>
              )}
            </Link>

            <Link
              to="/payments"
              onClick={() => {
                handleMarkAsRead('payment');
                onClose();
              }}
              className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <div className="flex items-center">
                <Settings className="h-4 w-4 mr-3" />
                {t('profile.dropdown.settings')}
              </div>
              {getNotificationCount('payment') > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getNotificationCount('payment')}
                </span>
              )}
            </Link>

            {user?.email === 'asassin.damian@gmail.com' && (
              <Link
                to="/admin"
                onClick={onClose}
                className="flex items-center px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
              >
                <Shield className="h-4 w-4 mr-3" />
                Panou administrare
              </Link>
            )}

            <div className="border-t border-gray-100 mt-1">
              <button
                onClick={handleLogout}
                className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-3" />
                {t('profile.dropdown.logout')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}