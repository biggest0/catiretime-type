import type { TFunction } from 'i18next';

import { ApiError } from '@/api/authApi';

/**
 * The backend's error codes this app has a message for, and that message.
 * A code never changes meaning, so matching it is safe; the server's English
 * text isn't. Several codes can share a message.
 *
 * Here: the codes every app on the backend can get, and the sign-in ones.
 * The register, email-verification and password-reset codes come with their
 * pages. Left out on purpose: a refused origin (the browser hides that
 * answer, so fetch fails first), the session codes (the session store acts
 * on the status), and the Google one-time code (its page names its own
 * problems).
 */
const CODE_MESSAGES = {
	INVALID_CREDENTIALS: 'AUTH.INVALID_CREDENTIALS',
	EMAIL_IN_USE: 'AUTH.EMAIL_IN_USE',
	RATE_LIMITED: 'AUTH.RATE_LIMITED',
	INTERNAL_ERROR: 'AUTH.SERVER_ERROR',
	// the server couldn't use what the app sent: our mistake, not the visitor's
	ROUTE_NOT_FOUND: 'AUTH.SERVER_ERROR',
	INVALID_JSON: 'AUTH.SERVER_ERROR',
	PAYLOAD_TOO_LARGE: 'AUTH.SERVER_ERROR',
} as const;

/** A code `CODE_MESSAGES` has a message for. */
type KnownCode = keyof typeof CODE_MESSAGES;

/**
 * Checks that a code from the server is one the app has a message for.
 *
 * @param code - The answer's code, or null when it had none.
 * @returns `true` for one of `CODE_MESSAGES`' own names; `false` for any
 *   other, even a name every object has (`toString`).
 */
function isKnownCode(code: string | null): code is KnownCode {
	return code !== null && Object.hasOwn(CODE_MESSAGES, code);
}

/**
 * Turns whatever an auth call threw into a message for the visitor, in the
 * UI language. Pages show the result in `FormError`; they never show an
 * error's own text or test its wording.
 *
 * A refusal is read in order: its code, when the app knows it; else its
 * status (an answer from a server older than the codes, or with a code
 * newer than this app); else the server's own text, which says what to fix,
 * though in English only.
 *
 * @param t - The translate function from `useTranslation()`.
 * @param error - What was caught.
 * @param flow - Which form failed. For an answer without a known code, only
 *   on `'login'` does a 401 mean "wrong email or password"; elsewhere
 *   (default `'other'`) it's about a code or a link, and the server's text
 *   says which.
 * @returns The message, e.g. "Wrong email or password."
 */
export function authErrorMessage(
	t: TFunction,
	error: unknown,
	flow: 'login' | 'other' = 'other'
): string {
	// the server answered with an error status
	if (error instanceof ApiError) {
		// its code names the problem exactly
		if (isKnownCode(error.code)) return t(CODE_MESSAGES[error.code]);

		// no code the app knows: the status says what kind of problem it is
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
