import { createContext } from 'react';

import type { AppSetting, ThemeMode } from '@/types/localStorageTypes';

/** What `useAppSettings()` gives a component. */
export interface AppSettingContextValue {
	/** The saved settings. */
	appSetting: AppSetting;
	/** Whether the page is dark now: the chosen mode, or the OS in `system`. */
	isDarkMode: boolean;
	/** Picks a mode. For the light / dark / system selector. */
	setThemeMode: (mode: ThemeMode) => void;
	/** Switches to the opposite of what's showing. For a one-button toggle. */
	toggleDarkMode: () => void;
}

/**
 * Carries the settings from `AppSettingProvider` to `useAppSettings()`. It's
 * `undefined` outside the provider, which the hook turns into an error.
 *
 * It has its own file because a file that exports a component (the
 * provider) must export nothing else, or Fast Refresh can't update it in
 * place while you edit.
 */
export const AppSettingContext = createContext<
	AppSettingContextValue | undefined
>(undefined);
