import { expect, test } from '@playwright/test';

import { stubAnonymousVisitor } from './support/stubApi';

// Checks on the files the build ships, read from the running preview.

test.beforeEach(async ({ page }) => {
	await stubAnonymousVisitor(page);
});

test('the stylesheet embeds no font files', async ({ page }) => {
	// Small font files embedded as text made every visitor download scripts
	// no page uses (Gothic, Runic…) inside the CSS, before the first paint.
	// vite.config.ts keeps fonts as files (build.assetsInlineLimit).
	await page.goto('/');
	const href = await page
		.locator('link[rel="stylesheet"]')
		.first()
		.getAttribute('href');

	const stylesheet = await (await page.request.get(href!)).text();

	expect(stylesheet).toContain('@font-face');
	expect(stylesheet).not.toContain('data:font');
});
