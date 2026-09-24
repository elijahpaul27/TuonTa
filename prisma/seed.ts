import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const MOCK_QUESTIONS = [
  {
    subject: 'Mathematics',
    topic: 'Ratios and Proportions',
    difficulty: 'EASY',
    questionText: 'A class has 10 boys and 15 girls. What is the ratio of boys to girls in simplest form?',
    options: JSON.stringify([
      { id: 'A', text: '2:3' },
      { id: 'B', text: '3:2' },
      { id: 'C', text: '1:2' },
      { id: 'D', text: '2:5' },
    ]),
    correctAnswer: 'A',
    explanation: 'Divide both by GCD 5: 10/5 = 2, 15/5 = 3. Ratio is 2:3.',
    status: 'VERIFIED' as const,
  },
  {
    subject: 'Mathematics',
    topic: 'Fractions',
    difficulty: 'EASY',
    questionText: 'What is 1/2 + 1/4?',
    options: JSON.stringify([
      { id: 'A', text: '2/6' },
      { id: 'B', text: '1/4' },
      { id: 'C', text: '3/4' },
      { id: 'D', text: '2/4' },
    ]),
    correctAnswer: 'C',
    explanation: 'Find the LCD (4). 1/2 = 2/4. Then 2/4 + 1/4 = 3/4.',
    status: 'VERIFIED' as const,
  },
  {
    subject: 'English',
    topic: 'Subject-Verb Agreement',
    difficulty: 'EASY',
    questionText: 'Which of the following sentences is grammatically correct?',
    options: JSON.stringify([
      { id: 'A', text: 'The dogs chases the cat.' },
      { id: 'B', text: 'The dog chases the cat.' },
      { id: 'C', text: 'The dog chase the cat.' },
      { id: 'D', text: 'The dog are chasing the cat.' },
    ]),
    correctAnswer: 'B',
    explanation: 'A singular subject (the dog) takes a singular verb (chases).',
    status: 'VERIFIED' as const,
  },
  {
    subject: 'English',
    topic: 'Vocabulary',
    difficulty: 'MEDIUM',
    questionText: 'What does the word "eloquent" mean?',
    options: JSON.stringify([
      { id: 'A', text: 'Clumsy or awkward' },
      { id: 'B', text: 'Fluent and persuasive in speaking or writing' },
      { id: 'C', text: 'Silent and reserved' },
      { id: 'D', text: 'Angry and aggressive' },
    ]),
    correctAnswer: 'B',
    explanation: '"Eloquent" means fluent, persuasive, and well-expressed in speech or writing.',
    status: 'VERIFIED' as const,
  },
  {
    subject: 'General Information',
    topic: 'Philippine Government',
    difficulty: 'MEDIUM',
    questionText: 'What is the term of office of the President of the Philippines?',
    options: JSON.stringify([
      { id: 'A', text: '4 years, eligible for re-election' },
      { id: 'B', text: '6 years, with no re-election' },
      { id: 'C', text: '6 years, eligible for one re-election' },
      { id: 'D', text: '4 years, with no re-election' },
    ]),
    correctAnswer: 'B',
    explanation: 'Under the 1987 Constitution, the President serves a single 6-year term with no re-election.',
    status: 'VERIFIED' as const,
  },
  {
    subject: 'General Information',
    topic: 'Philippine History',
    difficulty: 'MEDIUM',
    questionText: 'Who was the first President of the Philippine Republic under the 1987 Constitution?',
    options: JSON.stringify([
      { id: 'A', text: 'Ferdinand Marcos' },
      { id: 'B', text: 'Benigno Aquino III' },
      { id: 'C', text: 'Corazon Aquino' },
      { id: 'D', text: 'Fidel Ramos' },
    ]),
    correctAnswer: 'C',
    explanation: 'Corazon Aquino was the first president under the restored democracy and the 1987 Constitution.',
    status: 'VERIFIED' as const,
  },
  {
    subject: 'Mathematics',
    topic: 'Percentage',
    difficulty: 'MEDIUM',
    questionText: 'A shirt originally costs ₱500. It is on sale at 20% off. How much is the discount?',
    options: JSON.stringify([
      { id: 'A', text: '₱50' },
      { id: 'B', text: '₱100' },
      { id: 'C', text: '₱150' },
      { id: 'D', text: '₱200' },
    ]),
    correctAnswer: 'B',
    explanation: '20% of ₱500 = 0.20 × 500 = ₱100.',
    status: 'VERIFIED' as const,
  },
  {
    subject: 'English',
    topic: 'Reading Comprehension',
    difficulty: 'HARD',
    questionText: 'In critical reading, what is the primary purpose of identifying an author\'s "tone"?',
    options: JSON.stringify([
      { id: 'A', text: 'To determine the genre of the text' },
      { id: 'B', text: 'To understand the author\'s attitude toward the subject' },
      { id: 'C', text: 'To identify the main characters' },
      { id: 'D', text: 'To find the thesis statement' },
    ]),
    correctAnswer: 'B',
    explanation: 'An author\'s tone reveals their attitude or feeling toward the topic, which shapes how the message is conveyed.',
    status: 'VERIFIED' as const,
  },
  {
    subject: 'Mathematics',
    topic: 'Algebra',
    difficulty: 'MEDIUM',
    questionText: 'Solve for x: 2x + 5 = 15',
    options: JSON.stringify([
      { id: 'A', text: 'x = 3' },
      { id: 'B', text: 'x = 5' },
      { id: 'C', text: 'x = 10' },
      { id: 'D', text: 'x = 7' },
    ]),
    correctAnswer: 'B',
    explanation: 'Subtract 5 from both sides: 2x = 10. Divide by 2: x = 5.',
    status: 'VERIFIED' as const,
  },
  {
    subject: 'General Information',
    topic: 'Philippine Law',
    difficulty: 'HARD',
    questionText: 'Under the Civil Service Law, which of the following employees is covered by the Career Service?',
    options: JSON.stringify([
      { id: 'A', text: 'Contractual employees hired for specific projects' },
      { id: 'B', text: 'Elected officials and their personal staff' },
      { id: 'C', text: 'Permanent employees in government agencies who passed civil service examinations' },
      { id: 'D', text: 'Employees of government-owned corporations without original charters' },
    ]),
    correctAnswer: 'C',
    explanation: 'The Career Service is composed of positions in government that are filled based on merit, fitness, and examination.',
    status: 'VERIFIED' as const,
  },
  {
    subject: 'Mathematics',
    topic: 'Statistics',
    difficulty: 'MEDIUM',
    questionText: 'What is the median of the following set: {3, 7, 1, 9, 4}?',
    options: JSON.stringify([
      { id: 'A', text: '4' },
      { id: 'B', text: '7' },
      { id: 'C', text: '3' },
      { id: 'D', text: '5' },
    ]),
    correctAnswer: 'A',
    explanation: 'Sort the set: {1, 3, 4, 7, 9}. The middle value (3rd element) is 4.',
    status: 'VERIFIED' as const,
  },
  {
    subject: 'English',
    topic: 'Grammar',
    difficulty: 'MEDIUM',
    questionText: 'Choose the word that correctly completes the sentence: "Neither the manager nor the employees ___ happy with the decision."',
    options: JSON.stringify([
      { id: 'A', text: 'was' },
      { id: 'B', text: 'were' },
      { id: 'C', text: 'is' },
      { id: 'D', text: 'has been' },
    ]),
    correctAnswer: 'B',
    explanation: 'With "neither...nor", the verb agrees with the subject closer to it ("employees" is plural), so "were" is correct.',
    status: 'VERIFIED' as const,
  },
  {
    subject: 'General Information',
    topic: 'Geography',
    difficulty: 'EASY',
    questionText: 'Which body of water lies to the west of the Philippines?',
    options: JSON.stringify([
      { id: 'A', text: 'Pacific Ocean' },
      { id: 'B', text: 'South China Sea' },
      { id: 'C', text: 'Sulu Sea' },
      { id: 'D', text: 'Celebes Sea' },
    ]),
    correctAnswer: 'B',
    explanation: 'The South China Sea (West Philippine Sea) lies to the west of the Philippine archipelago.',
    status: 'VERIFIED' as const,
  },
  {
    subject: 'Mathematics',
    topic: 'Number Series',
    difficulty: 'MEDIUM',
    questionText: 'What is the next number in the series: 2, 5, 10, 17, 26, ___?',
    options: JSON.stringify([
      { id: 'A', text: '35' },
      { id: 'B', text: '36' },
      { id: 'C', text: '37' },
      { id: 'D', text: '38' },
    ]),
    correctAnswer: 'C',
    explanation: 'The differences are 3, 5, 7, 9, 11 (odd numbers increasing). 26 + 11 = 37.',
    status: 'VERIFIED' as const,
  },
  {
    subject: 'English',
    topic: 'Analogy',
    difficulty: 'MEDIUM',
    questionText: 'Doctor : Hospital :: Teacher : ___',
    options: JSON.stringify([
      { id: 'A', text: 'Lesson' },
      { id: 'B', text: 'Student' },
      { id: 'C', text: 'School' },
      { id: 'D', text: 'Book' },
    ]),
    correctAnswer: 'C',
    explanation: 'A Doctor works in a Hospital; a Teacher works in a School. This is an "agent : workplace" analogy.',
    status: 'VERIFIED' as const,
  },
]

async function main() {
  // ── Seed Users ────────────────────────────────────────────────────────────
  await prisma.user.upsert({
    where: { email: 'admin@cscreviewer.com' },
    update: {},
    create: {
      email: 'admin@cscreviewer.com',
      name: 'Admin User',
      password: 'adminpassword',
      role: 'ADMIN',
    },
  })

  await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Test User',
      password: 'password123',
      role: 'USER',
    },
  })

  // ── Seed Questions (VERIFIED so they appear in exams) ────────────────────
  console.log('Seeding questions...')
  for (const q of MOCK_QUESTIONS) {
    await prisma.question.upsert({
      where: {
        // Upsert by subject+topic+questionText to avoid duplicates on re-seed
        id: `seed-${q.subject}-${q.topic}-${q.questionText}`.replace(/[^a-zA-Z0-9-]/g, '').slice(0, 25),
      },
      update: { status: 'VERIFIED' },
      create: {
        id: `seed-${q.subject}-${q.topic}-${q.questionText}`.replace(/[^a-zA-Z0-9-]/g, '').slice(0, 25),
        ...q,
      },
    })
  }

  console.log(`✅ Database seeded: 2 users + ${MOCK_QUESTIONS.length} VERIFIED questions.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
