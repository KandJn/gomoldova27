import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button, Modal } from 'flowbite-react';
import { toast } from 'react-hot-toast';
import { HiCheck, HiX, HiMail } from 'react-icons/hi';
import { useNotifications } from '../../contexts/NotificationsContext';
import { useTranslation } from 'react-i18next';

interface BusCompany {
  id: number;
  company_name: string;
  email: string;
  phone: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export const BusCompanyRegistrations: React.FC = () => {
  const [registrations, setRegistrations] = useState<BusCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    action: 'approve' | 'reject' | null;
    companyId: number | null;
    companyName: string;
  }>({
    isOpen: false,
    action: null,
    companyId: null,
    companyName: ''
  });
  const { fetchNotifications } = useNotifications();
  const { t } = useTranslation();

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bus_companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching registrations:', error);
        toast.error('Failed to load registrations');
        return;
      }

      setRegistrations(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load registrations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
    
    // Subscribe to changes in bus_companies table
    const subscription = supabase
      .channel('bus_companies_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bus_companies'
        },
        () => {
          fetchRegistrations();
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleStatusUpdate = async (id: number, status: 'approved' | 'rejected') => {
    try {
      setProcessingId(id);
      const { error } = await supabase
        .from('bus_companies')
        .update({ status })
        .eq('id', id);

      if (error) {
        console.error('Error updating status:', error);
        toast.error('Failed to update status');
        return;
      }

      toast.success(`Registration ${status} successfully`);
      fetchRegistrations();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to update status');
    } finally {
      setProcessingId(null);
      setConfirmModal({ isOpen: false, action: null, companyId: null, companyName: '' });
    }
  };

  const openConfirmModal = (action: 'approve' | 'reject', company: BusCompany) => {
    setConfirmModal({
      isOpen: true,
      action,
      companyId: company.id,
      companyName: company.company_name
    });
  };

  const filteredRegistrations = registrations.filter(reg => 
    selectedStatus === 'all' ? true : reg.status === selectedStatus
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          {t('bus_companies.title')}
        </h1>
        <div className="space-x-2">
          <select
            className="rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
          >
            <option value="all">{t('bus_companies.status.all')}</option>
            <option value="pending">{t('bus_companies.status.pending')}</option>
            <option value="approved">{t('bus_companies.status.approved')}</option>
            <option value="rejected">{t('bus_companies.status.rejected')}</option>
          </select>
          <Button 
            onClick={fetchRegistrations} 
            disabled={loading}
            color="blue"
            className="bg-blue-500 hover:bg-blue-600"
          >
            {t('bus_companies.actions.refresh')}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : filteredRegistrations.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No registrations found</div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('bus_companies.table.company_info')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('bus_companies.table.contact')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('bus_companies.table.description')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('bus_companies.table.status')}
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('bus_companies.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRegistrations.map((registration) => (
                <tr key={registration.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{registration.company_name}</div>
                    <div className="text-sm text-gray-500">
                      Submitted on {new Date(registration.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{registration.email}</div>
                    <div className="text-sm text-gray-500">{registration.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 max-w-xs truncate">
                      {registration.description || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                      registration.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : registration.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {registration.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Button
                        onClick={() => window.location.href = `mailto:${registration.email}`}
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                        size="xs"
                      >
                        <HiMail className="h-4 w-4" />
                      </Button>
                      {registration.status === 'pending' && (
                        <>
                          <Button
                            onClick={() => openConfirmModal('approve', registration)}
                            className="bg-green-500 hover:bg-green-600 text-white"
                            size="xs"
                            disabled={processingId === registration.id}
                          >
                            <HiCheck className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => openConfirmModal('reject', registration)}
                            className="bg-red-500 hover:bg-red-600 text-white"
                            size="xs"
                            disabled={processingId === registration.id}
                          >
                            <HiX className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirmation Modal */}
      <Modal
        show={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, action: null, companyId: null, companyName: '' })}
        position="center"
        popup
        size="md"
        className="animate-modal"
      >
        <div className="relative transform transition-all duration-300 ease-in-out">
          <Modal.Header className="border-b border-gray-200 !p-6 text-center">
            <h3 className="text-xl font-semibold text-gray-900">
              {t(confirmModal.action === 'approve' 
                ? 'bus_companies.modal.approve_title' 
                : 'bus_companies.modal.reject_title')}
            </h3>
          </Modal.Header>
          <Modal.Body className="p-6">
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-gray-50 mb-4">
                {confirmModal.action === 'approve' ? (
                  <HiCheck className="h-8 w-8 text-green-500" />
                ) : (
                  <HiX className="h-8 w-8 text-red-500" />
                )}
              </div>
              <p className="text-lg text-gray-900">
                {t('bus_companies.modal.confirm_message', {
                  action: t(confirmModal.action === 'approve' 
                    ? 'bus_companies.actions.approve' 
                    : 'bus_companies.actions.reject').toLowerCase()
                })}
              </p>
              <p className="text-xl font-semibold text-gray-900">
                {confirmModal.companyName}?
              </p>
              <p className="text-sm text-gray-500">
                {t('bus_companies.modal.cannot_undo')}
              </p>
            </div>
          </Modal.Body>
          <Modal.Footer className="border-t border-gray-200 !p-6">
            <div className="flex justify-center gap-4 w-full">
              <Button
                color="gray"
                className="min-w-[120px] !bg-gray-100 hover:!bg-gray-200 text-gray-700"
                onClick={() => setConfirmModal({ isOpen: false, action: null, companyId: null, companyName: '' })}
              >
                {t('bus_companies.modal.cancel')}
              </Button>
              <Button
                color={confirmModal.action === 'approve' ? 'green' : 'red'}
                className={`min-w-[120px] ${
                  confirmModal.action === 'approve'
                    ? '!bg-green-500 hover:!bg-green-600'
                    : '!bg-red-500 hover:!bg-red-600'
                }`}
                onClick={() => {
                  if (confirmModal.companyId && confirmModal.action) {
                    handleStatusUpdate(
                      confirmModal.companyId,
                      confirmModal.action === 'approve' ? 'approved' : 'rejected'
                    );
                  }
                }}
                disabled={processingId !== null}
              >
                {processingId !== null ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {t('bus_companies.modal.processing')}
                  </div>
                ) : (
                  t(confirmModal.action === 'approve' 
                    ? 'bus_companies.actions.approve' 
                    : 'bus_companies.actions.reject')
                )}
              </Button>
            </div>
          </Modal.Footer>
        </div>
      </Modal>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            .animate-modal {
              animation: modalFade 0.3s ease-out;
            }
            
            @keyframes modalFade {
              from {
                opacity: 0;
                transform: scale(0.95) translateY(-10px);
              }
              to {
                opacity: 1;
                transform: scale(1) translateY(0);
              }
            }
            
            .modal-backdrop {
              animation: backdropFade 0.3s ease-out;
            }
            
            @keyframes backdropFade {
              from {
                opacity: 0;
              }
              to {
                opacity: 1;
              }
            }
          `
        }}
      />
    </div>
  );
}; 