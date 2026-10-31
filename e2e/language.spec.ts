import { expect, test } from '@playwright/test';

import { stubAnonymousVisitor } from './support/stubApi';

// index.html starts as <html lang="en">. The French test proves that main.tsx
// loads i18n and that i18n catches the language it picks at startup; the
// German one, that a language the app doesn't support never reaches the page.

test.beforeEach(async ({ page }) => {
	await stubAnonymousVisitor(page);
});

test.describe('with a French (Canada) browser', () => {
	test.use({ locale: 'fr-CA' });

	test('the page language becomes French', async ({ page }) => {
		await page.goto('/');

		await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
	});
});

test.describe('with a browser language the app does not support', () => {
	test.use({ locale: 'de-DE' });

	test('the page language falls back to English', async ({ page }) => {
		await page.goto('/');

		await expect(page.locator('html')).toHaveAttribute('lang', 'en');
	});
});
