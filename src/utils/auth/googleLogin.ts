import type { TFunction } from 'i18next';

import { ApiError } from '@/api/authApi';
import { GOOGLE_CLIENT_ID, GOOGLE_REDIRECT_URI } from '@/config/config';
import { GOOGLE_OAUTH_RETURN_TO, GOOGLE_OAUTH_STATE } from '@/constants/keys';
import { APP_ID } from '@/constants/site';

/** Where Google's sign-in starts. */
const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

/**
 * Whether this build can offer Google sign-in: both settings come from the
 * env file. Pages hide the button when it's false.
 */
export const isGoogleLoginAvailable =
	GOOGLE_CLIENT_ID !== '' && GOOGLE_REDIRECT_URI !== '';

/** Why a Google sign-in ended back on the login page, and its message. */
const PROBLEM_MESSAGES = {
	failed: 'AUTH.GOOGLE_FAILED',
	// the return wasn't started in this tab (or was forged)
	stateInvalid: 'AUTH.GOOGLE_STATE_INVALID',
	rateLimited: 'AUTH.RATE_LIMITED',
	network: 'AUTH.NETWORK_ERROR',
} as const;

/** Why a Google sign-in ended back on the login page. */
export type GoogleLoginProblem = keyof typeof PROBLEM_MESSAGES;

/**
 * Checks a value read from outside (navigation state) is a known problem.
 *
 * @param value - The value to check.
 * @returns `true` for one of `GoogleLoginProblem`'s names.
 */
export function isGoogleLoginProblem(
	value: unknown
): value is GoogleLoginProblem {
	return typeof value === 'string' && Object.hasOwn(PROBLEM_MESSAGES, value);
}

/**
 * The message for a Google sign-in that came back without signing in.
 *
 * @param t - The translate function from `useTranslation()`.
 * @param problem - What went wrong.
 * @returns The message, in the UI language.
 */
export function googleProblemMessage(
	t: TFunction,
	problem: GoogleLoginProblem
): string {
	return t(PROBLEM_MESSAGES[problem]);
}

/**
 * Starts a Google sign-in: saves a new `state` for this tab, and the page to
 * come back to, then sends the browser to Google. Google returns to the
 * backend, which returns to this app's Google return page with a one-time
 * code and the same `state`.
 *
 * The state is `<APP_ID>.<random>`. The random part proves on return that
 * the sign-in was started here (the return page compares the whole value);
 * the backend reads the part before the dot to pick which app to return to.
 *
 * @param returnTo - The page the visitor logged in from, if any. Checked
 *   again on return (`destinationAfterLogin`), so it's saved as given.
 * @returns `false` when the state couldn't be saved (storage blocked): the
 *   return would be refused, so the browser stays on the page. Otherwise
 *   `true`, and the page is being left.
 */
export function startGoogleLogin(returnTo?: string): boolean {
	const state = `${APP_ID}.${crypto.randomUUID()}`;
	try {
		sessionStorage.setItem(GOOGLE_OAUTH_STATE, state);
		// removed when there's none, so an earlier sign-in's page isn't used
		if (returnTo) sessionStorage.setItem(GOOGLE_OAUTH_RETURN_TO, returnTo);
		else sessionStorage.removeItem(GOOGLE_OAUTH_RETURN_TO);
	} catch {
		return false;
	}

	const params = new URLSearchParams({
		client_id: GOOGLE_CLIENT_ID,
		redirect_uri: GOOGLE_REDIRECT_URI,
		response_type: 'code',
		scope: 'openid email profile',
		access_type: 'online',
		// always ask which Google account, even with one signed in
		prompt: 'select_account',
		state,
	});
	window.location.assign(`${GOOGLE_AUTH_URL}?${params.toString()}`);
	return true;
}

/** What a return from Google allows, with the page to come back to. */
export type GoogleReturn =
	| { outcome: 'ready'; loginCode: string; returnTo: string | null }
	| { outcome: 'cancelled'; returnTo: string | null }
	| {
			outcome: 'refused';
			problem: GoogleLoginProblem;
			returnTo: string | null;
	  };

/**
 * Reads the address the backend returned the visitor to, and checks it
 * against what this tab saved when the sign-in started. What was saved is
 * removed: a state is good for one return.
 *
 * @param params - The return address's query: `loginCode` and `state`, or
 *   `error` (and `cancelled`).
 * @returns `ready` with the one-time code; `cancelled` when the visitor
 *   backed out at Google; or `refused` with the reason: Google reported an
 *   error (`failed`), the state isn't the one this tab saved
 *   (`stateInvalid`), or there's no code (`failed`).
 */
export function readGoogleReturn(params: URLSearchParams): GoogleReturn {
	let savedState: string | null = null;
	let returnTo: string | null = null;
	try {
		savedState = sessionStorage.getItem(GOOGLE_OAUTH_STATE);
		returnTo = sessionStorage.getItem(GOOGLE_OAUTH_RETURN_TO);
		sessionStorage.removeItem(GOOGLE_OAUTH_STATE);
		sessionStorage.removeItem(GOOGLE_OAUTH_RETURN_TO);
	} catch {
		// blocked storage: nothing saved, so the state check below refuses
	}

	if (params.has('error')) {
		const cancelled =
			params.get('cancelled') === 'true' ||
			params.get('error') === 'access_denied';
		return cancelled
			? { outcome: 'cancelled', returnTo }
			: { outcome: 'refused', problem: 'failed', returnTo };
	}

	// The CSRF check: only a sign-in this tab started may finish here
	if (!savedState || params.get('state') !== savedState) {
		return { outcome: 'refused', problem: 'stateInvalid', returnTo };
	}

	const loginCode = params.get('loginCode');
	if (!loginCode) return { outcome: 'refused', problem: 'failed', returnTo };

	return { outcome: 'ready', loginCode, returnTo };
}

/**
 * Names what went wrong when the one-time code was exchanged.
 *
 * @param error - What `loginWithGoogle` threw.
 * @returns `rateLimited` (429), `network` (fetch itself failed), or
 *   `failed` for anything else: an expired code, a server error.
 */
export function googleProblemFromError(error: unknown): GoogleLoginProblem {
	if (error instanceof ApiError && error.status === 429) return 'rateLimited';
	if (error instanceof TypeError) return 'network';
	return 'failed';
}
