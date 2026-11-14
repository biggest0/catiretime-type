import { expect, test, type Page } from '@playwright/test';

import { SITE_NAME } from '../src/constants/site';
import fr from '../src/i18n/fr/common.json' with { type: 'json' };
import { stubAnonymousVisitor } from './support/stubApi';

// index.html starts as <html lang="en">. The French test proves that main.tsx
// loads i18n and that i18n catches the language it picks at startup; the
// German one, that a language the app doesn't support never reaches the page.
// The rest pick a language in the app, from the header and from the phone's
// menu.

test.beforeEach(async ({ page }) => {
	await stubAnonymousVisitor(page);
});

/**
 * Checks the home page is in French: the page's language, which screen
 * readers pronounce it by, then the header, the page and the tab's title.
 *
 * @param page - The test's page, on the home page.
 */
async function expectFrenchHomePage(page: Page) {
	await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
	await expect(
		page.getByRole('navigation').getByRole('link', { name: fr.NAVIGATION.HOME })
	).toBeVisible();
	await expect(
		page.getByRole('heading', { level: 1, name: fr.SEO.HOME.TITLE })
	).toBeVisible();
	await expect(page).toHaveTitle(`${fr.SEO.HOME.TITLE} | ${SITE_NAME}`);
}

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

test('a language picked in one tab reaches the other tabs', async ({
	context,
	page,
}) => {
	const otherTab = await context.newPage();
	await stubAnonymousVisitor(otherTab);
	await page.goto('/');
	await otherTab.goto('/');
	await expect(otherTab.locator('html')).toHaveAttribute('lang', 'en');

	await page.getByRole('button', { name: 'Language' }).click();
	await page.getByRole('menuitemradio', { name: /Français/ }).click();

	await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
	// the browser tells the other tab that the saved language changed
	await expect(otherTab.locator('html')).toHaveAttribute('lang', 'fr');
});

test('a language picked in the header translates the page and is kept', async ({
	page,
}) => {
	await page.goto('/');

	await page.getByRole('button', { name: 'Language' }).click();
	await page.getByRole('menuitemradio', { name: /Français/ }).click();

	// in place: no reload, the same address
	await expectFrenchHomePage(page);

	// the choice is saved: the next visit starts in French
	await page.reload();
	await expectFrenchHomePage(page);
});

test("the phone menu's language row translates the page, menu included", async ({
	page,
}) => {
	await page.setViewportSize({ width: 375, height: 812 });
	await page.goto('/');
	await page.getByRole('button', { name: 'Toggle menu' }).click();
	const menu = page.getByRole('dialog');

	// "Language" unfolds the languages beside it
	await menu.getByRole('button', { name: 'Language' }).click();
	await menu.getByRole('button', { name: 'Français' }).click();

	await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
	// the menu stays open, now in French
	await expect(
		menu.getByRole('link', { name: fr.NAVIGATION.HOME })
	).toBeVisible();
	await expect(
		menu.getByRole('button', { name: fr.COMMON.LANGUAGE })
	).toBeVisible();
});
