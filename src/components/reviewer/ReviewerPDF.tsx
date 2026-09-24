import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { PersonalizedReviewerOutput } from '@/lib/ai/prompts';
import { ExamPerformanceResult } from '@/lib/scoring';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#78A4CB',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    color: '#78A4CB',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#333333',
    marginTop: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#78A4CB',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  text: {
    fontSize: 12,
    color: '#333333',
    lineHeight: 1.5,
    marginBottom: 5,
  },
  listItem: {
    fontSize: 12,
    color: '#333333',
    lineHeight: 1.5,
    marginLeft: 10,
    marginBottom: 4,
  },
  questionBox: {
    padding: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    marginBottom: 15,
  },
  questionText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  optionText: {
    fontSize: 11,
    marginLeft: 10,
    marginBottom: 2,
  },
  explanationTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 8,
    color: '#166534',
  },
  explanationText: {
    fontSize: 11,
    color: '#333333',
  },
});

interface ReviewerPDFProps {
  reviewer: PersonalizedReviewerOutput;
  performance: ExamPerformanceResult;
}

export const ReviewerPDF = ({ reviewer, performance }: ReviewerPDFProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>CSC Personalized Study Guide</Text>
        <Text style={styles.subtitle}>
          Overall Score: {performance.overallScore.toFixed(2)}% ({performance.passed ? 'PASSED' : 'NEEDS IMPROVEMENT'})
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance Overview</Text>
        <Text style={styles.text}>{reviewer.overview}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Key Concepts to Review</Text>
        {reviewer.keyConcepts.map((concept, index) => (
          <Text key={index} style={styles.listItem}>• {concept}</Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Practice Questions</Text>
        {reviewer.practiceQuestions.map((pq, index) => (
          <View key={index} style={styles.questionBox}>
            <Text style={styles.questionText}>
              Q{index + 1}: {pq.question}
            </Text>
            {pq.options.map((opt, oIdx) => (
              <Text key={oIdx} style={styles.optionText}>- {opt}</Text>
            ))}
            <Text style={styles.explanationTitle}>Answer: {pq.correctAnswer}</Text>
            <Text style={styles.explanationText}>{pq.explanation}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recommended Topics Next</Text>
        {reviewer.recommendedTopics.map((topic, index) => (
          <Text key={index} style={styles.listItem}>• {topic}</Text>
        ))}
      </View>
    </Page>
  </Document>
);
