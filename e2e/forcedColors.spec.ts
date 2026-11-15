import { expect, test } from '@playwright/test';

import { stubAnonymousVisitor } from './support/stubApi';

// Forced colours (Windows "contrast themes") replace the page's colours with
// the visitor's own few: every background becomes the page's, whatever the
// stylesheet says. Anything drawn with a background colour alone vanishes
// unless it asks for one of those system colours. Chromium and Firefox apply
// the mode here; WebKit doesn't change its colours, so it passes untouched.

test.beforeEach(async ({ page }) => {
	await stubAnonymousVisitor(page);
	await page.emulateMedia({ forcedColors: 'active' });
});

test("the phone menu button's lines stay visible in forced colours", async ({
	page,
}) => {
	await page.setViewportSize({ width: 375, height: 812 });
	await page.goto('/');
	const menuButton = page.getByRole('button', { name: 'Toggle menu' });
	await expect(menuButton).toBeVisible();
	const pageColour = await page.evaluate(
		() => getComputedStyle(document.body).backgroundColor
	);

	// the three lines are the whole icon
	const lines = menuButton.locator('span');
	await expect(lines).toHaveCount(3);
	for (const line of await lines.all()) {
		await expect(line).not.toHaveCSS('background-color', pageColour);
	}
});
