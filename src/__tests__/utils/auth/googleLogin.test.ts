import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GOOGLE_OAUTH_STATE } from '@/constants/keys';
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
});
