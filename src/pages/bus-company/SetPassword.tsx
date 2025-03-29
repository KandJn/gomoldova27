import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Card, Button, TextInput, Alert, Spinner } from 'flowbite-react';
import { HiLockClosed, HiCheck, HiExclamation } from 'react-icons/hi';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../lib/store';

export const SetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [company, setCompany] = useState<any>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Get the approval code from the URL
  const code = searchParams.get('code');
  
  // Handle missing code
  useEffect(() => {
    if (!code) {
      setVerifying(false);
      setError(t('Invalid or missing approval code. Please check your email and try again.'));
    } else {
      verifyCode();
    }
  }, [code]);
  
  // Redirect if user is logged in
  useEffect(() => {
    if (user) {
      navigate('/bus-company');
    }
  }, [user]);

  // Verify the approval code
  const verifyCode = async () => {
    try {
      setLoading(true);
      setVerifying(true);
      
      // Check if code exists and company is approved
      const { data, error } = await supabase
        .from('bus_companies')
        .select('*')
        .eq('approval_code', code)
        .eq('status', 'approved')
        .is('password_set', false)
        .single();
      
      if (error || !data) {
        throw new Error(t('Invalid approval code or this link has already been used.'));
      }
      
      setCompany(data);
    } catch (error) {
      console.error('Error verifying code:', error);
      setError(error.message);
    } finally {
      setLoading(false);
      setVerifying(false);
    }
  };
  
  // Validate password
  const validatePassword = () => {
    if (password.length < 8) {
      setError(t('Password must be at least 8 characters long'));
      return false;
    }
    
    if (password !== confirmPassword) {
      setError(t('Passwords do not match'));
      return false;
    }
    
    setError(null);
    return true;
  };
  
  // Handle password submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePassword()) {
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Register user in Supabase auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: company.email,
        password: password,
        options: {
          data: {
            company_id: company.id,
            role: 'bus_company'
          }
        }
      });
      
      if (authError) {
        throw new Error(authError.message);
      }
      
      // Update the company record to mark password_set as true
      const { error: updateError } = await supabase
        .from('bus_companies')
        .update({
          password_set: true,
          owner_id: authData.user?.id,
          status: 'verified',
          updated_at: new Date().toISOString()
        })
        .eq('id', company.id);
      
      if (updateError) {
        throw new Error(updateError.message);
      }
      
      // Success - show success message and then redirect
      setSuccess(true);
      toast.success(t('Password set successfully. You can now login.'));
      
      // Wait a moment and then redirect to login
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
    } catch (error) {
      console.error('Error setting password:', error);
      setError(error.message);
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };
  
  // If loading, show spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Spinner size="xl" />
      </div>
    );
  }
  
  // If success, show success message
  if (success) {
    return (
      <div className="max-w-md mx-auto p-6 min-h-screen flex items-center justify-center">
        <Card className="border-green-500 w-full">
          <div className="text-center py-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <HiCheck className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('Password Set Successfully')}</h2>
            <p className="text-gray-600 mb-4">
              {t('Your bus company account has been created. You will be redirected to the login page.')}
            </p>
            <Button
              color="gray"
              onClick={() => navigate('/')}
            >
              {t('Go to Login')}
            </Button>
          </div>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="max-w-lg mx-auto p-6 min-h-screen flex items-center justify-center">
      <Card className="w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{t('Set Your Password')}</h1>
          {company && (
            <p className="text-gray-600 mt-2">
              {t('For')} <span className="font-semibold">{company.company_name}</span>
            </p>
          )}
        </div>
        
        {error && (
          <Alert color="failure" icon={HiExclamation} className="mb-4">
            {error}
          </Alert>
        )}
        
        {!company && !verifying ? (
          <div className="text-center py-4">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <HiExclamation className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('Invalid Approval Code')}</h2>
            <p className="text-gray-600 mb-4">
              {t('This approval code is invalid or has expired. Please check your email for the correct link.')}
            </p>
            <Button
              color="gray"
              onClick={() => navigate('/')}
            >
              {t('Return to Home')}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900">
                {t('New Password')}
              </label>
              <TextInput
                id="password"
                type="password"
                placeholder={t('Enter a secure password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                icon={HiLockClosed}
                autoComplete="new-password"
              />
              <p className="mt-1 text-xs text-gray-500">
                {t('Password must be at least 8 characters long')}
              </p>
            </div>
            
            <div>
              <label htmlFor="confirm-password" className="block mb-2 text-sm font-medium text-gray-900">
                {t('Confirm Password')}
              </label>
              <TextInput
                id="confirm-password"
                type="password"
                placeholder={t('Confirm your password')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                icon={HiLockClosed}
                autoComplete="new-password"
              />
            </div>
            
            <Button
              type="submit"
              color="blue"
              disabled={submitting}
              isProcessing={submitting}
              className="w-full"
            >
              {t('Set Password & Activate Account')}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}; 