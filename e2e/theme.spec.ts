import { expect, test, type Page } from '@playwright/test';

import { APP_SETTING } from '../src/constants/keys';

// The theme script in index.html must show the saved theme before the app's
// JavaScript runs. The first three tests block that JavaScript, so only the
// script can pass them. They use the app's own storage key: if keys.ts and
// the script stop agreeing, the saved theme is missed and they fail.

/**
 * Saves a theme the way the app does, before the page loads.
 *
 * @param page - The test's page.
 * @param themeMode - The mode to save: 'light', 'dark' or 'system'.
 */
async function saveTheme(page: Page, themeMode: string) {
	await page.addInitScript(
		([key, mode]) =>
			localStorage.setItem(key, JSON.stringify({ themeMode: mode })),
		[APP_SETTING, themeMode]
	);
}

/**
 * Stops the app's JavaScript from loading, leaving only index.html.
 *
 * @param page - The test's page.
 */
async function blockAppScripts(page: Page) {
	await page.route('**/assets/*.js', (route) => route.abort());
}

/**
 * Checks that both theme-color tags hold the page's background colour, so
 * the browser bar matches the theme on screen.
 *
 * @param page - The test's page.
 */
async function expectBrowserBarToMatchPage(page: Page) {
	const { background, tags } = await page.evaluate(() => {
		// compare colours, not spellings: the build shortens #ffffff to #fff,
		// and the browser turns any spelling into rgb()
		const toRgb = (colour: string) => {
			const probe = document.createElement('div');
			probe.style.color = colour;
			document.body.append(probe);
			const rgb = getComputedStyle(probe).color;
			probe.remove();
			return rgb;
		};

		return {
			background: getComputedStyle(document.body).backgroundColor,
			tags: [...document.querySelectorAll('meta[name="theme-color"]')].map(
				(tag) => toRgb(tag.getAttribute('content') ?? '')
			),
		};
	});

	expect(tags).toEqual([background, background]);
}

test.describe('on a light OS', () => {
	test.use({ colorScheme: 'light' });

	test('a saved dark theme shows before the JavaScript runs', async ({
		page,
	}) => {
		await saveTheme(page, 'dark');
		await blockAppScripts(page);
		await page.goto('/');

		await expect(page.locator('html')).toHaveClass(/\bdark\b/);
		await expectBrowserBarToMatchPage(page);
	});

	test('the theme picked in the app survives a reload', async ({ page }) => {
		await page.goto('/');
		await page.getByRole('button', { name: /dark mode/i }).click();
		await expect(page.locator('html')).toHaveClass(/\bdark\b/);

		await page.reload();

		await expect(page.locator('html')).toHaveClass(/\bdark\b/);
		await expectBrowserBarToMatchPage(page);
	});
});

test.describe('on a dark OS', () => {
	test.use({ colorScheme: 'dark' });

	test('a saved light theme wins over the OS', async ({ page }) => {
		await saveTheme(page, 'light');
		await blockAppScripts(page);
		await page.goto('/');

		await expect(page.locator('html')).not.toHaveClass(/\bdark\b/);
		await expectBrowserBarToMatchPage(page);
	});

	test('with nothing saved, the page follows the OS', async ({ page }) => {
		await blockAppScripts(page);
		await page.goto('/');

		await expect(page.locator('html')).toHaveClass(/\bdark\b/);
	});
});
