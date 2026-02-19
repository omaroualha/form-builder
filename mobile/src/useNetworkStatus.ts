import { useEffect, useRef, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { syncPendingSubmissions } from './sync';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const wasOnlineRef = useRef(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const nowOnline = !!state.isConnected;
      const wasOffline = !wasOnlineRef.current;

      wasOnlineRef.current = nowOnline;
      setIsOnline(nowOnline);

      // Sync when going from offline → online
      if (wasOffline && nowOnline) {
        syncPendingSubmissions();
      }
    });

    return unsubscribe;
  }, []);

  return isOnline;
}
