import { db } from './db';

export const processSyncQueue = async (): Promise<void> => {
  try {
    // 1. Query Dexie for all sessions where syncStatus is 'pending' or 'failed'
    const sessionsToSync = await db.offlineSessions
      .where('syncStatus')
      .anyOf(['pending', 'failed'])
      .toArray();

    if (sessionsToSync.length === 0) return;

    // 2. Update status to 'syncing' to prevent duplicate syncs
    await db.offlineSessions.bulkPut(
      sessionsToSync.map(session => ({ ...session, syncStatus: 'syncing' }))
    );

    // 3. POST the payload to our Next.js API sync route
    const response = await fetch('/api/exams/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessions: sessionsToSync }),
    });

    if (response.ok) {
      // 4. On 200 OK, delete them from local IndexedDB to free up storage
      const sessionIds = sessionsToSync.map(s => s.sessionId);
      await db.offlineSessions.bulkDelete(sessionIds);
    } else {
      // 5. On API failure (e.g., 500 error), revert status to 'failed' for later retry
      await db.offlineSessions.bulkPut(
        sessionsToSync.map(session => ({ ...session, syncStatus: 'failed' }))
      );
    }
  } catch (error) {
    console.error('Offline sync process failed:', error);
    
    // In case of a network timeout during the fetch, revert 'syncing' back to 'failed'
    const failedSessions = await db.offlineSessions
      .where('syncStatus')
      .equals('syncing')
      .toArray();
      
    await db.offlineSessions.bulkPut(
      failedSessions.map(session => ({ ...session, syncStatus: 'failed' }))
    );
  }
};
