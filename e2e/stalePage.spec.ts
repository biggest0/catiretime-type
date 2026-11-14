import { expect, test, type Page } from '@playwright/test';

import { ROUTE_RELOAD_ATTEMPTED } from '../src/constants/keys';
import { stubAnonymousVisitor, stubSignedInVisitor } from './support/stubApi';

// Each deploy replaces the site's files, so a tab left open across a deploy
// asks for page files that no longer exist. The app then reloads itself
// once (RouteErrorBoundary). It recognises that failure by the error's
// wording, which each browser writes differently and only a real browser
// can supply: these tests fail in the browser whose wording stops matching.
//
// The account page stands in for "a page whose code loads on demand".

/** Where the build puts the account page's code. */
const ACCOUNT_PAGE_FILE = '**/assets/AccountPage-*.js';

/** What a web host answers for a file that isn't there. */
const NOT_FOUND = {
	status: 404,
	contentType: 'text/html',
	body: '<h1>Not found</h1>',
};

test.beforeEach(async ({ page }) => {
	await stubAnonymousVisitor(page);
	// signed in: the header then links to the account page
	await stubSignedInVisitor(page);
});

/**
 * Counts how many times the browser asks for the page itself: once for the
 * first load, once more for each reload. Moving between pages inside the app
 * asks for nothing.
 *
 * @param page - The test's page.
 * @returns A function giving the count so far.
 */
function countPageLoads(page: Page): () => number {
	let loads = 0;
	page.on('request', (request) => {
		if (request.isNavigationRequest()) loads += 1;
	});
	return () => loads;
}

/**
 * Follows the header's link to the account page.
 *
 * @param page - The test's page, on the home page.
 */
async function openAccountPage(page: Page) {
	await page.getByRole('banner').getByRole('link', { name: 'Account' }).click();
}

test('a tab left open across a deploy reloads once and shows the page', async ({
	page,
}) => {
	const pageLoads = countPageLoads(page);

	// The tab's code is from before the deploy: the first time the app's main
	// file is asked for, it names an account page file that's gone. The reload
	// gets the current code. (If the build ever names these files differently,
	// nothing is renamed here, nothing fails, and the count below says so.)
	let servedOldCode = false;
	await page.route('**/assets/index-*.js', async (route) => {
		if (servedOldCode) return route.continue();
		servedOldCode = true;

		const response = await route.fetch();
		const currentCode = await response.text();
		return route.fulfill({
			response,
			body: currentCode.replace(
				/AccountPage-[\w-]{8}\.js/g,
				'AccountPage-removed.js'
			),
		});
	});
	await page.route('**/assets/AccountPage-removed.js', (route) =>
		route.fulfill(NOT_FOUND)
	);

	await page.goto('/');
	await openAccountPage(page);

	// the visitor ends on the page they asked for, at its address
	await expect(
		page.getByRole('heading', { level: 1, name: 'Account' })
	).toBeVisible();
	await expect(page).toHaveURL('/account');
	// the first load and one reload
	expect(pageLoads()).toBe(2);
});

test('a page file that stays missing gets one reload, then the message', async ({
	page,
}) => {
	const pageLoads = countPageLoads(page);
	await page.route(ACCOUNT_PAGE_FILE, (route) => route.fulfill(NOT_FOUND));
	const message = page.getByText("This page didn't load.");

	await page.goto('/');
	await openAccountPage(page);

	// the reload didn't help: the message, inside the app's frame
	await expect(message).toBeVisible();
	await expect(page.getByRole('banner')).toBeVisible();
	await expect(page.getByRole('contentinfo')).toBeVisible();
	expect(pageLoads()).toBe(2);
	const reloadedAt = await page.evaluate(
		(key) => sessionStorage.getItem(key),
		ROUTE_RELOAD_ATTEMPTED
	);
	expect(reloadedAt).not.toBeNull();

	// the visitor's own reload goes through
	await page.getByRole('button', { name: 'Reload' }).click();
	await expect.poll(pageLoads).toBe(3);
	await expect(message).toBeVisible();

	// and the app didn't follow it with another of its own, which would
	// have saved a new time: no loop
	expect(
		await page.evaluate(
			(key) => sessionStorage.getItem(key),
			ROUTE_RELOAD_ATTEMPTED
		)
	).toBe(reloadedAt);
	expect(pageLoads()).toBe(3);
});

test('offline, the app stays on screen with the message', async ({
	context,
	page,
}) => {
	const pageLoads = countPageLoads(page);
	await page.goto('/');
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

	await context.setOffline(true);
	await openAccountPage(page);

	// A reload now would swap the app for the browser's "no internet" page.
	// The message keeps the header and the pages already loaded within reach,
	// and its button reloads once the visitor is back online.
	await expect(page.getByText("This page didn't load.")).toBeVisible();
	await expect(page.getByRole('banner')).toBeVisible();
	expect(pageLoads()).toBe(1);
});
