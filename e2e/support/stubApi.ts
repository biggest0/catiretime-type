import type { Page } from '@playwright/test';

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
