import React, { createContext, useContext, useState, useEffect } from 'react';

interface AvatarContextType {
  avatarTimestamp: number;
  updateAvatarTimestamp: () => void;
}

const AvatarContext = createContext<AvatarContextType | undefined>(undefined);

export function AvatarProvider({ children }: { children: React.ReactNode }) {
  const [avatarTimestamp, setAvatarTimestamp] = useState<number>(Date.now());

  const updateAvatarTimestamp = () => {
    // Add 500ms delay before updating timestamp
    setTimeout(() => {
      setAvatarTimestamp(Date.now());
    }, 500);
  };

  return (
    <AvatarContext.Provider value={{ avatarTimestamp, updateAvatarTimestamp }}>
      {children}
    </AvatarContext.Provider>
  );
}

export function useAvatar() {
  const context = useContext(AvatarContext);
  if (context === undefined) {
    throw new Error('useAvatar must be used within an AvatarProvider');
  }
  return context;
} 