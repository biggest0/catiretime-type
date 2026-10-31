// Tells TypeScript which translation keys exist, so a typo such as
// t('AUTH.LOGNI') fails the build instead of showing the raw key on screen.
import 'i18next';

import type { Resources } from '@/i18n/types';

declare module 'i18next' {
	interface CustomTypeOptions {
		defaultNS: 'common';
		resources: Resources;
	}
}
