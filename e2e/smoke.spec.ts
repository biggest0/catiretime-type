import { expect, test } from '@playwright/test';

import { stubAnonymousVisitor } from './support/stubApi';

test.beforeEach(async ({ page }) => {
	await stubAnonymousVisitor(page);
});

test('home page loads with the site title and a heading', async ({ page }) => {
	await page.goto('/');

	await expect(page).toHaveTitle('Typing practice | Çatire Type');
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
	await expect(page.getByText(/^v\d+\.\d+\.\d+$/)).toBeVisible();
});
