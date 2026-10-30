/**
 * Every URL the app owns, in one place.
 *
 * Grouped by how they're used:
 *
 * - `PAGE_ROUTES` holds paths with no parameters. Safe to use directly in both
 *   `<Route path>` and `<Link to>`.
 * - `ROUTE_PATTERNS` holds paths with parameters, for `<Route path>` only.
 *   Never link to one: `<Link to={ROUTE_PATTERNS.NEW_PASSWORD}>` navigates to
 *   the literal string "/reset-password/:token".
 * - A pattern the app links to gets a `*Path()` builder that fills its
 *   parameters in, so the pattern and its links can't disagree.
 *
 * Adding a route means adding it here first, then wiring it in `App.tsx`. If
 * search engines shouldn't index it, add it to `public/robots.txt` as well.
 */

/** Paths with no parameters. Usable as-is in `<Route path>` and `<Link to>`. */
export const PAGE_ROUTES = {
	HOME: '/',
	ACCOUNT: '/account',
	LOGIN: '/login',
	REGISTER: '/register',
	RESET_PASSWORD: '/reset-password',
	// The backend's verification email and its Google sign-in redirect link to
	// these two paths, so renaming one breaks that flow.
	VERIFY_EMAIL: '/account/verification',
	GOOGLE_CALLBACK: '/auth/google/callback',
} as const;

/** Paths with parameters, for `<Route path>` only. */
export const ROUTE_PATTERNS = {
	// The backend's password-reset email links here: don't rename.
	NEW_PASSWORD: '/reset-password/:token',
} as const;
