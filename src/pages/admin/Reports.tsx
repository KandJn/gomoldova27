import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../lib/store';
import {
  FileText,
  Search,
  Filter,
  X,
  AlertTriangle,
  Check,
  Ban,
  MessageCircle,
  Flag,
  User,
  Car,
  BarChart2,
  Download
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

export const AdminReports: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<any[]>([]);
  const [filter, setFilter] = useState('all'); // all, pending, resolved, dismissed
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'resolve' | 'dismiss' | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.email === 'asassin.damian@gmail.com') {
      fetchReports();
    }
  }, [user]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      
      // Example: Fetch some aggregated data from your tables
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('status, created_at')
        .order('created_at', { ascending: false });

      if (bookingsError) throw bookingsError;

      // Process the data for reports
      const processedReports = [
        {
          id: 1,
          title: 'Booking Statistics',
          description: 'Overview of booking statuses and trends',
          lastUpdated: new Date().toISOString(),
          data: bookingsData
        },
        // Add more report types as needed
      ];

      setReports(processedReports);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Error loading reports');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = (reportId: number) => {
    // Implement report download logic
    toast.success('Report download started');
  };

  const handleAction = async () => {
    if (!selectedReport || !actionType || !actionNotes) return;
    
    setIsSubmitting(true);
    try {
      // In a real app, this would update the report in the database
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

      const updatedReports = reports.map(report =>
        report.id === selectedReport.id
          ? { ...report, status: actionType === 'resolve' ? 'resolved' : 'dismissed' }
          : report
      );

      setReports(updatedReports);
      toast.success(
        actionType === 'resolve'
          ? 'Raport rezolvat cu succes'
          : 'Raport respins'
      );

      setIsActionModalOpen(false);
      setSelectedReport(null);
      setActionType(null);
      setActionNotes('');
    } catch (error) {
      console.error('Error handling report:', error);
      toast.error('Eroare la procesarea raportului');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredReports = reports.filter(report => {
    if (filter !== 'all' && report.status !== filter) {
      return false;
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        report.reporter.full_name.toLowerCase().includes(query) ||
        report.reporter.email.toLowerCase().includes(query) ||
        (report.type === 'user' && (
          report.reported_user.full_name.toLowerCase().includes(query) ||
          report.reported_user.email.toLowerCase().includes(query)
        )) ||
        (report.type === 'trip' && (
          report.reported_trip.from_city.toLowerCase().includes(query) ||
          report.reported_trip.to_city.toLowerCase().includes(query) ||
          report.reported_trip.driver.full_name.toLowerCase().includes(query)
        ))
      );
    }
    
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Rapoarte și reclamații
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Gestionați rapoartele și reclamațiile utilizatorilor
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Căutare raport..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center px-4 py-2 border rounded-lg bg-white hover:bg-gray-50"
              >
                <Filter className="h-5 w-5 mr-2" />
                Filtrează
              </button>
              
              {isFilterOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 py-1">
                  <button
                    onClick={() => {
                      setFilter('all');
                      setIsFilterOpen(false);
                    }}
                    className={`block px-4 py-2 text-sm w-full text-left ${
                      filter === 'all' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Toate rapoartele
                  </button>
                  <button
                    onClick={() => {
                      setFilter('pending');
                      setIsFilterOpen(false);
                    }}
                    className={`block px-4 py-2 text-sm w-full text-left ${
                      filter === 'pending' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    În așteptare
                  </button>
                  <button
                    onClick={() => {
                      setFilter('resolved');
                      setIsFilterOpen(false);
                    }}
                    className={`block px-4 py-2 text-sm w-full text-left ${
                      filter === 'resolved' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Rezolvate
                  </button>
                  <button
                    onClick={() => {
                      setFilter('dismissed');
                      setIsFilterOpen(false);
                    }}
                    className={`block px-4 py-2 text-sm w-full text-left ${
                      filter === 'dismissed' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Respinse
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {report.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {report.description}
                  </p>
                  <p className="text-xs text-gray-400">
                    Last updated: {new Date(report.lastUpdated).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDownloadReport(report.id)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                  title="Download report"
                >
                  <Download className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Action Modal */}
        {isActionModalOpen && selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {actionType === 'resolve' ? 'Rezolvare raport' : 'Respingere raport'}
                </h3>
                <button
                  onClick={() => {
                    setIsActionModalOpen(false);
                    setSelectedReport(null);
                    setActionType(null);
                    setActionNotes('');
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-500">
                  {actionType === 'resolve'
                    ? 'Confirmați rezolvarea acestui raport? Această acțiune va notifica utilizatorul care a raportat.'
                    : 'Confirmați respingerea acestui raport? Această acțiune va notifica utilizatorul care a raportat.'}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  {actionType === 'resolve' ? 'Note rezolvare' : 'Motiv respingere'}
                </label>
                <textarea
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder={actionType === 'resolve' ? 'Descrieți acțiunile întreprinse...' : 'Explicați motivul respingerii...'}
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setIsActionModalOpen(false);
                    setSelectedReport(null);
                    setActionType(null);
                    setActionNotes('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Anulează
                </button>
                <button
                  onClick={handleAction}
                  disabled={isSubmitting || !actionNotes.trim()}
                  className={`px-4 py-2 border border-transparent rounded-md text-white ${
                    actionType === 'resolve'
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-red-600 hover:bg-red-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : actionType === 'resolve' ? (
                    'Rezolvă'
                  ) : (
                    'Respinge'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};