import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../lib/store';
import toast from 'react-hot-toast';
import { Check, X, Mail, Eye, MoreHorizontal, Building, Calendar, MapPin, User, Phone, Globe } from 'lucide-react';
import { Button, Card, Table, Badge, TextInput, Select, Modal, Dropdown, Label, Spinner } from 'flowbite-react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';

interface BusCompany {
  id: string;
  owner_id: string;
  company_name: string;
  registration_number: string;
  tax_id?: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  country?: string;
  website?: string;
  company_size?: string;
  year_founded?: number;
  description?: string;
  contact_person_name?: string;
  contact_person_position?: string;
  status: 'pending' | 'approved' | 'rejected' | 'verified';
  created_at: string;
  approved_at?: string;
  rejected_at?: string;
  approval_code?: string;
  password_set?: boolean;
}

export const AdminBusCompanies: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [companies, setCompanies] = useState<BusCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'verified'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [detailModal, setDetailModal] = useState<{
    isOpen: boolean;
    company: BusCompany | null;
  }>({
    isOpen: false,
    company: null
  });
  const [approveModal, setApproveModal] = useState<{
    isOpen: boolean;
    company: BusCompany | null;
    sendingEmail: boolean;
  }>({
    isOpen: false,
    company: null,
    sendingEmail: false
  });
  const [rejectModal, setRejectModal] = useState<{
    isOpen: boolean;
    company: BusCompany | null;
    reason: string;
  }>({
    isOpen: false,
    company: null,
    reason: ''
  });

  useEffect(() => {
    if (user) {
      fetchCompanies();
      
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
            fetchCompanies();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bus_companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCompanies(data as BusCompany[] || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast.error(t('Error loading companies'));
    } finally {
      setLoading(false);
    }
  };

  const sendEmail = async (to: string, subject: string, html: string) => {
    try {
      console.log('Sending email to:', to);
      
      const { data, error } = await supabase.auth.resetPasswordForEmail(to, {
        redirectTo: `${window.location.origin}/bus-company/set-password`,
        data: {
          subject,
          html
        }
      });

      if (error) {
        console.error('Error sending email:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('Email sending error:', error);
      return { data: null, error };
    }
  };

  const handleApprove = async () => {
    if (!approveModal.company) return;
    
    try {
      setApproveModal(prev => ({ ...prev, sendingEmail: true }));
      
      // Generate approval code
      const approvalCode = uuidv4();
      
      // Update company status and set approval code
      const { error } = await supabase
        .from('bus_companies')
        .update({ 
          status: 'approved', 
          approved_at: new Date().toISOString(),
          approval_code: approvalCode
        })
        .eq('id', approveModal.company.id);

      if (error) throw error;

      try {
        // Send email with Netlify function
        const { data: emailData, error: emailError } = await sendEmail(
          approveModal.company.email,
          'Set Your Bus Company Account Password',
          `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #4F46E5; margin-bottom: 10px;">Welcome to GoMoldova!</h1>
              </div>
              <div style="margin-bottom: 30px;">
                <p>Dear ${approveModal.company.contact_person_name || approveModal.company.company_name},</p>
                <p>Your bus company registration has been approved. To access your account, please set your password by clicking the button below:</p>
                
                <div style="text-align: center; margin: 20px 0;">
                  <a href="${window.location.origin}/bus-company/set-password?code=${approvalCode}" 
                     style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px;">
                    Set Password
                  </a>
                </div>

                <div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0;">
                  <p><strong>Note:</strong> This link will expire in 24 hours. If you don't see the email in your inbox, please check your spam folder.</p>
                </div>

                <p>Thank you for joining our platform!</p>
              </div>
              <div style="text-align: center; color: #666; font-size: 14px; margin-top: 30px;">
                <p>This is an automated message, please do not reply to this email.</p>
              </div>
            </div>
          `
        );

        if (emailError) {
          console.error('Error sending email:', emailError);
          toast.error(t('Error sending approval email, but company was approved. Please try resending the email later.'));
        } else {
          toast.success(t('Company approved and email sent successfully'));
        }
      } catch (emailSendError) {
        console.error('Error sending email:', emailSendError);
        toast.error(t('Error sending approval email, but company was approved. Please try resending the email later.'));
      }
    } catch (error) {
      console.error('Error approving company:', error);
      toast.error(t('Error approving company'));
    } finally {
      setApproveModal(prev => ({ ...prev, isOpen: false, sendingEmail: false }));
    }
  };

  const handleReject = async () => {
    if (!rejectModal.company) return;
    
    try {
      // Update company status
      const { error } = await supabase
        .from('bus_companies')
        .update({ 
          status: 'rejected', 
          rejected_at: new Date().toISOString() 
        })
        .eq('id', rejectModal.company.id);

      if (error) throw error;

      try {
        // Send email with rejection reason using Netlify function
        const { data: emailData, error: emailError } = await sendEmail(
          rejectModal.company.email,
          'Bus Company Registration Rejected',
          `
            <h1>Registration Status Update</h1>
            <p>Dear ${rejectModal.company.contact_person_name || rejectModal.company.company_name},</p>
            <p>We regret to inform you that your bus company registration has been rejected.</p>
            ${rejectModal.reason ? `<p><strong>Reason:</strong> ${rejectModal.reason}</p>` : ''}
            <p>If you believe this is an error or would like to reapply with corrected information, please contact our support.</p>
          `
        );

        if (emailError) {
          console.error('Error sending email:', emailError);
          toast.error(t('Error sending rejection email, but company was rejected. You may need to contact them separately.'));
        } else {
          toast.success(t('Company rejected and email sent'));
        }
      } catch (emailSendError) {
        console.error('Email sending failed:', emailSendError);
        toast.error(t('Error sending rejection email, but company was rejected. You may need to contact them separately.'));
      }
      
      fetchCompanies();
      setRejectModal({ isOpen: false, company: null, reason: '' });
    } catch (error) {
      console.error('Error rejecting company:', error);
      toast.error(t('Error rejecting company'));
    }
  };

  const filteredCompanies = companies
    .filter(company => 
      filter === 'all' ? true : company.status === filter
    )
    .filter(company => 
      searchTerm ? 
        company.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.registration_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.contact_person_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.city?.toLowerCase().includes(searchTerm.toLowerCase())
      : true
    );
    
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge color="warning">{t('Pending')}</Badge>;
      case 'approved':
        return <Badge color="info">{t('Approved')}</Badge>;
      case 'verified':
        return <Badge color="success">{t('Verified')}</Badge>;
      case 'rejected':
        return <Badge color="failure">{t('Rejected')}</Badge>;
      default:
        return <Badge color="gray">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spinner size="xl" color="info" />
        <span className="ml-2">{t('Loading bus companies...')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{t('Bus Companies Management')}</h1>
        <Button color="blue" onClick={fetchCompanies}>
          {t('Refresh')}
        </Button>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
          <div className="flex-1">
            <TextInput
              id="search"
              type="text"
              placeholder={t('Search by name, email, registration number...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Eye}
            />
          </div>
          <div className="w-full md:w-64">
            <Select
              id="filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
            >
              <option value="all">{t('All Statuses')}</option>
              <option value="pending">{t('Pending')}</option>
              <option value="approved">{t('Approved')}</option>
              <option value="verified">{t('Verified')}</option>
              <option value="rejected">{t('Rejected')}</option>
            </Select>
          </div>
                    </div>
        
        <div className="overflow-x-auto">
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell>{t('Company')}</Table.HeadCell>
              <Table.HeadCell>{t('Contact')}</Table.HeadCell>
              <Table.HeadCell>{t('Registration')}</Table.HeadCell>
              <Table.HeadCell>{t('Status')}</Table.HeadCell>
              <Table.HeadCell>{t('Created')}</Table.HeadCell>
              <Table.HeadCell>
                <span className="sr-only">{t('Actions')}</span>
              </Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {filteredCompanies.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={6} className="text-center py-10">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Building className="h-8 w-8 mb-2" />
                      <p>{filter === 'all' 
                        ? t('No bus companies found') 
                        : t(`No ${filter} bus companies found`)}
                      </p>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ) : (
                filteredCompanies.map((company) => (
                  <Table.Row key={company.id} className="bg-white hover:bg-gray-50">
                    <Table.Cell className="whitespace-nowrap font-medium text-gray-900">
                      <div className="flex flex-col">
                        <span className="font-semibold">{company.company_name}</span>
                        {company.city && company.country && (
                          <span className="text-xs text-gray-500 flex items-center mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            {company.city}, {company.country}
                    </span>
                        )}
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="text-sm">
                        <div className="flex items-center">
                          <Mail className="h-3 w-3 mr-1 text-gray-500" />
                          <span>{company.email}</span>
                        </div>
                        <div className="flex items-center mt-1">
                          <Phone className="h-3 w-3 mr-1 text-gray-500" />
                          <span>{company.phone}</span>
                        </div>
                        {company.contact_person_name && (
                          <div className="flex items-center mt-1 text-xs text-gray-500">
                            <User className="h-3 w-3 mr-1" />
                            <span>{company.contact_person_name}</span>
                          </div>
                        )}
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="text-sm">
                        <div>{company.registration_number || '-'}</div>
                        {company.tax_id && (
                          <div className="text-xs text-gray-500 mt-1">
                            Tax ID: {company.tax_id}
                          </div>
                        )}
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      {getStatusBadge(company.status)}
                      {company.password_set && (
                        <div className="text-xs text-green-600 mt-1">
                          {t('Account active')}
                        </div>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <div className="text-sm text-gray-500">
                    {new Date(company.created_at).toLocaleDateString()}
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex justify-end">
                        <Dropdown
                          label=""
                          dismissOnClick={true}
                          renderTrigger={() => (
                            <Button color="light" size="xs">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          )}
                        >
                          <Dropdown.Item onClick={() => setDetailModal({ isOpen: true, company })}>
                            <Eye className="h-4 w-4 mr-2" />
                            {t('View Details')}
                          </Dropdown.Item>
                          <Dropdown.Item as="a" href={`mailto:${company.email}`}>
                            <Mail className="h-4 w-4 mr-2" />
                            {t('Send Email')}
                          </Dropdown.Item>
                          {company.status === 'pending' && (
                            <>
                              <Dropdown.Divider />
                              <Dropdown.Item 
                                onClick={() => setApproveModal({ isOpen: true, company, sendingEmail: false })}
                                className="text-green-600 hover:bg-green-50"
                              >
                                <Check className="h-4 w-4 mr-2" />
                                {t('Approve')}
                              </Dropdown.Item>
                              <Dropdown.Item 
                                onClick={() => setRejectModal({ isOpen: true, company, reason: '' })}
                                className="text-red-600 hover:bg-red-50"
                              >
                                <X className="h-4 w-4 mr-2" />
                                {t('Reject')}
                              </Dropdown.Item>
                            </>
                          )}
                          {company.status === 'approved' && !company.password_set && (
                            <Dropdown.Item 
                              onClick={() => setApproveModal({ isOpen: true, company, sendingEmail: false })}
                              className="text-blue-600 hover:bg-blue-50"
                            >
                              <Mail className="h-4 w-4 mr-2" />
                              {t('Resend Approval Email')}
                            </Dropdown.Item>
                          )}
                        </Dropdown>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table>
        </div>
      </Card>

      {/* Company Details Modal */}
      <Modal
        show={detailModal.isOpen}
        onClose={() => setDetailModal({ isOpen: false, company: null })}
        size="xl"
      >
        <Modal.Header>
          {detailModal.company?.company_name} - {t('Company Details')}
        </Modal.Header>
        <Modal.Body>
          {detailModal.company && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Building className="h-5 w-5 mr-2 text-blue-500" />
                  {t('Company Information')}
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">{t('Company Name')}</label>
                    <div className="mt-1 text-gray-900">{detailModal.company.company_name}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">{t('Registration Number')}</label>
                    <div className="mt-1 text-gray-900">{detailModal.company.registration_number || '-'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">{t('Tax ID')}</label>
                    <div className="mt-1 text-gray-900">{detailModal.company.tax_id || '-'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">{t('Address')}</label>
                    <div className="mt-1 text-gray-900">
                      {detailModal.company.address 
                        ? `${detailModal.company.address}, ${detailModal.company.city || ''}, ${detailModal.company.country || ''}` 
                        : '-'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">{t('Website')}</label>
                    <div className="mt-1">
                      {detailModal.company.website ? (
                        <a 
                          href={detailModal.company.website.startsWith('http') 
                            ? detailModal.company.website 
                            : `https://${detailModal.company.website}`} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center"
                        >
                          <Globe className="h-4 w-4 mr-1" />
                          {detailModal.company.website}
                        </a>
                      ) : (
                        '-'
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">{t('Company Size')}</label>
                    <div className="mt-1 text-gray-900">{detailModal.company.company_size || '-'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">{t('Year Founded')}</label>
                    <div className="mt-1 text-gray-900">{detailModal.company.year_founded || '-'}</div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-500" />
                  {t('Contact Information')}
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">{t('Contact Person')}</label>
                    <div className="mt-1 text-gray-900">
                      {detailModal.company.contact_person_name || '-'}
                      {detailModal.company.contact_person_position && (
                        <span className="text-gray-500 ml-1">
                          ({detailModal.company.contact_person_position})
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">{t('Email')}</label>
                    <div className="mt-1 text-gray-900">{detailModal.company.email}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">{t('Phone')}</label>
                    <div className="mt-1 text-gray-900">{detailModal.company.phone}</div>
                  </div>
                  <div className="pt-2">
                    <label className="block text-sm font-medium text-gray-500">{t('Registration Status')}</label>
                    <div className="mt-1">
                      {getStatusBadge(detailModal.company.status)}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">{t('Registration Date')}</label>
                    <div className="mt-1 text-gray-900">
                      {new Date(detailModal.company.created_at).toLocaleDateString()} 
                      {' '}
                      <span className="text-gray-500 text-sm">
                        ({new Date(detailModal.company.created_at).toLocaleTimeString()})
                      </span>
                    </div>
                  </div>
                  {detailModal.company.approved_at && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">{t('Approved Date')}</label>
                      <div className="mt-1 text-gray-900">
                        {new Date(detailModal.company.approved_at).toLocaleDateString()} 
                      </div>
                    </div>
                  )}
                  {detailModal.company.rejected_at && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">{t('Rejected Date')}</label>
                      <div className="mt-1 text-gray-900">
                        {new Date(detailModal.company.rejected_at).toLocaleDateString()} 
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-500">{t('Company Description')}</label>
                <div className="mt-1 text-gray-900 bg-gray-50 p-3 rounded-md min-h-[100px]">
                  {detailModal.company.description || t('No description provided')}
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <div className="flex justify-between w-full">
            <div>
              {detailModal.company?.status === 'pending' && (
                <>
                  <Button
                    color="failure"
                    onClick={() => {
                      setDetailModal({ isOpen: false, company: null });
                      setRejectModal({ 
                        isOpen: true, 
                        company: detailModal.company,
                        reason: '' 
                      });
                    }}
                    className="mr-2"
                  >
                    <X className="h-4 w-4 mr-1" />
                    {t('Reject')}
                  </Button>
                  <Button
                    color="success"
                    onClick={() => {
                      setDetailModal({ isOpen: false, company: null });
                      setApproveModal({ 
                        isOpen: true, 
                        company: detailModal.company,
                        sendingEmail: false 
                      });
                    }}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    {t('Approve')}
                  </Button>
                </>
              )}
            </div>
            <Button
              color="gray"
              onClick={() => setDetailModal({ isOpen: false, company: null })}
            >
              {t('Close')}
            </Button>
          </div>
        </Modal.Footer>
      </Modal>

      {/* Approve Modal */}
      <Modal
        show={approveModal.isOpen}
        onClose={() => !approveModal.sendingEmail && setApproveModal({ isOpen: false, company: null, sendingEmail: false })}
        size="md"
        popup
      >
        <Modal.Header>
          {t('Approve Bus Company')}
        </Modal.Header>
        <Modal.Body>
          <div className="space-y-6">
            <div className="text-center">
              <Check className="mx-auto h-14 w-14 text-green-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">
                {t('Approve Registration')}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  {t('You are about to approve the registration for')} <strong>{approveModal.company?.company_name}</strong>.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {t('An email will be sent to')} <strong>{approveModal.company?.email}</strong> {t('with instructions to set up their password and access their account.')}
                </p>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="flex justify-end gap-2 w-full">
            <Button
              color="gray"
              onClick={() => setApproveModal({ isOpen: false, company: null, sendingEmail: false })}
              disabled={approveModal.sendingEmail}
            >
              {t('Cancel')}
            </Button>
            <Button
              color="success"
              onClick={handleApprove}
              isProcessing={approveModal.sendingEmail}
              disabled={approveModal.sendingEmail}
              className="bg-green-600 hover:bg-green-700 text-white font-medium"
            >
              <span className="flex items-center">
                {approveModal.sendingEmail ? t('Sending Email...') : t('Approve & Send Email')}
              </span>
            </Button>
          </div>
        </Modal.Footer>
      </Modal>

      {/* Reject Modal */}
      <Modal
        show={rejectModal.isOpen}
        onClose={() => setRejectModal({ isOpen: false, company: null, reason: '' })}
        size="md"
        popup
      >
        <Modal.Header>
          {t('Reject Bus Company')}
        </Modal.Header>
        <Modal.Body>
          <div className="space-y-6">
            <div>
              <X className="mx-auto h-14 w-14 text-red-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 text-center">
                {t('Reject Registration')}
              </h3>
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-4">
                  {t('You are about to reject the registration for')} <strong>{rejectModal.company?.company_name}</strong>.
                </p>

                <div className="space-y-2">
                  <Label htmlFor="reject-reason">{t('Rejection Reason (Optional)')}</Label>
                  <TextInput
                    id="reject-reason"
                    value={rejectModal.reason}
                    onChange={(e) => setRejectModal(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder={t('Enter rejection reason')}
                  />
                  <p className="text-xs text-gray-500">
                    {t('This reason will be included in the email sent to the company.')}
                  </p>
                </div>
              </div>
        </div>
      </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="flex justify-end gap-2 w-full">
            <Button
              color="gray"
              onClick={() => setRejectModal({ isOpen: false, company: null, reason: '' })}
            >
              {t('Cancel')}
            </Button>
            <Button
              color="failure"
              onClick={handleReject}
            >
              {t('Reject Registration')}
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
}; 