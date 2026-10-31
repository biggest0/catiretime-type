import { afterEach, describe, expect, it, vi } from 'vitest';

import { AUTH_USER } from '@/constants/keys';

const user = { id: 'u1', email: 'cat@example.com' };

/**
 * Loads fresh copies of the auth store, the API slice and the Redux store,
 * as a page load does, and adds a test-only `ping` endpoint.
 *
 * @returns The store to dispatch to, the endpoint, and the auth store.
 */
async function setup() {
	vi.resetModules();
	const { authStore } = await import('@/auth/authStore');
	const { apiSlice } = await import('@/store/api/apiSlice');
	const { store } = await import('@/store/store');

	const api = apiSlice.injectEndpoints({
		endpoints: (build) => ({
			ping: build.query<{ ok: boolean }, void>({ query: () => '/ping' }),
		}),
	});

	return { store, ping: api.endpoints.ping, authStore };
}

/**
 * Replaces fetch with a fake server. Each path answers with the statuses
 * listed for it, in order.
 *
 * @param routes - The statuses to answer, by path.
 * @returns The stub, to check which paths were called.
 */
function fakeServer(routes: Record<string, number[]>) {
	return vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
		const url = input instanceof Request ? input.url : String(input);
		const path = new URL(url).pathname;
		const status = routes[path]?.shift() ?? 404;

		// refresh answers with the user, the test endpoint with { ok }
		let body: unknown = { error: 'Not allowed' };
		if (status === 200) {
			body = path === '/auth/user/refresh' ? { user } : { ok: true };
		}

		return new Response(JSON.stringify(body), {
			status,
			headers: { 'Content-Type': 'application/json' },
		});
	});
}

/**
 * Lists the paths the app requested, in order.
 *
 * @param fetchStub - The stub from `fakeServer()`.
 * @returns One path per request, e.g. `['/ping', '/auth/user/refresh']`.
 */
function requestedPaths(fetchStub: ReturnType<typeof fakeServer>): string[] {
	return fetchStub.mock.calls.map(([input]) => {
		const url = input instanceof Request ? input.url : String(input);
		return new URL(url).pathname;
	});
}

afterEach(() => {
	vi.restoreAllMocks();
	localStorage.clear();
});

describe('apiSlice re-authorization', () => {
	it('refreshes once and retries after a 401 for a signed-in visitor', async () => {
		localStorage.setItem(AUTH_USER, JSON.stringify(user));
		const { store, ping } = await setup();
		const fetchStub = fakeServer({
			'/ping': [401, 200],
			'/auth/user/refresh': [200],
		});

		const result = await store.dispatch(ping.initiate());

		expect(result.data).toEqual({ ok: true });
		expect(requestedPaths(fetchStub)).toEqual([
			'/ping',
			'/auth/user/refresh',
			'/ping',
		]);
	});

	it('returns a 401 without refreshing for a visitor who is not signed in', async () => {
		const { store, ping } = await setup();
		const fetchStub = fakeServer({ '/ping': [401] });

		const result = await store.dispatch(ping.initiate());

		expect(result.error).toMatchObject({ status: 401 });
		expect(requestedPaths(fetchStub)).toEqual(['/ping']);
	});

	it('returns the 401 and signs out when the refresh is refused', async () => {
		localStorage.setItem(AUTH_USER, JSON.stringify(user));
		const { store, ping, authStore } = await setup();
		const fetchStub = fakeServer({
			'/ping': [401],
			'/auth/user/refresh': [401],
		});

		const result = await store.dispatch(ping.initiate());

		expect(result.error).toMatchObject({ status: 401 });
		expect(requestedPaths(fetchStub)).toEqual(['/ping', '/auth/user/refresh']);
		expect(authStore.getState().isAuthenticated).toBe(false);
	});
});
