import { expect, test, type Page } from '@playwright/test';

import { SITE_NAME } from '../src/constants/site';
import en from '../src/i18n/en/common.json' with { type: 'json' };
import { stubAnonymousVisitor, stubSignedInVisitor } from './support/stubApi';

// Walks the app's pages as a visitor does, in the built app: each page from
// its own address, then from page to page by links and the Back button.
// Every test runs at a desktop and a phone size, because the header's links
// are in a different place at each.

const SIZES = [
	{ name: 'desktop', viewport: { width: 1280, height: 720 }, hasMenu: false },
	// below Tailwind's `md` the header's links are inside the menu
	{ name: 'phone', viewport: { width: 375, height: 812 }, hasMenu: true },
];

/** The title the browser tab shows for a page. */
const tabTitle = (pageTitle: string) => `${pageTitle} | ${SITE_NAME}`;

test.beforeEach(async ({ page }) => {
	await stubAnonymousVisitor(page);
});

/**
 * Checks which page is on screen, by its one main heading and its tab title,
 * and that it sits between the header and the footer.
 *
 * @param page - The test's page.
 * @param heading - The text of the page's `h1`.
 * @param title - The page's own title, without the site's name.
 */
async function expectPage(page: Page, heading: string, title: string) {
	await expect(
		page.getByRole('heading', { level: 1, name: heading })
	).toBeVisible();
	await expect(page).toHaveTitle(tabTitle(title));
	await expect(page.getByRole('banner')).toBeVisible();
	await expect(page.getByRole('contentinfo')).toBeVisible();
}

const expectHomePage = (page: Page) =>
	expectPage(page, en.SEO.HOME.TITLE, en.SEO.HOME.TITLE);
const expectAccountPage = (page: Page) =>
	expectPage(page, en.PAGES.ACCOUNT.TITLE, en.SEO.ACCOUNT.TITLE);
const expectNotFoundPage = (page: Page) =>
	expectPage(page, en.PAGES.NOT_FOUND.TITLE, en.SEO.NOT_FOUND.TITLE);

for (const { name, viewport, hasMenu } of SIZES) {
	test.describe(`at ${name} size`, () => {
		test.use({ viewport });

		/**
		 * Follows the account link: in the header, or on a phone in the menu,
		 * which it opens first.
		 *
		 * @param page - The test's page.
		 * @param label - The link's name: "Account" signed in, "Log In" if not.
		 */
		async function followAccountLink(page: Page, label: string) {
			if (hasMenu) {
				await page.getByRole('button', { name: 'Toggle menu' }).click();
				await page
					.getByRole('dialog')
					.getByRole('link', { name: label })
					.click();
			} else {
				await page
					.getByRole('banner')
					.getByRole('link', { name: label })
					.click();
			}
		}

		test('each page opens from its own address', async ({ page }) => {
			await stubSignedInVisitor(page);

			await page.goto('/');
			await expectHomePage(page);

			await page.goto('/account');
			await expectAccountPage(page);

			await page.goto('/no-such-page');
			await expectNotFoundPage(page);
		});

		test('links lead from page to page, and Back retraces them', async ({
			page,
		}) => {
			await stubSignedInVisitor(page);
			await page.goto('/');

			await followAccountLink(page, 'Account');
			await expect(page).toHaveURL('/account');
			await expectAccountPage(page);

			// the section bar's link, under the header at every size
			await page
				.getByRole('navigation')
				.getByRole('link', { name: 'Home' })
				.click();
			await expect(page).toHaveURL('/');
			await expectHomePage(page);

			await page.goBack();
			await expect(page).toHaveURL('/account');
			await expectAccountPage(page);

			await page.goBack();
			await expect(page).toHaveURL('/');
			await expectHomePage(page);
		});

		test('the account link sends a signed-out visitor to the login address', async ({
			page,
		}) => {
			await page.goto('/');

			await followAccountLink(page, 'Log In');

			// only the address: the login page itself comes with the auth pages
			await expect(page).toHaveURL('/login');
		});

		test('an unknown address shows the not-found page, with a way home', async ({
			page,
		}) => {
			await page.goto('/no-such-page');
			await expectNotFoundPage(page);

			await page.getByRole('link', { name: 'Back to home' }).click();

			await expect(page).toHaveURL('/');
			await expectHomePage(page);
		});
	});
}
