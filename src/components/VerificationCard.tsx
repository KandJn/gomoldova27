import React from 'react';
import { Shield, Check, AlertTriangle } from 'lucide-react';

interface VerificationCardProps {
  title: string;
  description: string;
  status: 'unverified' | 'pending' | 'verified';
  onClick: () => void;
}

export function VerificationCard({ title, description, status, onClick }: VerificationCardProps) {
  const getStatusIndicator = () => {
    switch (status) {
      case 'verified':
        return (
          <div className="flex items-center text-green-600">
            <Check className="h-5 w-5 mr-1" />
            <span className="text-sm font-medium">Verificat</span>
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center text-yellow-600">
            <AlertTriangle className="h-5 w-5 mr-1" />
            <span className="text-sm font-medium">În așteptare</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center text-gray-500">
            <Shield className="h-5 w-5 mr-1" />
            <span className="text-sm font-medium">Neverificat</span>
          </div>
        );
    }
  };

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 bg-white rounded-lg border hover:border-blue-500 transition-colors"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
        {getStatusIndicator()}
      </div>
    </button>
  );
}