import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../lib/store';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface AdminGuardProps {
  children: React.ReactNode;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { user } = useAuthStore();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        if (!user) {
          setIsAdmin(false);
          setLoading(false);
          setShowError(true);
          return;
        }

        // Only allow asassin.damian@gmail.com as admin
        const isUserAdmin = user.email === 'asassin.damian@gmail.com';
        setIsAdmin(isUserAdmin);
        setLoading(false);
        
        if (!isUserAdmin) {
          setShowError(true);
        }
      } catch (error: any) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        setLoading(false);
        setShowError(true);
      }
    };

    checkAdminStatus();
  }, [user]);

  // Show error toast via useEffect to avoid during-render state updates
  useEffect(() => {
    if (showError) {
      toast.error('Acces interzis. Trebuie să fiți administrator.');
    }
  }, [showError]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}; 