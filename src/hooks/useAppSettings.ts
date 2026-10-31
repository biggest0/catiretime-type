import { useContext } from 'react';

import {
	AppSettingContext,
	type AppSettingContextValue,
} from '@/contexts/appSettingContext';

/**
 * Reads the display settings and the functions that change them.
 *
 * @returns The saved settings, whether the page is dark, and the setters.
 * @throws When called outside `AppSettingProvider`, so a missing provider
 * fails loudly instead of acting as if nothing were saved.
 */
export function useAppSettings(): AppSettingContextValue {
	const context = useContext(AppSettingContext);
	if (!context) {
		throw new Error('useAppSettings must be used within AppSettingProvider');
	}
	return context;
}
