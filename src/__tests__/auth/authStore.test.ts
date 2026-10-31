import { afterEach, describe, expect, it, vi } from 'vitest';

import { AUTH_USER } from '@/constants/keys';

const user = { id: 'u1', email: 'cat@example.com' };

/**
 * Loads a fresh copy of the store, as a page load does: it reads the saved
 * user when its file first runs.
 *
 * @returns The new copy's `authStore`.
 */
async function loadStore() {
	vi.resetModules();
	const { authStore } = await import('@/auth/authStore');
	return authStore;
}

/**
 * Builds a JSON response, as the backend sends.
 *
 * @param body - The response body.
 * @param status - The HTTP status.
 * @returns A Response for the fetch stub to return.
 */
function jsonResponse(body: unknown, status: number): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'Content-Type': 'application/json' },
	});
}

/**
 * Saves a user the way a sign-in on an earlier visit would have.
 *
 * @param value - What to save under `AUTH_USER`.
 */
function saveUser(value: unknown) {
	localStorage.setItem(AUTH_USER, JSON.stringify(value));
}

afterEach(() => {
	vi.restoreAllMocks();
	localStorage.clear();
});

describe('authStore on load', () => {
	it('starts signed out and loading when nothing is saved', async () => {
		const authStore = await loadStore();

		expect(authStore.getState()).toEqual({
			user: null,
			isAuthenticated: false,
			isLoading: true,
		});
	});

	it('starts from the saved user', async () => {
		saveUser(user);

		const authStore = await loadStore();

		expect(authStore.getState()).toMatchObject({ user, isAuthenticated: true });
	});

	it.each([
		['a user without an id', JSON.stringify({ email: user.email })],
		['corrupt JSON', '{not json'],
	])('ignores a saved value that is %s', async (_label, raw) => {
		localStorage.setItem(AUTH_USER, raw);

		const authStore = await loadStore();

		expect(authStore.getState().isAuthenticated).toBe(false);
	});
});

describe('authStore sign-in and sign-out', () => {
	it('saves the user on login and tells subscribers', async () => {
		const authStore = await loadStore();
		const listener = vi.fn();
		authStore.subscribe(listener);
		vi.spyOn(globalThis, 'fetch').mockResolvedValue(
			jsonResponse({ user }, 200)
		);

		await authStore.login(user.email, 'pw');

		expect(authStore.getState()).toMatchObject({ user, isAuthenticated: true });
		expect(JSON.parse(localStorage.getItem(AUTH_USER)!)).toEqual(user);
		expect(listener).toHaveBeenCalled();
	});

	it('signs out even when the server call fails', async () => {
		saveUser(user);
		const authStore = await loadStore();
		vi.spyOn(globalThis, 'fetch').mockRejectedValue(
			new TypeError('Failed to fetch')
		);

		await authStore.logout();

		expect(authStore.getState()).toMatchObject({
			user: null,
			isAuthenticated: false,
		});
		expect(localStorage.getItem(AUTH_USER)).toBeNull();
	});

	it('keeps the same state object until something changes', async () => {
		// useSyncExternalStore re-renders whenever this object changes, and
		// loops forever if it changes on every read
		const authStore = await loadStore();

		expect(authStore.getState()).toBe(authStore.getState());
	});
});

describe('authStore.refresh', () => {
	it('makes one request when asked twice at once', async () => {
		const authStore = await loadStore();
		const fetchStub = vi
			.spyOn(globalThis, 'fetch')
			.mockResolvedValue(jsonResponse({ user }, 200));

		const results = await Promise.all([
			authStore.refresh(),
			authStore.refresh(),
		]);

		expect(results).toEqual([true, true]);
		expect(fetchStub).toHaveBeenCalledTimes(1);
	});

	it('signs out when the server says there is no session (401)', async () => {
		saveUser(user);
		const authStore = await loadStore();
		vi.spyOn(globalThis, 'fetch').mockResolvedValue(
			jsonResponse({ error: 'Refresh token expired' }, 401)
		);

		expect(await authStore.refresh()).toBe(false);
		expect(authStore.getState().isAuthenticated).toBe(false);
		expect(localStorage.getItem(AUTH_USER)).toBeNull();
	});

	it.each([
		['the server is unreachable', () => Promise.reject(new TypeError('x'))],
		[
			'the server fails (500)',
			() => Promise.resolve(jsonResponse({ error: 'Unexpected' }, 500)),
		],
	])('stays signed in when %s', async (_label, answer) => {
		saveUser(user);
		const authStore = await loadStore();
		vi.spyOn(globalThis, 'fetch').mockImplementation(answer);

		expect(await authStore.refresh()).toBe(false);
		expect(authStore.getState()).toMatchObject({ user, isAuthenticated: true });
		expect(localStorage.getItem(AUTH_USER)).not.toBeNull();
	});
});

describe('authStore.bootstrap', () => {
	it('takes the user from the server, then stops loading', async () => {
		const authStore = await loadStore();
		vi.spyOn(globalThis, 'fetch').mockResolvedValue(
			jsonResponse({ user }, 200)
		);

		await authStore.bootstrap();

		expect(authStore.getState()).toEqual({
			user,
			isAuthenticated: true,
			isLoading: false,
		});
	});

	it('stops loading when there is no session', async () => {
		saveUser(user);
		const authStore = await loadStore();
		vi.spyOn(globalThis, 'fetch').mockResolvedValue(
			jsonResponse({ error: 'Refresh token is required' }, 401)
		);

		await authStore.bootstrap();

		expect(authStore.getState()).toEqual({
			user: null,
			isAuthenticated: false,
			isLoading: false,
		});
	});
});
