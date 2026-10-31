import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import { UI_LANGUAGE } from '@/constants/keys';
import enCommon from '@/i18n/en/common.json';
import frCommon from '@/i18n/fr/common.json';

/** Every translation, by language, then namespace. The app has one: `common`. */
const resources = {
	en: { common: enCommon },
	fr: { common: frCommon },
} as const;

/**
 * The app's single i18next instance. Importing this module initialises it,
 * so import it once, at startup. Components read translations through
 * react-i18next's `useTranslation()`, not through this object.
 */
i18n
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		resources,
		supportedLngs: ['en', 'fr'],
		// a key missing in French, or a language the app doesn't support,
		// shows the English text
		fallbackLng: 'en',
		defaultNS: 'common',
		ns: ['common'],
		// React already escapes the text it renders; escaping here as well would
		// show entities such as &amp; on screen
		interpolation: { escapeValue: false },
		detection: {
			// a language the visitor picked earlier wins over the browser's
			order: ['localStorage', 'navigator'],
			lookupLocalStorage: UI_LANGUAGE,
			// remember the language each time it changes
			caches: ['localStorage'],
		},
	});

export default i18n;
