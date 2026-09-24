import { create } from 'zustand';
import { db } from '../lib/db';

export interface ExamState {
  sessionId: string | null;
  timeRemaining: number;
  answers: Record<string, string>;
  isSubmitting: boolean;

  // Actions
  startExam: (sessionId: string, initialTime: number, initialAnswers?: Record<string, string>) => Promise<void>;
  setAnswer: (questionId: string, answer: string) => Promise<void>;
  tick: () => void;
  syncFromOffline: (sessionId: string) => Promise<void>;
  submitExam: () => Promise<void>;
}

export const useExamStore = create<ExamState>((set, get) => ({
  sessionId: null,
  timeRemaining: 0,
  answers: {},
  isSubmitting: false,

  startExam: async (sessionId, initialTime, initialAnswers = {}) => {
    set({
      sessionId,
      timeRemaining: initialTime,
      answers: initialAnswers,
      isSubmitting: false,
    });

    // Initialize or update Dexie
    await db.offlineSessions.put({
      sessionId,
      examLevel: 'default',
      timeRemainingSecs: initialTime,
      answers: initialAnswers,
      lastUpdated: Date.now(),
      syncStatus: 'pending',
    });
  },

  setAnswer: async (questionId, answer) => {
    const { sessionId, answers } = get();
    if (!sessionId) return;

    const newAnswers = { ...answers, [questionId]: answer };

    // Update Zustand
    set({ answers: newAnswers });

    // Persist to Dexie
    await db.offlineSessions.update(sessionId, {
      answers: newAnswers,
      lastUpdated: Date.now(),
    });
  },

  tick: () => {
    const { timeRemaining, sessionId, submitExam, isSubmitting } = get();
    
    if (isSubmitting || timeRemaining <= 0 || !sessionId) return;

    const newTime = timeRemaining - 1;

    // Update Zustand
    set({ timeRemaining: newTime });

    // Update time in Dexie so if they refresh, the timer is accurate
    db.offlineSessions.update(sessionId, {
      timeRemainingSecs: newTime,
      lastUpdated: Date.now(),
    }).catch(err => console.error('Failed to update timer in offline DB:', err));

    // Auto-submission logic when timer hits 0
    if (newTime === 0) {
      submitExam();
    }
  },

  syncFromOffline: async (sessionId) => {
    const session = await db.offlineSessions.get(sessionId);
    if (session) {
      set({
        sessionId: session.sessionId,
        timeRemaining: session.timeRemainingSecs,
        answers: session.answers,
        isSubmitting: false,
      });
    }
  },

  submitExam: async () => {
    const { sessionId, answers } = get();
    if (!sessionId) return;

    set({ isSubmitting: true });

    try {
      // In a real scenario, you would trigger the API call here
      // e.g., await submitExamApi({ sessionId, answers });
      console.log('Auto-submitting exam...', { sessionId, answers });
      
      // Optionally clean up local storage after successful submission
      // await db.offlineSessions.delete(sessionId);
    } catch (error) {
      console.error('Failed to submit exam:', error);
      // Revert submitting state if it fails, or queue for background sync
      set({ isSubmitting: false });
    }
  },
}));
