import { expect, test } from '@playwright/test';

import { stubAnonymousVisitor } from './support/stubApi';

test.beforeEach(async ({ page }) => {
	await stubAnonymousVisitor(page);
});

test('home page loads with the site title, header, heading and footer', async ({
	page,
}) => {
	await page.goto('/');

	await expect(page).toHaveTitle('Typing practice | Çatire Type');
	await expect(page.getByRole('banner')).toBeVisible();
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
	await expect(page.getByRole('contentinfo')).toBeVisible();
});

test('the mobile menu shows the app version', async ({ page }) => {
	// the version is shown only in the menu, which phones open from the header
	await page.setViewportSize({ width: 375, height: 812 });
	await page.goto('/');

	await page.getByRole('button', { name: 'Toggle menu' }).click();

	await expect(
		page.getByRole('dialog').getByText(/^v\d+\.\d+\.\d+$/)
	).toBeVisible();
});
