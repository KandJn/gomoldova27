import { useState, useCallback } from 'react';

export function useAvatar() {
  const [avatarTimestamp, setAvatarTimestamp] = useState(() => Date.now());

  const refreshAvatar = useCallback(() => {
    setAvatarTimestamp(Date.now());
  }, []);

  return {
    avatarTimestamp,
    refreshAvatar
  };
} 