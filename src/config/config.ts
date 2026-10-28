/**
 * Backend origin from VITE_API_URL, no trailing slash. The fallback covers
 * runs without an env file (tests, CI builds).
 */
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * App version, injected at build time from package.json (vite `define`), so
 * package.json stays the single source of truth. The fallback covers any
 * context where the define isn't applied.
 */
declare const __APP_VERSION__: string | undefined;
export const APP_VERSION = `v${typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.0.0-dev'}`;

/**
 * Public origin of the site, injected at build time from package.json
 * `homepage` (vite `define`). No trailing slash.
 */
declare const __SITE_URL__: string | undefined;
export const SITE_URL: string =
	typeof __SITE_URL__ !== 'undefined'
		? __SITE_URL__
		: 'https://type.catiretime.com';
