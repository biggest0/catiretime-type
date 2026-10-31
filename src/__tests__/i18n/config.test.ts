import { afterEach, describe, expect, it, vi } from 'vitest';

import { UI_LANGUAGE } from '@/constants/keys';
import i18n from '@/i18n/config';

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

	it('falls back to English for a language the app does not support', async () => {
		await i18n.changeLanguage('de');

		expect(i18n.resolvedLanguage).toBe('en');
		expect(i18n.t('COMMON.CLOSE')).toBe('Close');
	});

	it('rejects unknown keys at compile time', () => {
		// @ts-expect-error: the key isn't in en/common.json. If key typing ever
		// stops working, this directive is unused and `npm run build` fails.
		const text = i18n.t('COMMON.NOT_A_KEY');

		// at runtime i18next shows the key itself
		expect(text).toBe('COMMON.NOT_A_KEY');
	});
});
