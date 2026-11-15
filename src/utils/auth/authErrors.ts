import type { TFunction } from 'i18next';

import { ApiError } from '@/api/authApi';

/**
 * Turns whatever an auth call threw into a message for the visitor, in the
 * UI language. Pages show the result in `FormError`; they never show an
 * error's own text or test its wording.
 *
 * A refusal the app has no message for (a 400 naming the password rule that
 * failed, an expired link) keeps the server's text: it says exactly what to
 * fix, though in English only.
 *
 * @param t - The translate function from `useTranslation()`.
 * @param error - What was caught.
 * @param flow - Which form failed. Only on `'login'` does a 401 mean "wrong
 *   email or password"; elsewhere (default `'other'`) it's about a code or a
 *   link, and the server's text says which.
 * @returns The message, e.g. "Wrong email or password."
 */
export function authErrorMessage(
	t: TFunction,
	error: unknown,
	flow: 'login' | 'other' = 'other'
): string {
	// the server answered with an error status
	if (error instanceof ApiError) {
		if (error.status === 401 && flow === 'login') {
			return t('AUTH.INVALID_CREDENTIALS');
		}
		if (error.status === 409) return t('AUTH.EMAIL_IN_USE');
		if (error.status === 429) return t('AUTH.RATE_LIMITED');
		if (error.status >= 500) return t('AUTH.SERVER_ERROR');
		return error.message;
	}

	// fetch itself failed, with its TypeError: offline, the server is down,
	// or the browser blocked the request (an origin the API doesn't allow)
	if (error instanceof TypeError) return t('AUTH.NETWORK_ERROR');

	// The server did answer, with something the app can't use (no user in
	// a sign-in answer, a body that isn't JSON). Not the visitor's
	// connection, so don't send them to check it.
	return t('AUTH.SERVER_ERROR');
}
