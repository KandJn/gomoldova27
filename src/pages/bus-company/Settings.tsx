import React, { useEffect, useState } from 'react';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Bell, 
  Shield, 
  Globe, 
  Clock,
  Save,
  Upload,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../lib/store';
import toast from 'react-hot-toast';

interface CompanyProfile {
  id: string;
  company_name: string;
  email: string;
  phone: string;
  address: string;
  logo_url: string;
  business_license: string;
  operating_hours_start: string;
  operating_hours_end: string;
  notification_email: boolean;
  notification_sms: boolean;
  language: string;
  timezone: string;
}

interface CompanySettings {
  notification_email: boolean;
  notification_push: boolean;
  notification_sms: boolean;
  language: 'ro' | 'en' | 'ru';
  auto_approve_bookings: boolean;
  cancellation_period: number;
  refund_policy: 'full' | 'partial' | 'none';
  booking_limit_per_user: number;
}

export const BusCompanySettings = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<CompanyProfile>({
    id: '',
    company_name: '',
    email: '',
    phone: '',
    address: '',
    logo_url: '',
    business_license: '',
    operating_hours_start: '09:00',
    operating_hours_end: '18:00',
    notification_email: true,
    notification_sms: true,
    language: 'ro',
    timezone: 'Europe/Chisinau'
  });
  const [settings, setSettings] = useState<CompanySettings>({
    notification_email: true,
    notification_push: true,
    notification_sms: false,
    language: 'ro',
    auto_approve_bookings: false,
    cancellation_period: 24,
    refund_policy: 'full',
    booking_limit_per_user: 5
  });

  useEffect(() => {
    if (user) {
      fetchCompanyProfile();
      fetchSettings();
    }
  }, [user]);

  const fetchCompanyProfile = async () => {
    try {
      setLoading(true);

      if (!user?.id) {
        throw new Error('No user found');
      }

      // First check if the company exists
      const { data: companyData, error: companyError } = await supabase
        .from('bus_companies')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (companyError) {
        if (companyError.code === 'PGRST116') {
          // No company found
          throw new Error('No company profile found. Please contact support.');
        }
        throw companyError;
      }

      if (!companyData) {
        throw new Error('Company profile not found');
      }

      // Set the profile data
      setProfile({
        id: companyData.id,
        company_name: companyData.company_name || '',
        email: companyData.email || user.email || '',
        phone: companyData.phone || '',
        address: companyData.address || '',
        logo_url: companyData.logo_url || '',
        business_license: companyData.business_license || '',
        operating_hours_start: companyData.operating_hours_start || '09:00',
        operating_hours_end: companyData.operating_hours_end || '18:00',
        notification_email: companyData.notification_email ?? true,
        notification_sms: companyData.notification_sms ?? true,
        language: companyData.language || 'ro',
        timezone: companyData.timezone || 'Europe/Chisinau'
      });

    } catch (error: any) {
      console.error('Error fetching company profile:', error);
      toast.error(error.message || 'Failed to load company profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      if (!user) return;

      const { data: busCompany } = await supabase
        .from('bus_companies')
        .select('settings')
        .eq('user_id', user.id)
        .single();

      if (busCompany?.settings) {
        setSettings(busCompany.settings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Eroare la încărcarea setărilor');
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // First check if we have a valid profile ID
      if (!profile.id) {
        throw new Error('No company profile found');
      }

      // Update the bus company profile
      const { error: updateError } = await supabase
        .from('bus_companies')
        .update({
          company_name: profile.company_name,
          email: profile.email,
          phone: profile.phone,
          address: profile.address,
          operating_hours_start: profile.operating_hours_start,
          operating_hours_end: profile.operating_hours_end,
          notification_email: profile.notification_email,
          notification_sms: profile.notification_sms,
          language: profile.language,
          timezone: profile.timezone,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id)
        .eq('owner_id', user?.id); // Add owner_id check for security

      if (updateError) {
        console.error('Error updating company profile:', updateError);
        throw new Error(updateError.message);
      }

      toast.success('Settings saved successfully');
      
      // Refresh the profile data
      await fetchCompanyProfile();
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error(error.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
      const filePath = `company-logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('bus_companies')
        .update({ logo_url: publicUrl })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      setProfile({ ...profile, logo_url: publicUrl });
      toast.success('Logo uploaded successfully');
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Failed to upload logo');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Company Settings</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="h-5 w-5 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Company Profile */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Company Profile</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <img
                  src={profile.logo_url || 'https://via.placeholder.com/150'}
                  alt="Company Logo"
                  className="w-32 h-32 rounded-xl object-cover"
                />
                <label className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
                  <Upload className="h-5 w-5 text-white" />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleLogoUpload}
                  />
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={profile.company_name}
                    onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
                    className="pl-10 w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="pl-10 w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="pl-10 w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    className="pl-10 w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Operating Hours & Preferences */}
        <div className="space-y-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Operating Hours</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="time"
                    value={profile.operating_hours_start}
                    onChange={(e) => setProfile({ ...profile, operating_hours_start: e.target.value })}
                    className="pl-10 w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="time"
                    value={profile.operating_hours_end}
                    onChange={(e) => setProfile({ ...profile, operating_hours_end: e.target.value })}
                    className="pl-10 w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Preferences</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <select
                    value={profile.language}
                    onChange={(e) => setProfile({ ...profile, language: e.target.value })}
                    className="pl-10 w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="ro">Romanian</option>
                    <option value="ru">Russian</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <select
                    value={profile.timezone}
                    onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                    className="pl-10 w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Europe/Chisinau">Europe/Chisinau</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={profile.notification_email}
                    onChange={(e) => setProfile({ ...profile, notification_email: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Receive email notifications</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={profile.notification_sms}
                    onChange={(e) => setProfile({ ...profile, notification_sms: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Receive SMS notifications</span>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Business License</h2>
            <div className="p-4 bg-blue-50 rounded-xl flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm text-blue-800">
                  Your business license and verification documents are managed by our admin team.
                  For any changes, please contact support.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 