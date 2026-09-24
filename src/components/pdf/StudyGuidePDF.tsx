import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { PersonalizedReviewerOutput } from '@/lib/ai/prompts';

// Create PDF primitive styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#1e3a8a',
    borderBottomStyle: 'solid',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 5,
  },
  section: {
    marginTop: 20,
    marginBottom: 10,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 10,
    backgroundColor: '#f8fafc',
    padding: 5,
  },
  paragraph: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 1.5,
    marginBottom: 10,
  },
  bulletPointContainer: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingLeft: 10,
  },
  bullet: {
    width: 15,
    fontSize: 12,
    color: '#1e3a8a',
  },
  bulletText: {
    flex: 1,
    fontSize: 12,
    color: '#334155',
    lineHeight: 1.4,
  },
  questionContainer: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
  },
  questionText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 5,
  },
  optionText: {
    fontSize: 11,
    color: '#475569',
    marginLeft: 10,
    marginBottom: 3,
  },
  answerBox: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#cbd5e1',
    borderTopStyle: 'solid',
  },
  correctAnswerText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#15803d',
    marginBottom: 3,
  },
  explanationText: {
    fontSize: 11,
    color: '#334155',
    lineHeight: 1.4,
  },
  pillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 5,
  },
  pill: {
    backgroundColor: '#e0e7ff',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
    fontSize: 10,
    color: '#1e3a8a',
    marginRight: 5,
    marginBottom: 5,
  }
});

interface StudyGuidePDFProps {
  payload: PersonalizedReviewerOutput;
}

export function StudyGuidePDF({ payload }: StudyGuidePDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>AI Study Guide</Text>
          <Text style={styles.subtitle}>Personalized CSC Exam Reviewer</Text>
        </View>

        {/* Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Performance Overview</Text>
          <Text style={styles.paragraph}>{payload.overview}</Text>
        </View>

        {/* Key Concepts */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Key Concepts to Review</Text>
          {payload.keyConcepts.map((concept, idx) => (
            <View key={idx} style={styles.bulletPointContainer}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>{concept}</Text>
            </View>
          ))}
        </View>

        {/* Practice Questions */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Targeted Practice Questions</Text>
          {payload.practiceQuestions.map((pq, idx) => (
            <View key={idx} style={styles.questionContainer} wrap={false}>
              <Text style={styles.questionText}>{idx + 1}. {pq.question}</Text>
              
              {pq.options.map((opt, oIdx) => (
                <Text key={oIdx} style={styles.optionText}>- {opt}</Text>
              ))}
              
              <View style={styles.answerBox}>
                <Text style={styles.correctAnswerText}>Correct Answer: {pq.correctAnswer}</Text>
                <Text style={styles.explanationText}>{pq.explanation}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Recommended Topics */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Recommended Next Steps</Text>
          <View style={styles.pillContainer}>
            {payload.recommendedTopics.map((topic, idx) => (
              <Text key={idx} style={styles.pill}>{topic}</Text>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  );
}
