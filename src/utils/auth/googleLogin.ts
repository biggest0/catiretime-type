import { GOOGLE_CLIENT_ID, GOOGLE_REDIRECT_URI } from '@/config/config';
import { GOOGLE_OAUTH_STATE } from '@/constants/keys';
import { APP_ID } from '@/constants/site';

/** Where Google's sign-in starts. */
const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

/**
 * Whether this build can offer Google sign-in: both settings come from the
 * env file. Pages hide the button when it's false.
 */
export const isGoogleLoginAvailable =
	GOOGLE_CLIENT_ID !== '' && GOOGLE_REDIRECT_URI !== '';

/**
 * Starts a Google sign-in: saves a new `state` for this tab, then sends the
 * browser to Google. Google returns to the backend, which returns to this
 * app's Google return page with a one-time code and the same `state`.
 *
 * The state is `<APP_ID>.<random>`. The random part proves on return that
 * the sign-in was started here (the return page compares the whole value);
 * the backend reads the part before the dot to pick which app to return to.
 *
 * @returns `false` when the state couldn't be saved (storage blocked): the
 *   return would be refused, so the browser stays on the page. Otherwise
 *   `true`, and the page is being left.
 */
export function startGoogleLogin(): boolean {
	const state = `${APP_ID}.${crypto.randomUUID()}`;
	try {
		sessionStorage.setItem(GOOGLE_OAUTH_STATE, state);
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
