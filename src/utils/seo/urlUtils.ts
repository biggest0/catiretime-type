import { SITE_URL } from '@/config/config';

/**
 * Normalises a router pathname to the canonical form every Çatire app uses:
 * a leading slash, exactly one trailing slash, and no query string or hash.
 * Canonical tags (and a sitemap, if the app gets one) all use this form, so
 * they never disagree about which address is the real one.
 *
 * @param pathname - The path, e.g. `/about`, `/about/` or `/search?q=cats`.
 * @returns The canonical path, e.g. `/about/`; the home page stays `/`.
 */
export function canonicalPath(pathname: string): string {
	const bare = pathname
		.split(/[?#]/)[0]
		.replace(/\/+$/, '')
		.replace(/^\/*/, '/');
	return bare === '/' ? '/' : `${bare}/`;
}

/**
 * The full canonical URL of a route.
 *
 * @param pathname - The path, with or without a trailing slash.
 * @returns `SITE_URL` plus the canonical path, e.g. `<SITE_URL>/about/`.
 */
export function absoluteUrl(pathname: string): string {
	return `${SITE_URL}${canonicalPath(pathname)}`;
}
