export interface Question {
  id: string;
  subject: string;
  topic: string;
  correctAnswer: string;
}

export type MasteryStatus = 'MASTERED' | 'STRONG' | 'NEEDS_IMPROVEMENT' | 'PRIORITY_REVIEW';

export interface TopicPerformance {
  subject: string;
  topic: string;
  correctCount: number;
  totalCount: number;
  percentage: number;
  masteryStatus: MasteryStatus;
}

export interface ExamPerformanceResult {
  overallScore: number;
  passed: boolean;
  topicPerformance: TopicPerformance[];
}

export interface SM2Result {
  repetitions: number;
  interval: number;
  easeFactor: number;
  nextReviewDate: Date;
}

export function calculateSM2(
  isCorrect: boolean,
  previousAttempt?: { repetitions: number; easeFactor: number; interval: number }
): SM2Result {
  let prevRep = previousAttempt?.repetitions ?? 0;
  let prevEase = previousAttempt?.easeFactor ?? 2.5;
  let prevInterval = previousAttempt?.interval ?? 0;

  let repetitions: number;
  let interval: number;
  let easeFactor: number;

  if (!isCorrect) {
    repetitions = 0;
    interval = 1;
    easeFactor = Math.max(1.3, prevEase - 0.2);
  } else {
    repetitions = prevRep + 1;
    interval = prevRep === 0 ? 1 : prevRep === 1 ? 6 : Math.round(prevInterval * prevEase);
    easeFactor = prevEase + 0.1;
  }

  const nextReviewDate = new Date(Date.now() + interval * 24 * 60 * 60 * 1000);

  return {
    repetitions,
    interval,
    easeFactor,
    nextReviewDate,
  };
}

export const evaluateExamPerformance = (
  userAnswers: Record<string, string>,
  questionBank: Question[]
): ExamPerformanceResult => {
  let totalCorrect = 0;
  const topicStats: Record<string, { subject: string; correct: number; total: number }> = {};

  for (const question of questionBank) {
    const isCorrect = userAnswers[question.id] === question.correctAnswer;
    
    if (isCorrect) {
      totalCorrect++;
    }

    const key = `${question.subject}__${question.topic}`;
    if (!topicStats[key]) {
      topicStats[key] = { subject: question.subject, correct: 0, total: 0 };
    }
    
    topicStats[key].total++;
    if (isCorrect) {
      topicStats[key].correct++;
    }
  }

  const overallScore = questionBank.length > 0 ? (totalCorrect / questionBank.length) * 100 : 0;
  // Based on CSC Exam passing rate of 80%
  const passed = overallScore >= 80;

  const topicPerformance: TopicPerformance[] = Object.entries(topicStats).map(([key, stats]) => {
    const [, topic] = key.split('__');
    const percentage = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
    
    let masteryStatus: MasteryStatus;
    if (percentage >= 90) masteryStatus = 'MASTERED';
    else if (percentage >= 80) masteryStatus = 'STRONG';
    else if (percentage >= 65) masteryStatus = 'NEEDS_IMPROVEMENT';
    else masteryStatus = 'PRIORITY_REVIEW';

    return {
      subject: stats.subject,
      topic,
      correctCount: stats.correct,
      totalCount: stats.total,
      percentage,
      masteryStatus,
    };
  });

  return {
    overallScore,
    passed,
    topicPerformance,
  };
};
