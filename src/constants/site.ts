/**
 * The app's identity. An app built from this one changes `SITE_NAME`; the
 * Çatire links (`PARENT_SITE`, `SOCIAL_PROFILES`) are shared by every app.
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

/**
 * Çatire's social profiles, shared by every Çatire app like `PARENT_SITE`.
 * `SocialMediaLinks` shows them as icon links and picks each icon by `id`.
 */
export const SOCIAL_PROFILES = [
	{
		id: 'instagram',
		label: 'Instagram',
		url: 'https://www.instagram.com/catiretime',
	},
	{ id: 'x', label: 'X', url: 'https://x.com/catiretime' },
	{
		id: 'youtube',
		label: 'YouTube',
		url: 'https://www.youtube.com/@catiretime',
	},
] as const;

/** The `id` of a profile in `SOCIAL_PROFILES`. */
export type SocialProfileId = (typeof SOCIAL_PROFILES)[number]['id'];
