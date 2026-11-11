import { expect, test, type Page } from '@playwright/test';

import { APP_SETTING } from '../src/constants/keys';
import { SITE_NAME } from '../src/constants/site';
import { findTabKey } from './support/keyboard';
import { stubAnonymousVisitor } from './support/stubApi';

// Keyboard users find their place by the focus ring. index.css draws one ring
// for every link and button; the first tests walk the whole page with Tab
// and check each stop shows it, clearly enough to see (WCAG 1.4.11: 3:1
// against what's around it). The rest follow focus across navigations: a
// page built in the browser has to move it itself, as a page load would.

/** The contrast the ring needs against the page (WCAG 1.4.11). */
const MIN_RING_CONTRAST = 3;

test.beforeEach(async ({ page }) => {
	await stubAnonymousVisitor(page);
});

/**
 * Saves a theme the way the app does, before the page loads.
 *
 * @param page - The test's page.
 * @param themeMode - The mode to save: 'light' or 'dark'.
 */
async function saveTheme(page: Page, themeMode: string) {
	await page.addInitScript(
		([key, mode]) =>
			localStorage.setItem(key, JSON.stringify({ themeMode: mode })),
		[APP_SETTING, themeMode]
	);
}

/**
 * How bright a colour is, from 0 (black) to 1 (white): WCAG's "relative
 * luminance".
 *
 * @param rgb - A colour as the browser reports it, e.g. `rgb(180, 83, 9)`.
 * @returns Its luminance.
 */
function luminance(rgb: string): number {
	const [red, green, blue] = (rgb.match(/[\d.]+/g) ?? []).map((value) => {
		const channel = Number(value) / 255;
		return channel <= 0.04045
			? channel / 12.92
			: ((channel + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

/**
 * WCAG's contrast ratio between two colours, from 1 (the same) to 21.
 *
 * @param first - One colour, as `rgb(…)`.
 * @param second - The other.
 * @returns The ratio, e.g. `5.02` for the light theme's ring on white.
 */
function contrast(first: string, second: string): number {
	const [lighter, darker] = [luminance(first), luminance(second)].sort(
		(a, b) => b - a
	);
	return (lighter + 0.05) / (darker + 0.05);
}

for (const themeMode of ['light', 'dark']) {
	test(`every keyboard stop shows a clear focus ring (${themeMode})`, async ({
		page,
	}) => {
		// Tab, or Option+Tab in Safari, where plain Tab passes links by
		const tabKey = await findTabKey(page);
		await saveTheme(page, themeMode);
		// the not-found page: it adds a button-styled link to the header's and
		// footer's links
		await page.goto('/no-such-page');
		await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

		// every link and button a keyboard can reach (the phone's menu button
		// is hidden at this width)
		const stops = await page.locator('a[href]:visible, button:visible').count();
		expect(stops).toBeGreaterThan(8);

		const pageBackground = await page.evaluate(
			() => getComputedStyle(document.body).backgroundColor
		);
		const focused = page.locator(':focus');

		for (let stop = 0; stop < stops; stop += 1) {
			await page.keyboard.press(tabKey);
			// Each check retries until it passes: buttons fade their styles in
			// over 150 ms, so the first reading can be a colour in between.
			await expect(focused).toHaveCSS('outline-style', 'solid');
			await expect(focused).toHaveCSS('outline-width', '2px');
			await expect
				.poll(async () => {
					const ring = await focused.evaluate(
						(element) => getComputedStyle(element).outlineColor
					);
					return contrast(ring, pageBackground);
				})
				.toBeGreaterThanOrEqual(MIN_RING_CONTRAST);
		}
	});
}

test('a mouse click shows no focus ring', async ({ page }) => {
	await page.goto('/');
	// its label changes when clicked ("Switch to Dark mode" ↔ "… Light mode")
	const themeButton = page
		.getByRole('banner')
		.getByRole('button', { name: /mode$/i });

	await themeButton.click();

	// Chrome and Firefox give a clicked button focus, Safari doesn't: either
	// way a mouse user must see no ring
	await expect(themeButton).toHaveCSS('outline-style', 'none');
});

test('the language menu rings the item the keyboard is on', async ({
	page,
}) => {
	await page.goto('/');
	await page.getByRole('button', { name: 'Language' }).focus();

	await page.keyboard.press('Enter');
	// the menu opens a moment later, with the keyboard on its first item;
	// an ArrowDown sent before that would be lost
	await expect(
		page.getByRole('menuitemradio', { name: /English/ })
	).toBeFocused();
	await page.keyboard.press('ArrowDown');

	// upstream's grey highlight alone is 1.1:1 on the panel
	const current = page.getByRole('menuitemradio', { name: /Français/ });
	await expect(current).toBeFocused();
	await expect(current).toHaveCSS('outline-style', 'solid');
	await expect(current).toHaveCSS('outline-width', '2px');
});

test('the skip link is the first Tab stop and jumps to the content', async ({
	page,
}) => {
	const tabKey = await findTabKey(page);
	await page.goto('/no-such-page');
	// this page's code loads on demand: wait for it, as a visitor would. (Used
	// before it has arrived, the link focuses the content area instead.)
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
	const skipLink = page.getByRole('link', { name: 'Skip to main content' });
	// parked above the top edge until it has focus
	await expect(skipLink).not.toBeInViewport();

	await page.keyboard.press(tabKey);
	await expect(skipLink).toBeFocused();
	await expect(skipLink).toBeInViewport();
	await page.keyboard.press('Enter');

	await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
	// the address is unchanged: no "#main-content", no extra Back step
	await expect(page).toHaveURL('/no-such-page');
	// and Tab goes on into the page, not back through the header
	await page.keyboard.press(tabKey);
	await expect(page.getByRole('link', { name: 'Back to home' })).toBeFocused();
});

test("a link followed by keyboard puts focus on the new page's heading", async ({
	page,
}) => {
	await page.goto('/');
	// the footer's link: before, focus stayed on it, below the window
	await page
		.getByRole('contentinfo')
		.getByRole('link', { name: 'Privacy' })
		.focus();

	await page.keyboard.press('Enter');

	const heading = page.getByRole('heading', {
		level: 1,
		name: 'This page wandered off',
	});
	await expect(heading).toBeFocused();
	// a heading isn't a control: focused by the app, it shows no ring
	await expect(heading).toHaveCSS('outline-style', 'none');
});

test("a link in the mobile menu leaves focus on the new page's heading", async ({
	page,
}) => {
	await page.setViewportSize({ width: 375, height: 812 });
	await page.goto('/');
	await page.getByRole('button', { name: 'Toggle menu' }).click();
	const menu = page.getByRole('dialog');

	await menu.getByRole('link', { name: 'Log In' }).click();

	await expect(menu).toBeHidden();
	// not back on the menu's button, where a closing menu puts focus
	await expect(
		page.getByRole('heading', { level: 1, name: 'This page wandered off' })
	).toBeFocused();
});

test("a link to the page you're on scrolls back to the top", async ({
	page,
}) => {
	await page.setViewportSize({ width: 1280, height: 500 });
	await page.goto('/');
	await page.evaluate(() => window.scrollTo(0, 400));
	await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(400);

	// the wordmark links to the home page, which is this page
	await page.getByRole('banner').getByRole('link', { name: SITE_NAME }).click();

	await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
});
