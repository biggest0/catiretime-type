import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GOOGLE_OAUTH_RETURN_TO, GOOGLE_OAUTH_STATE } from '@/constants/keys';
import { APP_ID } from '@/constants/site';

const realLocation = window.location;
const assign = vi.fn();

/**
 * Loads a fresh copy of the module with the given Google settings, as a
 * build with those values in its env file would have.
 *
 * @param clientId - `VITE_GOOGLE_CLIENT_ID`; empty when not configured.
 * @param redirectUri - `VITE_GOOGLE_REDIRECT_URI`.
 * @returns The module.
 */
async function loadWith(clientId: string, redirectUri: string) {
	vi.resetModules();
	vi.doMock('@/config/config', () => ({
		GOOGLE_CLIENT_ID: clientId,
		GOOGLE_REDIRECT_URI: redirectUri,
	}));
	return import('@/utils/auth/googleLogin');
}

beforeEach(() => {
	// jsdom can't leave the page; replace location with a copy whose
	// assign is a spy
	Object.defineProperty(window, 'location', {
		configurable: true,
		value: { ...realLocation, assign },
	});
});

afterEach(() => {
	Object.defineProperty(window, 'location', {
		configurable: true,
		value: realLocation,
	});
	vi.doUnmock('@/config/config');
	vi.restoreAllMocks();
	assign.mockReset();
	sessionStorage.clear();
});

describe('googleLogin', () => {
	it('is available only when both Google settings are there', async () => {
		const api = 'http://api.test/auth/google/callback';

		expect((await loadWith('client-1', api)).isGoogleLoginAvailable).toBe(true);
		expect((await loadWith('', api)).isGoogleLoginAvailable).toBe(false);
		expect((await loadWith('client-1', '')).isGoogleLoginAvailable).toBe(false);
	});

	it("sends the visitor to Google with the app's settings", async () => {
		const { startGoogleLogin } = await loadWith(
			'client-1',
			'http://api.test/auth/google/callback'
		);

		expect(startGoogleLogin()).toBe(true);

		expect(assign).toHaveBeenCalledOnce();
		const url = new URL(assign.mock.calls[0][0]);
		expect(url.origin + url.pathname).toBe(
			'https://accounts.google.com/o/oauth2/v2/auth'
		);
		expect(Object.fromEntries(url.searchParams)).toMatchObject({
			client_id: 'client-1',
			// Google returns to the backend, which then returns to the app
			redirect_uri: 'http://api.test/auth/google/callback',
			response_type: 'code',
			scope: 'openid email profile',
			prompt: 'select_account',
		});
	});

	it('saves a new state each time, starting with the app id', async () => {
		const { startGoogleLogin } = await loadWith('client-1', 'http://api.test');

		startGoogleLogin();
		const first = sessionStorage.getItem(GOOGLE_OAUTH_STATE);
		startGoogleLogin();
		const second = sessionStorage.getItem(GOOGLE_OAUTH_STATE);

		// the backend reads the part before the dot to know which app to
		// return to; the rest is random, so nobody else can forge a return
		expect(first).toMatch(new RegExp(`^${APP_ID}\\.[0-9a-f-]{36}$`));
		expect(second).not.toBe(first);
		// Google gets the same value the return page will compare with
		expect(new URL(assign.mock.calls[1][0]).searchParams.get('state')).toBe(
			second
		);
	});

	it("stays on the page when the state can't be saved", async () => {
		const { startGoogleLogin } = await loadWith('client-1', 'http://api.test');
		vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
			throw new DOMException('The operation is insecure.', 'SecurityError');
		});

		// without the saved state the return page would refuse the sign-in
		expect(startGoogleLogin()).toBe(false);
		expect(assign).not.toHaveBeenCalled();
	});

	it('saves the page to come back to, and only that one', async () => {
		const { startGoogleLogin } = await loadWith('client-1', 'http://api.test');

		startGoogleLogin('/somewhere?x=1');
		expect(sessionStorage.getItem(GOOGLE_OAUTH_RETURN_TO)).toBe(
			'/somewhere?x=1'
		);

		// a later sign-in started without one doesn't inherit it
		startGoogleLogin();
		expect(sessionStorage.getItem(GOOGLE_OAUTH_RETURN_TO)).toBeNull();
	});
});

describe('readGoogleReturn', () => {
	/**
	 * Saves what `startGoogleLogin` would have, then reads a return.
	 *
	 * @param query - The return address's query string.
	 * @param saved - The state and return page this tab saved, if any.
	 * @returns What `readGoogleReturn` decided.
	 */
	async function readReturn(
		query: string,
		saved: { state?: string; returnTo?: string } = {}
	) {
		const { readGoogleReturn } = await loadWith('client-1', 'http://api.test');
		if (saved.state) sessionStorage.setItem(GOOGLE_OAUTH_STATE, saved.state);
		if (saved.returnTo) {
			sessionStorage.setItem(GOOGLE_OAUTH_RETURN_TO, saved.returnTo);
		}
		return readGoogleReturn(new URLSearchParams(query));
	}

	const saved = { state: 'type.abc', returnTo: '/somewhere' };

	it('is ready with the code when the state matches', async () => {
		expect(await readReturn('loginCode=c1&state=type.abc', saved)).toEqual({
			outcome: 'ready',
			loginCode: 'c1',
			returnTo: '/somewhere',
		});
	});

	it('works once: what was saved is removed', async () => {
		await readReturn('loginCode=c1&state=type.abc', saved);

		expect(sessionStorage.getItem(GOOGLE_OAUTH_STATE)).toBeNull();
		expect(sessionStorage.getItem(GOOGLE_OAUTH_RETURN_TO)).toBeNull();
	});

	it.each([
		['the backend says so', 'error=access_denied&cancelled=true'],
		['Google says access_denied', 'error=access_denied'],
	])('reports a cancelled sign-in when %s', async (_label, query) => {
		expect(await readReturn(query, saved)).toEqual({
			outcome: 'cancelled',
			returnTo: '/somewhere',
		});
	});

	it.each([
		[
			'Google reports another error',
			'error=server_error&cancelled=false',
			saved,
			'failed',
		],
		[
			'the state differs',
			'loginCode=c1&state=type.other',
			saved,
			'stateInvalid',
		],
		[
			'this tab saved no state (started elsewhere)',
			'loginCode=c1&state=type.abc',
			{},
			'stateInvalid',
		],
		['there is no code', 'state=type.abc', saved, 'failed'],
	])('refuses when %s', async (_label, query, savedNow, problem) => {
		expect(await readReturn(query, savedNow)).toMatchObject({
			outcome: 'refused',
			problem,
		});
	});

	it('refuses when storage is blocked', async () => {
		vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
			throw new DOMException('The operation is insecure.', 'SecurityError');
		});

		expect(await readReturn('loginCode=c1&state=type.abc')).toEqual({
			outcome: 'refused',
			problem: 'stateInvalid',
			returnTo: null,
		});
	});
});

describe('googleProblemFromError', () => {
	it('names what went wrong with the code exchange', async () => {
		const { googleProblemFromError } = await loadWith('c', 'http://api.test');
		// the class from the same fresh copy of the modules
		const { ApiError } = await import('@/api/authApi');

		expect(googleProblemFromError(new ApiError(429, 'x'))).toBe('rateLimited');
		expect(googleProblemFromError(new TypeError('Failed to fetch'))).toBe(
			'network'
		);
		expect(googleProblemFromError(new ApiError(401, 'expired'))).toBe('failed');
		expect(googleProblemFromError(new Error('no user'))).toBe('failed');
	});
});
