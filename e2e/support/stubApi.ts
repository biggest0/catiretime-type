import type { Page, Route } from '@playwright/test';

/** The user the fake backend signs in. */
export const TEST_USER = { id: 'user-1', email: 'reader@example.com' };

/**
 * An error answer, as the backend sends one: its status, its English text
 * (`error`) and its code, which the app translates.
 */
export interface Refusal {
	status: number;
	error: string;
	code: string;
}

/**
 * Answers the backend calls every page load makes, as for a visitor with no
 * session, so e2e tests never reach a real server. The startup session check
 * gets a 401.
 *
 * @param page - The test's page.
 */
export async function stubAnonymousVisitor(page: Page): Promise<void> {
	await page.route('**/auth/user/refresh', (route) =>
		route.fulfill({
			status: 401,
			json: { error: 'No session', code: 'SESSION_INVALID' },
		})
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

/**
 * Answers a call that signs someone in: with `TEST_USER`, or with the
 * refusal given.
 *
 * @param route - The intercepted request.
 * @param refusal - The error answer to give instead, if any.
 * @param okStatus - The status of a success (201 when an account is made).
 * @returns Playwright's promise for the answer.
 */
function answerWithUser(
	route: Route,
	refusal: Refusal | undefined,
	okStatus = 200
): Promise<void> {
	if (!refusal) {
		return route.fulfill({ status: okStatus, json: { user: TEST_USER } });
	}
	const { status, ...body } = refusal;
	return route.fulfill({ status, json: body });
}

/**
 * Answers the sign-in call. Without an argument the sign-in works and
 * returns `TEST_USER`; pass a refusal to test a failed one:
 * `stubLogin(page, { status: 401, error: 'Invalid email or password.',
 * code: 'INVALID_CREDENTIALS' })`.
 *
 * @param page - The test's page.
 * @param refusal - The error answer to give instead.
 */
export async function stubLogin(page: Page, refusal?: Refusal): Promise<void> {
	await page.route('**/auth/user/login', (route) =>
		answerWithUser(route, refusal)
	);
}

/**
 * Answers the register call. Without an argument the account is made and
 * `TEST_USER` is signed in, as the backend does; pass a refusal to test a
 * failed one.
 *
 * @param page - The test's page.
 * @param refusal - The error answer to give instead.
 * @returns How many register calls the page has made so far, read when
 *   called: a form that should refuse before sending must leave it at 0.
 */
export async function stubRegister(
	page: Page,
	refusal?: Refusal
): Promise<() => number> {
	let calls = 0;
	await page.route('**/auth/user/register', (route) => {
		calls += 1;
		return answerWithUser(route, refusal, 201);
	});
	return () => calls;
}

/**
 * Answers the Google code exchange: the last step of a Google sign-in, made
 * by the Google return page. Without an argument it signs `TEST_USER` in.
 *
 * @param page - The test's page.
 * @param refusal - The error answer to give instead.
 */
export async function stubGoogleExchange(
	page: Page,
	refusal?: Refusal
): Promise<void> {
	await page.route('**/auth/user/google/exchange', (route) =>
		answerWithUser(route, refusal)
	);
}
