import type { Page } from '@playwright/test';

/** The user the fake backend signs in. */
export const TEST_USER = { id: 'user-1', email: 'reader@example.com' };

/**
 * Answers the backend calls every page load makes, as for a visitor with no
 * session, so e2e tests never reach a real server. The startup session check
 * gets a 401.
 *
 * @param page - The test's page.
 */
export async function stubAnonymousVisitor(page: Page): Promise<void> {
	await page.route('**/auth/user/refresh', (route) =>
		route.fulfill({ status: 401, json: { error: 'No session' } })
	);
}

/**
 * Answers the startup session check as for a visitor with a valid session:
 * it returns `TEST_USER`, and the app signs them in. Page code can't see the
 * session's cookies, so this answer is all a signed-in visitor is to it;
 * nothing is saved in the browser first, as for someone who signed in on
 * another app that shares the session.
 *
 * Call it after `stubAnonymousVisitor()` (each spec's `beforeEach`): of two
 * answers for the same address, Playwright uses the one added last.
 *
 * @param page - The test's page.
 */
export async function stubSignedInVisitor(page: Page): Promise<void> {
	await page.route('**/auth/user/refresh', (route) =>
		route.fulfill({ status: 200, json: { user: TEST_USER } })
	);
}
