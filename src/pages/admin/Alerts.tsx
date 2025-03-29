import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../lib/store';
import { Bell, AlertTriangle, Info, CheckCircle, X, Eye, CheckCheck, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

interface Alert {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  created_at: string;
  read_at: string | null;
  user_id: string | null;
  target_type: string | null;
  target_id: string | null;
}

export function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    checkAdminAccess();
    fetchAlerts();
  }, [user, filter]);

  const checkAdminAccess = () => {
    if (!user?.id) {
      toast.error('Trebuie să fiți autentificat pentru a accesa această pagină');
      return;
    }
  };

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      
      // Check if system_alerts table exists first
      const { error: tableCheckError } = await supabase
        .from('system_alerts')
        .select('id')
        .limit(1);
      
      // If table doesn't exist, use mock data
      if (tableCheckError) {
        console.log('System alerts table not found, using mock data');
        const mockAlerts: Alert[] = [
          {
            id: '1',
            title: 'Sistem de plăți întrerupt temporar',
            message: 'Serviciul de procesare a plăților este momentan indisponibil. Echipa tehnică lucrează la rezolvarea problemei. Utilizatorii pot întâmpina dificultăți la efectuarea plăților online.',
            severity: 'error',
            created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
            read_at: null,
            user_id: null,
            target_type: 'payment',
            target_id: null
          },
          {
            id: '2',
            title: 'Actualizare de sistem programată',
            message: 'O actualizare de sistem este programată pentru data de 25.04.2025, între orele 02:00 - 04:00. În acest interval, platforma va fi indisponibilă. Vă rugăm să planificați în consecință.',
            severity: 'info',
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
            read_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            user_id: null,
            target_type: 'system',
            target_id: null
          },
          {
            id: '3',
            title: 'Trafic crescut pe platformă',
            message: 'În acest moment înregistrăm un volum neobișnuit de trafic. Unii utilizatori pot experimenta întârzieri în încărcarea paginilor sau în procesarea cererilor. Vă mulțumim pentru înțelegere.',
            severity: 'warning',
            created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            read_at: null,
            user_id: null,
            target_type: 'system',
            target_id: null
          },
          {
            id: '4',
            title: 'Nou parteneriat cu compania de autobuze Flix',
            message: 'Am încheiat un nou parteneriat cu compania de autobuze Flix. Utilizatorii vor putea vedea și rezerva călătorii operate de această companie începând cu data de 1 mai 2025.',
            severity: 'success',
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            read_at: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString(),
            user_id: null,
            target_type: 'partnership',
            target_id: 'flix'
          },
          {
            id: '5',
            title: 'Creștere semnificativă a numărului de utilizatori',
            message: 'În ultima săptămână, am înregistrat o creștere cu 15% a numărului de utilizatori noi. Aceasta este o veste excelentă pentru platforma noastră!',
            severity: 'info',
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
            read_at: null,
            user_id: null,
            target_type: 'analytics',
            target_id: null
          },
        ];
        
        if (filter === 'unread') {
          setAlerts(mockAlerts.filter(alert => !alert.read_at));
        } else if (filter === 'read') {
          setAlerts(mockAlerts.filter(alert => alert.read_at));
        } else {
          setAlerts(mockAlerts);
        }
        
        setLoading(false);
        return;
      }
      
      // Real implementation with Supabase
      let query = supabase
        .from('system_alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter === 'unread') {
        query = query.is('read_at', null);
      } else if (filter === 'read') {
        query = query.not('read_at', 'is', null);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast.error('Eroare la încărcarea alertelor');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (alertId: string) => {
    try {
      // Check if using mock data
      if (alerts.find(a => a.id === '1')) {
        // Using mock data
        setAlerts(prev => 
          prev.map(alert => 
            alert.id === alertId ? { ...alert, read_at: new Date().toISOString() } : alert
          )
        );
        toast.success('Alertă marcată ca citită');
        return;
      }
      
      // Real implementation
      const { error } = await supabase
        .from('system_alerts')
        .update({ read_at: new Date().toISOString() })
        .eq('id', alertId);

      if (error) throw error;
      
      setAlerts(prev => 
        prev.map(alert => 
          alert.id === alertId ? { ...alert, read_at: new Date().toISOString() } : alert
        )
      );
      
      toast.success('Alertă marcată ca citită');
    } catch (error) {
      console.error('Error marking alert as read:', error);
      toast.error('Eroare la marcarea alertei ca citită');
    }
  };

  const markAllAsRead = async () => {
    try {
      // Check if using mock data
      if (alerts.find(a => a.id === '1')) {
        // Using mock data
        setAlerts(prev => 
          prev.map(alert => ({ ...alert, read_at: alert.read_at || new Date().toISOString() }))
        );
        toast.success('Toate alertele au fost marcate ca citite');
        return;
      }
      
      // Real implementation
      const { error } = await supabase
        .from('system_alerts')
        .update({ read_at: new Date().toISOString() })
        .is('read_at', null);

      if (error) throw error;
      
      setAlerts(prev => 
        prev.map(alert => ({ ...alert, read_at: alert.read_at || new Date().toISOString() }))
      );
      
      toast.success('Toate alertele au fost marcate ca citite');
    } catch (error) {
      console.error('Error marking all alerts as read:', error);
      toast.error('Eroare la marcarea alertelor ca citite');
    }
  };

  const handleViewDetails = (alert: Alert) => {
    setSelectedAlert(alert);
    setIsDetailModalOpen(true);
    
    if (!alert.read_at) {
      markAsRead(alert.id);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getSeverityClass = (severity: string) => {
    switch (severity) {
      case 'info':
        return 'bg-blue-50 border-blue-100';
      case 'warning':
        return 'bg-yellow-50 border-yellow-100';
      case 'error':
        return 'bg-red-50 border-red-100';
      case 'success':
        return 'bg-green-50 border-green-100';
      default:
        return 'bg-gray-50 border-gray-100';
    }
  };

  const filteredAlerts = alerts || [];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alerte de sistem</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitorizare și gestionare alerte de sistem
          </p>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-sm rounded-md ${
              filter === 'all' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Toate
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1.5 text-sm rounded-md ${
              filter === 'unread' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Necitite
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`px-3 py-1.5 text-sm rounded-md ${
              filter === 'read' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Citite
          </button>
          <button
            onClick={markAllAsRead}
            className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md flex items-center"
          >
            <CheckCheck className="h-4 w-4 mr-1" />
            Marchează toate ca citite
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Nu există alerte</h3>
          <p className="text-gray-500 mt-2">
            Nu există alerte de sistem {filter === 'unread' ? 'necitite' : filter === 'read' ? 'citite' : ''} în acest moment.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`border rounded-lg p-4 ${getSeverityClass(alert.severity)} ${
                !alert.read_at ? 'border-l-4' : ''
              }`}
            >
              <div className="flex justify-between">
                <div className="flex items-start space-x-3">
                  {getSeverityIcon(alert.severity)}
                  <div>
                    <h3 className="font-medium text-gray-900">{alert.title}</h3>
                    <p className="text-gray-600 mt-1 line-clamp-2">{alert.message}</p>
                    <div className="flex items-center space-x-3 mt-2 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {format(new Date(alert.created_at), 'dd MMM yyyy, HH:mm', { locale: ro })}
                      </span>
                      {alert.read_at && (
                        <span className="flex items-center text-green-600">
                          <CheckCheck className="h-4 w-4 mr-1" />
                          Citit
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewDetails(alert)}
                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                    title="Vizualizează detalii"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                  {!alert.read_at && (
                    <button
                      onClick={() => markAsRead(alert.id)}
                      className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded"
                      title="Marchează ca citit"
                    >
                      <CheckCheck className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Alert Detail Modal */}
      {isDetailModalOpen && selectedAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl overflow-hidden">
            <div className="flex justify-between items-center border-b px-6 py-4">
              <h3 className="text-lg font-medium">Detalii alertă</h3>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium mb-4 ${
                selectedAlert.severity === 'info' ? 'bg-blue-100 text-blue-800' :
                selectedAlert.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                selectedAlert.severity === 'error' ? 'bg-red-100 text-red-800' :
                'bg-green-100 text-green-800'
              }`}>
                {getSeverityIcon(selectedAlert.severity)}
                <span className="ml-1 capitalize">{selectedAlert.severity}</span>
              </div>
              
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{selectedAlert.title}</h2>
              <p className="text-gray-600 whitespace-pre-line mb-4">{selectedAlert.message}</p>
              
              <div className="border-t pt-4 mt-4 text-sm text-gray-500 space-y-2">
                <div className="flex justify-between">
                  <span>Data creării:</span>
                  <span>{format(new Date(selectedAlert.created_at), 'dd MMMM yyyy, HH:mm:ss', { locale: ro })}</span>
                </div>
                {selectedAlert.read_at && (
                  <div className="flex justify-between">
                    <span>Citit la:</span>
                    <span>{format(new Date(selectedAlert.read_at), 'dd MMMM yyyy, HH:mm:ss', { locale: ro })}</span>
                  </div>
                )}
                {selectedAlert.target_type && (
                  <div className="flex justify-between">
                    <span>Tip țintă:</span>
                    <span className="capitalize">{selectedAlert.target_type}</span>
                  </div>
                )}
                {selectedAlert.target_id && (
                  <div className="flex justify-between">
                    <span>ID țintă:</span>
                    <span className="font-mono">{selectedAlert.target_id}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end border-t">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md"
              >
                Închide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 