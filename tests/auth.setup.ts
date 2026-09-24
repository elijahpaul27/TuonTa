import { test as setup, expect } from '@playwright/test';
import path from 'path';
import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
  // Step 1: Seed the local database to guarantee a fully onboarded test user exists
  const hashedPassword = await bcrypt.hash('password123', 10);
  const onboardingData = {
    examLevel: 'Professional',
    targetExamDate: new Date('2026-12-31'),
  };

  await prisma.user.upsert({
    where: { email: 'testuser@example.com' },
    update: { 
      password: hashedPassword,
      ...onboardingData 
    },
    create: {
      email: 'testuser@example.com',
      password: hashedPassword,
      name: 'E2E Test User',
      role: 'USER',
      ...onboardingData
    },
  });

  // Step 2: Navigate to login page
  await page.goto('/login');
  
  // Step 3: Fill in credentials using resilient locators
  await page.getByPlaceholder('user@example.com').fill('testuser@example.com');
  await page.locator('input[type="password"]').fill('password123');
  
  // Step 4: Click login button using semantic role
  await page.getByRole('button', { name: /sign in/i }).click();
  
  // Step 5: Wait for redirect to either dashboard or onboarding
  await page.waitForURL(/.*(\/dashboard|\/onboarding).*/);

  // If the app strictly redirects to onboarding despite DB state, click through it
  if (page.url().includes('/onboarding')) {
    const completeSetupBtn = page.getByRole('button', { name: /Complete Setup/i });
    if (await completeSetupBtn.isVisible()) {
      await completeSetupBtn.click();
    }
  }

  // Ensure session is fully established on dashboard
  await page.waitForURL('**/dashboard');
  
  // Verify successful login (dashboard header text)
  await expect(page.getByText('AI-Powered CSC Reviewer')).toBeVisible();

  // Save authentication state securely
  await page.context().storageState({ path: authFile });
});
