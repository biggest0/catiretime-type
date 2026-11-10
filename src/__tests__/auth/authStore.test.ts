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

/**
 * Stubs `fetch` so the refresh call hangs, like a slow server, until the
 * test answers it. Every other call is answered at once.
 *
 * @param otherAnswer - Builds the answer for every call but the refresh.
 * @returns `calls`, the paths requested so far, in order, and
 *   `answerRefresh`, which answers the hanging refresh.
 */
function holdRefresh(otherAnswer: () => Response) {
	const calls: string[] = [];
	let resolveRefresh: (response: Response) => void = () => {};

	vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
		const path = new URL(String(input)).pathname;
		calls.push(path);
		if (path === '/auth/user/refresh') {
			return new Promise<Response>((resolve) => {
				resolveRefresh = resolve;
			});
		}
		return Promise.resolve(otherAnswer());
	});

	return {
		calls,
		answerRefresh: (response: Response) => resolveRefresh(response),
	};
}

/** Lets everything that can run now run, before the test looks. */
function settle(): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, 0));
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

describe('authStore: sign-in and sign-out wait for a refresh on its way', () => {
	it('keeps a sign-in made while the startup check is still out', async () => {
		const authStore = await loadStore();
		const { calls, answerRefresh } = holdRefresh(() =>
			jsonResponse({ user }, 200)
		);

		const startup = authStore.bootstrap();
		const login = authStore.login(user.email, 'pw');
		await settle();
		// the login isn't sent while the check is out
		expect(calls).toEqual(['/auth/user/refresh']);

		// the check was sent before the sign-in, so the server refuses it. If
		// this answer came after the login's, it would sign the visitor out
		answerRefresh(jsonResponse({ error: 'Refresh token is required' }, 401));
		await Promise.all([startup, login]);

		expect(calls).toEqual(['/auth/user/refresh', '/auth/user/login']);
		expect(authStore.getState()).toMatchObject({ user, isAuthenticated: true });
		expect(JSON.parse(localStorage.getItem(AUTH_USER)!)).toEqual(user);
	});

	it('stays signed out when a refresh was on its way at sign-out', async () => {
		saveUser(user);
		const authStore = await loadStore();
		const { calls, answerRefresh } = holdRefresh(() =>
			jsonResponse({ message: 'Logged out successfully' }, 200)
		);

		const refreshing = authStore.refresh();
		const logout = authStore.logout();
		await settle();
		// the sign-out isn't sent while the refresh is out
		expect(calls).toEqual(['/auth/user/refresh']);

		// the refresh succeeds. If this answer came after the sign-out's, it
		// would sign the visitor back in
		answerRefresh(jsonResponse({ user }, 200));
		await Promise.all([refreshing, logout]);

		expect(calls).toEqual(['/auth/user/refresh', '/auth/user/logout']);
		expect(authStore.getState()).toMatchObject({
			user: null,
			isAuthenticated: false,
		});
		expect(localStorage.getItem(AUTH_USER)).toBeNull();
	});
});
