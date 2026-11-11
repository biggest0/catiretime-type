import { afterEach, describe, expect, it, vi } from 'vitest';

import { UI_LANGUAGE } from '@/constants/keys';
import i18n from '@/i18n/config';
import { LANGUAGES } from '@/i18n/languages';

describe('i18n config', () => {
	afterEach(async () => {
		vi.restoreAllMocks();
		await i18n.changeLanguage('en');
		// after the language reset, which saves 'en' again
		localStorage.clear();
	});

	it('starts in English for an English browser with nothing saved', () => {
		// jsdom's browser language is en-US
		expect(i18n.resolvedLanguage).toBe('en');
		expect(i18n.t('COMMON.CLOSE')).toBe('Close');
	});

	it('switches language and saves the choice', async () => {
		await i18n.changeLanguage('fr');

		expect(i18n.t('COMMON.CLOSE')).toBe('Fermer');
		expect(localStorage.getItem(UI_LANGUAGE)).toBe('fr');
	});

	it('maps a regional browser language such as fr-CA to French', async () => {
		vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['fr-CA']);

		// no argument: detect the language again
		await i18n.changeLanguage();

		expect(i18n.resolvedLanguage).toBe('fr');
	});

	it('keeps <html lang> in step with the language', async () => {
		await i18n.changeLanguage('fr');
		expect(document.documentElement.lang).toBe('fr');

		await i18n.changeLanguage('en');
		expect(document.documentElement.lang).toBe('en');
	});

	it('follows the language picked in another tab', async () => {
		// what the browser tells this tab when another tab saves its choice
		window.dispatchEvent(
			new StorageEvent('storage', { key: UI_LANGUAGE, newValue: 'fr' })
		);

		await vi.waitFor(() => expect(i18n.resolvedLanguage).toBe('fr'));
		expect(document.documentElement.lang).toBe('fr');
	});

	it.each([
		['another key', { key: 'appSetting', newValue: 'fr' }],
		[
			'a language the app does not support',
			{ key: UI_LANGUAGE, newValue: 'de' },
		],
		['the saved language being removed', { key: UI_LANGUAGE, newValue: null }],
	])(
		'keeps its language when another tab changes %s',
		async (_label, change) => {
			window.dispatchEvent(new StorageEvent('storage', change));

			// give a wrong language change the time to happen
			await new Promise((resolve) => setTimeout(resolve, 20));
			expect(i18n.resolvedLanguage).toBe('en');
		}
	);

	it('falls back to English for a language the app does not support', async () => {
		await i18n.changeLanguage('de');

		expect(i18n.resolvedLanguage).toBe('en');
		expect(i18n.t('COMMON.CLOSE')).toBe('Close');
	});

	it('loads a translation file for every language in LANGUAGES', () => {
		expect(Object.keys(i18n.options.resources ?? {})).toEqual(
			LANGUAGES.map(({ code }) => code)
		);
	});

	it('rejects unknown keys at compile time', () => {
		// @ts-expect-error: the key isn't in en/common.json. If key typing ever
		// stops working, this directive is unused and `npm run build` fails.
		const text = i18n.t('COMMON.NOT_A_KEY');

		// at runtime i18next shows the key itself
		expect(text).toBe('COMMON.NOT_A_KEY');
	});
});
