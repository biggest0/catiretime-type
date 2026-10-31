// Shapes of the data the app keeps in localStorage. Stored data comes from the
// visitor's browser, so it's read through the checks in
// utils/storage/localStorageUtils.ts, never trusted as it is.

/** The theme the visitor picked. `system` follows the OS setting. */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Display settings, saved under `APP_SETTING`. A new field needs a default
 * and a check in `getAppSetting()`, so a visitor who saved before the field
 * existed still gets a complete object.
 */
export interface AppSetting {
	themeMode: ThemeMode;
}
