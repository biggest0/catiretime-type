import { API_URL } from '@/config/config';
import type { AuthResponse, Credentials } from '@/types/authTypes';

/**
 * Thrown when an auth endpoint answers with an error status. `status` tells
 * callers what kind of failure it was (401, 409, 429…); `message` is the
 * server's own error text.
 */
export class ApiError extends Error {
	readonly status: number;

	/**
	 * @param status - The HTTP status of the failed response.
	 * @param message - The server's error text, or a fallback naming the status.
	 */
	constructor(status: number, message: string) {
		super(message);
		this.name = 'ApiError';
		this.status = status;
	}
}

/**
 * Picks the server's error text out of a failed response's body.
 *
 * @param payload - The parsed body, or null when it wasn't JSON.
 * @returns The body's `error` string, or undefined when it has none.
 */
function errorText(payload: unknown): string | undefined {
	if (
		typeof payload === 'object' &&
		payload !== null &&
		'error' in payload &&
		typeof payload.error === 'string'
	) {
		return payload.error;
	}
	return undefined;
}

/**
 * Posts to an auth endpoint with the session cookies attached.
 *
 * @param path - The endpoint's path under API_URL, e.g. '/auth/user/login'.
 * @param body - The JSON body to send; omit it for endpoints that take none.
 * @returns The parsed JSON response.
 * @throws ApiError when the server answers with an error status. When the
 * server can't be reached, fetch's own TypeError comes through instead.
 */
async function post<T>(path: string, body?: unknown): Promise<T> {
	// the session cookies belong to the API's origin, so cross-origin calls
	// only send and accept them with credentials: 'include'
	const init: RequestInit = { method: 'POST', credentials: 'include' };
	if (body !== undefined) {
		init.headers = { 'Content-Type': 'application/json' };
		init.body = JSON.stringify(body);
	}

	const response = await fetch(`${API_URL}${path}`, init);

	// failures come as { error }; a body that isn't JSON (a proxy's error
	// page) falls back to naming the status
	if (!response.ok) {
		const payload: unknown = await response.json().catch(() => null);
		throw new ApiError(
			response.status,
			errorText(payload) ?? `HTTP ${response.status}`
		);
	}

	return (await response.json()) as T;
}

/**
 * Creates an account and signs it in. It stays unverified until the emailed
 * link is opened.
 *
 * @param credentials - The new account's email and password.
 * @returns The new user.
 * @throws ApiError 400 for an invalid email or password, 409 when the email
 * already has an account.
 */
export function postRegister(credentials: Credentials): Promise<AuthResponse> {
	return post<AuthResponse>('/auth/user/register', credentials);
}

/**
 * Signs in with email and password.
 *
 * @param credentials - The account's email and password.
 * @returns The signed-in user.
 * @throws ApiError 401 for a wrong email or password.
 */
export function postLogin(credentials: Credentials): Promise<AuthResponse> {
	return post<AuthResponse>('/auth/user/login', credentials);
}

/**
 * Swaps the refresh cookie for a fresh pair of session cookies.
 *
 * @returns The user the session belongs to.
 * @throws ApiError 401 when there's no valid session.
 */
export function postRefreshToken(): Promise<AuthResponse> {
	return post<AuthResponse>('/auth/user/refresh');
}

/**
 * Finishes a Google sign-in: trades the one-time code from the return URL
 * for session cookies.
 *
 * @param loginCode - The code from the return URL; single use, short-lived.
 * @returns The signed-in user.
 * @throws ApiError 401 for an invalid or expired code, 429 after too many
 * attempts.
 */
export function postGoogleExchange(loginCode: string): Promise<AuthResponse> {
	return post<AuthResponse>('/auth/user/google/exchange', { loginCode });
}

/** Ends the session on the server, which also clears its cookies. */
export async function postLogout(): Promise<void> {
	await post<unknown>('/auth/user/logout');
}
