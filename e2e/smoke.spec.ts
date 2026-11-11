import { expect, test } from '@playwright/test';

import { SITE_NAME } from '../src/constants/site';
import en from '../src/i18n/en/common.json' with { type: 'json' };
import { stubAnonymousVisitor } from './support/stubApi';

test.beforeEach(async ({ page }) => {
	await stubAnonymousVisitor(page);
});

test('home page loads with the site title, header, heading and footer', async ({
	page,
}) => {
	await page.goto('/');

	await expect(page).toHaveTitle(`${en.SEO.HOME.TITLE} | ${SITE_NAME}`);
	await expect(page.getByRole('banner')).toBeVisible();
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
	await expect(page.getByRole('contentinfo')).toBeVisible();
});

test('the mobile menu shows the app version', async ({ page }) => {
	// the version is shown only in the menu, which phones open from the header
	await page.setViewportSize({ width: 375, height: 812 });
	await page.goto('/');

	await page.getByRole('button', { name: 'Toggle menu' }).click();

	const menu = page.getByRole('dialog');
	await expect(menu.getByText(/^v\d+\.\d+\.\d+$/)).toBeVisible();
	// full-screen: the side panel's edge line would show down the left side
	await expect(menu).toHaveCSS('border-left-width', '0px');
});
