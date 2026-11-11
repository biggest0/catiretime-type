import { describe, expect, it } from 'vitest';

import { SITE_NAME } from '@/constants/site';
import en from '@/i18n/en/common.json';
import fr from '@/i18n/fr/common.json';
// the real package.json: its `homepage` is the app's public address
import packageJson from '@/../package.json';

// An app built from this one changes a handful of values: its name, its
// address and the wording that describes it. A test that types one of them
// out ("Typing practice") breaks for that app, though nothing is wrong with
// it. Tests read these values from where they live instead; this test fails
// when one has been typed into a test file.

/** Every unit and end-to-end test file, as text, by path. */
const testFiles = import.meta.glob<string>(
	['/src/__tests__/**/*.{ts,tsx}', '/e2e/**/*.ts'],
	{ query: '?raw', import: 'default', eager: true }
);

/**
 * The fixed part of a translation: its text up to the first `{{variable}}`.
 *
 * @param text - A translation, e.g. `Typing practice by {{parentSite}}`.
 * @returns The text before the variable, e.g. `Typing practice by`.
 */
function fixedPart(text: string): string {
	return text.split('{{')[0].trim();
}

/** The values an app of its own changes, and where each one lives. */
const appValues = [
	{ value: SITE_NAME, source: 'SITE_NAME in src/constants/site.ts' },
	{
		value: new URL(packageJson.homepage).host,
		source: 'homepage in package.json (SITE_URL in src/config/config.ts)',
	},
	{ value: en.SEO.HOME.TITLE, source: 'SEO.HOME.TITLE in en/common.json' },
	{ value: fr.SEO.HOME.TITLE, source: 'SEO.HOME.TITLE in fr/common.json' },
	{
		value: en.SEO.HOME.DESCRIPTION,
		source: 'SEO.HOME.DESCRIPTION in en/common.json',
	},
	{
		value: fr.SEO.HOME.DESCRIPTION,
		source: 'SEO.HOME.DESCRIPTION in fr/common.json',
	},
	{
		value: fixedPart(en.FOOTER.BRAND_TAGLINE),
		source: 'FOOTER.BRAND_TAGLINE in en/common.json',
	},
	{
		value: fixedPart(fr.FOOTER.BRAND_TAGLINE),
		source: 'FOOTER.BRAND_TAGLINE in fr/common.json',
	},
];

describe("the app's own values", () => {
	it('finds the test files to check', () => {
		// a wrong pattern would find nothing and let anything pass
		expect(Object.keys(testFiles).length).toBeGreaterThan(30);
		expect(Object.keys(testFiles)).toContain('/e2e/smoke.spec.ts');
	});

	it('are never typed out in a test: tests import them', () => {
		// each entry says which file holds which value, and where to read it
		const typedOut = Object.entries(testFiles).flatMap(([path, text]) =>
			appValues
				.filter(({ value }) => text.includes(value))
				.map(({ value, source }) => `${path}: "${value}" (use ${source})`)
		);

		expect(typedOut).toEqual([]);
	});
});
