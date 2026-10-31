import { afterEach, describe, expect, it, vi } from 'vitest';

import {
	ApiError,
	postLogin,
	postLogout,
	postRefreshToken,
	postRegister,
} from '@/api/authApi';
import { API_URL } from '@/config/config';

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
 * Replaces fetch with a stub that answers once.
 *
 * @param response - What the stub answers.
 * @returns The stub, to check how it was called.
 */
function stubFetch(response: Response) {
	return vi.spyOn(globalThis, 'fetch').mockResolvedValue(response);
}

const user = { id: 'u1', email: 'cat@example.com' };

afterEach(() => {
	vi.restoreAllMocks();
});

describe('authApi', () => {
	it('posts JSON with the session cookies and returns the body', async () => {
		const fetchStub = stubFetch(jsonResponse({ user }, 200));

		const result = await postLogin({ email: user.email, password: 'pw' });

		expect(result).toEqual({ user });
		expect(fetchStub).toHaveBeenCalledWith(`${API_URL}/auth/user/login`, {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email: user.email, password: 'pw' }),
		});
	});

	it('sends no body for endpoints that take none', async () => {
		const fetchStub = stubFetch(jsonResponse({ user }, 200));

		await postRefreshToken();

		expect(fetchStub).toHaveBeenCalledWith(`${API_URL}/auth/user/refresh`, {
			method: 'POST',
			credentials: 'include',
		});
	});

	it("throws an ApiError with the status and the server's error text", async () => {
		stubFetch(jsonResponse({ error: 'Email already in use' }, 409));

		const error = await postRegister({ email: user.email, password: 'pw' })
			// hand the rejection back as a value, so it can be inspected
			.catch((caught: unknown) => caught);

		expect(error).toBeInstanceOf(ApiError);
		expect(error).toMatchObject({
			status: 409,
			message: 'Email already in use',
		});
	});

	it('names the status when the error body is not JSON', async () => {
		stubFetch(new Response('<html>Bad gateway</html>', { status: 502 }));

		await expect(postRefreshToken()).rejects.toMatchObject({
			status: 502,
			message: 'HTTP 502',
		});
	});

	it("passes fetch's own error through when the server can't be reached", async () => {
		vi.spyOn(globalThis, 'fetch').mockRejectedValue(
			new TypeError('Failed to fetch')
		);

		await expect(postLogout()).rejects.toThrow(TypeError);
	});
});
