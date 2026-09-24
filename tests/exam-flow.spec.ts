import { test, expect } from '@playwright/test';

test.describe('Critical Flow 1 - Exam Execution & Gamification', () => {
  test('User can start, answer, and submit an exam successfully', async ({ page }) => {
    // 1. Navigate to new exam creation route
    // Note: This route should automatically create a DB session and redirect to /test-center/exam/[sessionId]
    await page.goto('/test-center/exam/new');

    // Wait for the exam runner to load and timer/questions to appear
    await expect(page.getByText('Civil Service Mock Exam')).toBeVisible({ timeout: 15000 });
    
    // 2. Answer questions
    // In our mock/standard exam, there will be multiple questions.
    // Let's answer the first 3 questions to simulate partial completion.
    for (let i = 0; i < 3; i++) {
      // Find all radio buttons for the current question
      const radioButtons = page.locator('button[role="radio"]');
      
      // Wait for radio buttons to be attached
      await radioButtons.first().waitFor({ state: 'visible' });
      
      // Click the first available option
      await radioButtons.first().click();

      // Click "Next" if it exists and we're not on the last iteration
      if (i < 2) {
        const nextButton = page.getByRole('button', { name: /Next|Next Question/i });
        if (await nextButton.isVisible()) {
          await nextButton.click();
        } else {
          break; // Less than 3 questions available
        }
      }
    }

    // 3. Submit Exam
    // Find the submit button in the ExamControls (usually "Submit Exam" or "Finish Exam")
    const openSubmitDialogBtn = page.getByRole('button', { name: /Submit/i });
    await openSubmitDialogBtn.click();

    // Handle Shadcn UI AlertDialog
    // The dialog should have a "Submit Exam" confirmation button
    const confirmSubmitBtn = page.getByRole('button', { name: 'Submit Exam', exact: true });
    await confirmSubmitBtn.waitFor({ state: 'visible' });
    await confirmSubmitBtn.click();

    // 4. Assert Redirect to Results Page
    // The URL should change to /test-center/results/[sessionId]
    await page.waitForURL(/\/test-center\/results\/.+/, { timeout: 15000 });

    // 5. Assert UI Layout loads correctly (Score Breakdown)
    await expect(page.getByText('Score Breakdown')).toBeVisible({ timeout: 10000 });
    // Additional check to ensure confetti or success states rendered
    await expect(page.locator('text=Performance Summary').or(page.locator('text=Score'))).toBeVisible();
  });
});
