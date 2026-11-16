import { PAGE_ROUTES } from '@/constants/routes';
import {
	isGoogleLoginProblem,
	type GoogleLoginProblem,
} from '@/utils/auth/googleLogin';
import { canonicalPath } from '@/utils/seo/urlUtils';

/**
 * Pages a visitor is never sent back to after signing in: they came
 * straight to the login page, and the Google return page would only refuse
 * a second visit.
 */
const NO_RETURN_PAGES = [PAGE_ROUTES.LOGIN, PAGE_ROUTES.GOOGLE_CALLBACK].map(
	canonicalPath
);

/**
 * What the login page reads from its navigation state. The header's login
 * link sends `from`; the Google return page sends both when it sends the
 * visitor back.
 */
export interface LoginPageState {
	/** The page the visitor logged in from: path, query and #place. */
	from?: string;
	/** Why a Google sign-in came back without signing in. */
	googleProblem?: GoogleLoginProblem;
}

/**
 * Reads the login page's navigation state, keeping only what it knows.
 *
 * @param state - `location.state`: anything a link or `navigate()` left.
 * @returns `from` as found (checked later by `destinationAfterLogin`), and
 *   `googleProblem` when it's one of the known names, else `null`.
 */
export function readLoginPageState(state: unknown): {
	from: unknown;
	googleProblem: GoogleLoginProblem | null;
} {
	const fields: Record<string, unknown> =
		typeof state === 'object' && state !== null ? { ...state } : {};
	return {
		from: fields.from,
		googleProblem: isGoogleLoginProblem(fields.googleProblem)
			? fields.googleProblem
			: null,
	};
}

/**
 * Where a visitor goes once signed in, by email or Google: back to the page
 * they logged in from. The home page when there's none, when it was the
 * login page itself (owner's rule, 2026-11-15), or when it isn't a page of
 * this app.
 *
 * "A page of this app" is decided the way the browser will read it: the
 * value is resolved against this site's address and must stay on it. A
 * simple "starts with one slash" test misses `/\host` and `/<tab>/host`,
 * which browsers read as another site.
 *
 * @param from - The page to go back to, as saved: `state.from`, or the
 *   value saved for a Google sign-in.
 * @returns A path of this app, e.g. `/search?q=cats`; or `/`.
 */
export function destinationAfterLogin(from: unknown): string {
	if (typeof from !== 'string' || from === '') return PAGE_ROUTES.HOME;

	let url: URL;
	try {
		url = new URL(from, window.location.origin);
	} catch {
		return PAGE_ROUTES.HOME;
	}
	if (url.origin !== window.location.origin) return PAGE_ROUTES.HOME;
	if (NO_RETURN_PAGES.includes(canonicalPath(url.pathname))) {
		return PAGE_ROUTES.HOME;
	}

	return `${url.pathname}${url.search}${url.hash}`;
}
