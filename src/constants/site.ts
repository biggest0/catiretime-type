/**
 * The app's identity. An app built from this one changes these values.
 *
 * `index.html` can't import this module, so its `<title>` and `og:` tags hold
 * copies of `SITE_NAME`: change a value here, then there.
 */

/** The app's name. A brand name, so it is the same in every UI language. */
export const SITE_NAME = 'Çatire Type';

/** Çatire Time, the site this app belongs to. The footer links to it. */
export const PARENT_SITE = {
	name: 'Çatire Time',
	url: 'https://www.catiretime.com',
} as const;
