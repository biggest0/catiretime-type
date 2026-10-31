/**
 * The languages the UI supports, in the order the language menus list them.
 * Each name is written in its own language, so it reads the same whatever
 * the UI language: a visitor who can't read the current one still finds
 * theirs. `config.ts` takes `supportedLngs` from this list.
 *
 * To add a language: add it here, add its `<code>/common.json`, and load
 * that file in `config.ts`'s `resources` (a test checks the two match).
 */
export const LANGUAGES = [
	{ code: 'en', name: 'English' },
	{ code: 'fr', name: 'Français' },
] as const;
