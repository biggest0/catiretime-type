import type enCommon from '@/i18n/en/common.json';
import type { LANGUAGES } from '@/i18n/languages';

/**
 * The shape of the translations, taken from the English file. English is the
 * reference: a key that isn't in `en/common.json` is a type error everywhere.
 */
export interface Resources {
	common: typeof enCommon;
}

/** A language the UI supports: one of the codes in `LANGUAGES`. */
export type Language = (typeof LANGUAGES)[number]['code'];
