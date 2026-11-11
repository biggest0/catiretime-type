/**
 * The languages the UI supports, in the order the language menus list them.
 * Each name is written in its own language, so it reads the same whatever
 * the UI language: a visitor who can't read the current one still finds
 * theirs. `config.ts` takes `supportedLngs` from this list.
 *
 * `ogLocale` is the language and country that link previews are tagged with
 * (Open Graph's `language_TERRITORY` form); `PageMeta` reads it.
 *
 * To add a language: add it here, add its `<code>/common.json`, load that
 * file in `config.ts`'s `resources`, and add its `og:locale:alternate` tag
 * to index.html (tests check all three).
 */
export const LANGUAGES = [
	{ code: 'en', name: 'English', ogLocale: 'en_CA' },
	{ code: 'fr', name: 'Français', ogLocale: 'fr_CA' },
] as const;
