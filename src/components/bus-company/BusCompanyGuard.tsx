import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../lib/store';
import { supabase } from '../../lib/supabase';
import { LoadingSpinner } from '../LoadingSpinner';
import toast from 'react-hot-toast';

interface BusCompanyGuardProps {
  children: React.ReactNode;
}

export const BusCompanyGuard: React.FC<BusCompanyGuardProps> = ({ children }) => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [isBusCompanyOwner, setIsBusCompanyOwner] = useState(false);

  useEffect(() => {
    checkBusCompanyAccess();
  }, [user]);

  const checkBusCompanyAccess = async () => {
    try {
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: busCompany, error } = await supabase
        .from('bus_companies')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No bus company found for this user
          toast.error('Nu aveți acces la panoul companiei de transport');
        } else {
          throw error;
        }
      }

      setIsBusCompanyOwner(!!busCompany);
    } catch (error) {
      console.error('Error checking bus company access:', error);
      toast.error('Eroare la verificarea accesului');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!isBusCompanyOwner) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}; 