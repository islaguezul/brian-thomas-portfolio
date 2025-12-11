/**
 * Authentication setup for E2E tests
 * Sets up authenticated session state for testing protected admin routes
 */

import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../.playwright/.auth/user.json');

/**
 * Note: In a real testing environment, you would need to:
 * 1. Set up a test user in your GitHub OAuth
 * 2. Use environment variables for credentials
 * 3. Or mock the authentication entirely
 *
 * For now, this setup demonstrates the pattern but may need
 * customization based on your auth flow.
 */
setup('authenticate', async ({ page }) => {
  // For development/testing, we'll simulate being logged in
  // by setting the appropriate cookies/session state

  // Navigate to the login page
  await page.goto('/auth/signin');

  // In a real test environment, you would:
  // 1. Click the GitHub sign-in button
  // 2. Handle the OAuth flow (or use a mock)
  // 3. Wait for redirect back to the app

  // For testing purposes, if you have a bypass or test auth:
  // await page.click('button[data-testid="github-signin"]');

  // Wait for authentication to complete
  // await page.waitForURL('/admin/**');

  // Store the authentication state
  await page.context().storageState({ path: authFile });
});

/**
 * Alternative: Use mock authentication for tests
 * This can be used when you don't want to test the actual OAuth flow
 */
setup.describe.configure({ mode: 'serial' });

setup('mock authenticate', async ({ page, context }) => {
  // Set mock session cookie
  await context.addCookies([
    {
      name: 'next-auth.session-token',
      value: 'test-session-token',
      domain: 'localhost',
      path: '/',
      expires: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
    },
    {
      name: 'adminSelectedTenant',
      value: 'internal',
      domain: 'localhost',
      path: '/',
      expires: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
    },
  ]);

  // Save the storage state
  await context.storageState({ path: authFile });
});
