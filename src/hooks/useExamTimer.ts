import { useEffect } from 'react';
import { useExamStore } from '../store/useExamStore';

export const useExamTimer = () => {
  const tick = useExamStore((state) => state.tick);
  const isSubmitting = useExamStore((state) => state.isSubmitting);
  const timeRemaining = useExamStore((state) => state.timeRemaining);
  const sessionId = useExamStore((state) => state.sessionId);

  useEffect(() => {
    // Prevent the interval from running if we are submitting, out of time, or no session is active
    if (isSubmitting || timeRemaining <= 0 || !sessionId) {
      return;
    }

    // Call the tick function every 1000ms (1 second)
    const intervalId = setInterval(() => {
      tick();
    }, 1000);

    // Crucial: Clear the interval when the component unmounts or dependencies change
    // This prevents memory leaks and ensures we don't have multiple timers running
    return () => clearInterval(intervalId);
  }, [tick, isSubmitting, timeRemaining, sessionId]);
};
