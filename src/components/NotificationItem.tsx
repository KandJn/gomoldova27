import React from 'react';
import { Clock, Bell, MessageCircle, Check, X, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { Link, useNavigate } from 'react-router-dom';

interface NotificationItemProps {
  notification: any;
  onMarkAsRead: (id: string) => void;
  onOpenChat?: (userId: string) => void;
  onClose?: () => void;
}

export function NotificationItem({ notification, onMarkAsRead, onOpenChat, onClose }: NotificationItemProps) {
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Acum câteva minute';
    } else if (diffInHours < 24) {
      return `Acum ${diffInHours} ${diffInHours === 1 ? 'oră' : 'ore'}`;
    } else if (diffInHours < 48) {
      return 'Ieri';
    } else {
      return format(date, 'd MMM', { locale: ro });
    }
  };
  
  const getNotificationContent = () => {
    switch (notification.type) {
      case 'new_booking_request':
        return {
          icon: <Bell className="h-5 w-5 text-blue-600" />,
          title: 'Cerere nouă de rezervare',
          description: notification.content?.trip_details 
            ? `Un pasager a solicitat un loc în călătoria ${notification.content.trip_details.from_city} - ${notification.content.trip_details.to_city} din ${format(new Date(notification.content.trip_details.date), 'dd MMMM', { locale: ro })}`
            : 'Un pasager a solicitat un loc în călătoria ta',
          link: '/booking-requests',
          linkText: 'Vezi cererea',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-800'
        };
      case 'booking_approved':
        return {
          icon: <Check className="h-5 w-5 text-green-600" />,
          title: 'Rezervare acceptată',
          description: notification.content?.trip_details 
            ? `Rezervarea pentru călătoria ${notification.content.trip_details.from_city} - ${notification.content.trip_details.to_city} din ${format(new Date(notification.content.trip_details.date), 'dd MMMM', { locale: ro })} a fost acceptată`
            : 'Rezervarea dvs. a fost acceptată',
          link: `/trip/${notification.content?.trip_id}`,
          linkText: 'Vezi detalii',
          bgColor: 'bg-green-50',
          textColor: 'text-green-800',
          showChat: true,
          chatUserId: notification.content?.driver_id
        };
      case 'booking_rejected':
        return {
          icon: <X className="h-5 w-5 text-red-600" />,
          title: 'Rezervare respinsă',
          description: notification.content?.trip_details 
            ? `Rezervarea pentru călătoria ${notification.content.trip_details.from_city} - ${notification.content.trip_details.to_city} din ${format(new Date(notification.content.trip_details.date), 'dd MMMM', { locale: ro })} a fost respinsă`
            : 'Rezervarea dvs. a fost respinsă',
          link: `/trips`,
          linkText: 'Caută alte călătorii',
          bgColor: 'bg-red-50',
          textColor: 'text-red-800'
        };
      case 'trip_reminder':
        return {
          icon: <Calendar className="h-5 w-5 text-purple-600" />,
          title: 'Reminder călătorie',
          description: notification.content?.trip_details 
            ? `Călătoria ${notification.content.trip_details.from_city} - ${notification.content.trip_details.to_city} începe în curând (${format(new Date(notification.content.trip_details.date), 'dd MMMM', { locale: ro })})`
            : 'Călătoria ta începe în curând',
          link: `/trip/${notification.content?.trip_id}`,
          linkText: 'Vezi detaliile călătoriei',
          bgColor: 'bg-purple-50',
          textColor: 'text-purple-800'
        };
      case 'new_message':
        return {
          icon: <MessageCircle className="h-5 w-5 text-indigo-600" />,
          title: 'Mesaj nou',
          description: notification.content?.passenger_name 
            ? `Ai primit un mesaj nou de la ${notification.content.passenger_name}`
            : 'Ai primit un mesaj nou',
          link: '/messages',
          linkText: 'Vezi mesajul',
          bgColor: 'bg-indigo-50',
          textColor: 'text-indigo-800',
          showChat: true,
          chatUserId: notification.content?.passenger_id || notification.content?.driver_id
        };
      default:
        return {
          icon: <Bell className="h-5 w-5 text-gray-600" />,
          title: 'Notificare',
          description: 'Ai o notificare nouă',
          link: notification.content?.link || '#',
          linkText: 'Vezi detalii',
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-800'
        };
    }
  };

  const content = getNotificationContent();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!notification.read_at) {
      onMarkAsRead(notification.id);
    }
    if (onClose) {
      onClose();
    }
    navigate(content.link);
  };

  return (
    <div 
      className={`${content.bgColor} rounded-lg p-4 transition-all duration-300 hover:shadow-md ${
        !notification.read_at ? 'border-l-4 border-blue-500' : ''
      }`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {content.icon}
        </div>
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between">
            <p className={`text-sm font-medium ${content.textColor}`}>
              {content.title}
            </p>
            <span className="text-xs text-gray-500">
              {formatDate(notification.created_at)}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            {content.description}
          </p>
          <div className="mt-3 flex items-center space-x-4">
            <button
              onClick={handleClick}
              className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              {content.linkText}
            </button>
            {content.showChat && onOpenChat && notification.content?.driver_id && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenChat(notification.content.driver_id);
                }}
                className="text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors flex items-center"
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                Chat
              </button>
            )}
          </div>
        </div>
        {!notification.read_at && (
          <div className="ml-3">
            <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
          </div>
        )}
      </div>
    </div>
  );
}