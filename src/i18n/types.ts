import type enCommon from '@/i18n/en/common.json';

/**
 * The shape of the translations, taken from the English file. English is the
 * reference: a key that isn't in `en/common.json` is a type error everywhere.
 */
export interface Resources {
	common: typeof enCommon;
}

/** A language the UI supports. */
export type Language = 'en' | 'fr';
