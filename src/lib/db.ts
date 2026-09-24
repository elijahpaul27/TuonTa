import Dexie, { Table } from 'dexie';

export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'failed';

export interface SerializedQuestion {
  id: string;
  subject: string;
  topic: string;
  questionText: string;
  options: { id: string; text: string }[];
  correctAnswer: string;
  explanation?: string | null;
}

export interface OfflineSession {
  sessionId: string;
  examLevel: string;
  timeRemainingSecs: number;
  answers: Record<string, string>;
  lastUpdated: number;
  syncStatus: SyncStatus;
  // Locally stored question bank so the runner can work offline
  questionBank?: SerializedQuestion[];
}

export class CSCReviewerDB extends Dexie {
  offlineSessions!: Table<OfflineSession, string>;

  constructor() {
    super('CSCReviewerDB');
    // Version 3 adds the questionBank field
    this.version(3).stores({
      offlineSessions: 'sessionId, examLevel, syncStatus, lastUpdated'
    });
  }
}

export const db = new CSCReviewerDB();
