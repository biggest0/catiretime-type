import type { Page } from '@playwright/test';

/**
 * Finds the key that moves keyboard focus to the next link or button in the
 * browser under test. Safari's Tab passes links by unless Option is held
 * (its default setting, on every website); other browsers use plain Tab.
 *
 * It tries Tab on a scrap page holding one link, so the answer comes from
 * the browser itself, not from its name or the machine it runs on. Call it
 * before opening the page under test.
 *
 * @param page - The test's page, not yet on the app.
 * @returns `'Tab'`, or `'Alt+Tab'` where plain Tab passes links by.
 */
export async function findTabKey(page: Page): Promise<'Tab' | 'Alt+Tab'> {
	await page.setContent('<a href="#somewhere">A link</a>');
	await page.keyboard.press('Tab');

	const reachedTheLink = await page.evaluate(
		() => document.activeElement?.tagName === 'A'
	);
	return reachedTheLink ? 'Tab' : 'Alt+Tab';
}
