import { useState, useEffect } from 'react';
import { db } from '../lib/db';
import { processSyncQueue } from '../lib/syncManager';
import { useLiveQuery } from 'dexie-react-hooks';

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' ? navigator.onLine : true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Use Dexie's live query to reactively count pending/failed exams across the app
  const pendingExamsCount = useLiveQuery(
    () => db.offlineSessions.where('syncStatus').anyOf(['pending', 'failed']).count(),
    []
  ) || 0;

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      if (pendingExamsCount > 0) {
        setIsSyncing(true);
        await processSyncQueue();
        setIsSyncing(false);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    // Bind browser network event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Fallback: Check queue immediately when hook mounts and network is online
    if (navigator.onLine && pendingExamsCount > 0 && !isSyncing) {
      handleOnline();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [pendingExamsCount, isSyncing]);

  return { isOnline, isSyncing, pendingExamsCount };
}
