import { test, expect } from '@playwright/test';

test.describe('Critical Flow 2 - Zod AI Resilience & Remediation', () => {
  // Use a hardcoded sessionId for the results page.
  // In a real pipeline, we might seed this in the global setup or use an API to create a mock session.
  const MOCK_SESSION_ID = 'test-session-123';
  const RESULTS_URL = `/test-center/results/${MOCK_SESSION_ID}`;

  test('UI renders AI Study Guide tabs successfully when AI returns valid Zod-compliant JSON', async ({ page }) => {
    // 1. Mock the AI Route (Success Scenario)
    await page.route('**/api/exams/*/retry-ai', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          topicOverviews: [
            {
              topic: "Fractions",
              performance: "Needs Improvement",
              coreConcepts: ["Common Denominators"],
              studyStrategy: "Practice cross-multiplication.",
              recommendedResources: ["Khan Academy - Fractions"]
            }
          ]
        })
      });
    });

    // 2. Navigate to the results page
    await page.goto(RESULTS_URL);

    // If the results page automatically calls retry-ai or if there's a button,
    // we wait for the AI Study Guide to render.
    // If it requires clicking a "Generate AI Guide" button first, we click it.
    const generateBtn = page.getByRole('button', { name: /Generate AI Guide|Retry AI/i });
    if (await generateBtn.isVisible()) {
      await generateBtn.click();
    }

    // 3. Assert the UI renders the AI Study Guide tabs successfully
    // Assuming Shadcn Tabs are used and "Fractions" becomes a tab or header
    await expect(page.getByText('Fractions')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Practice cross-multiplication.')).toBeVisible();
  });

  test('UI handles AI hallucination (Zod Error 500) gracefully without crashing', async ({ page }) => {
    // 1. Mock the AI Route (Hallucination / 500 Scenario)
    await page.route('**/api/exams/*/retry-ai', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: "AI hallucinated invalid structure. Please try again."
        })
      });
    });

    // 2. Navigate to the results page
    await page.goto(RESULTS_URL);

    const generateBtn = page.getByRole('button', { name: /Generate AI Guide|Retry AI/i });
    if (await generateBtn.isVisible()) {
      await generateBtn.click();
    }

    // 3. Assert the frontend catches this gracefully and renders the fallback state
    await expect(page.getByText('AI Analysis Temporarily Unavailable')).toBeVisible({ timeout: 10000 });
    
    // Assert the Retry button is visible
    const retryBtn = page.getByRole('button', { name: 'Retry' });
    await expect(retryBtn).toBeVisible();
  });
});
