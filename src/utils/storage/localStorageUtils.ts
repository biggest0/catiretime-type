import { APP_SETTING } from '@/constants/keys';
import type { AppSetting, ThemeMode } from '@/types/localStorageTypes';

/**
 * What a first-time visitor gets. The theme script in index.html repeats the
 * `themeMode` default: change both together.
 */
const DEFAULT_APP_SETTING: AppSetting = {
	themeMode: 'system',
};

/**
 * Checks that a stored value is one of the theme modes.
 *
 * @param value - Whatever was found in storage.
 * @returns `true` for `'light'`, `'dark'` or `'system'`.
 */
function isThemeMode(value: unknown): value is ThemeMode {
	return value === 'light' || value === 'dark' || value === 'system';
}

/**
 * Reads the saved settings. Never throws: missing, corrupt or unreadable
 * storage gives the defaults, and a field that is missing or invalid gets
 * its own default.
 *
 * @returns A new settings object, safe for the caller to change.
 */
export function getAppSetting(): AppSetting {
	try {
		const raw = localStorage.getItem(APP_SETTING);
		if (raw === null) return { ...DEFAULT_APP_SETTING };

		// a bare string, number or null has no fields to read
		const stored: unknown = JSON.parse(raw);
		if (typeof stored !== 'object' || stored === null) {
			return { ...DEFAULT_APP_SETTING };
		}

		// keep each stored field only if it's valid; unknown keys are dropped,
		// so they aren't saved back forever
		const { themeMode } = stored as Record<string, unknown>;
		return {
			themeMode: isThemeMode(themeMode)
				? themeMode
				: DEFAULT_APP_SETTING.themeMode,
		};
	} catch (error) {
		// corrupt JSON, or storage the browser blocks (cookies disabled)
		console.error('Could not read the app settings:', error);
		return { ...DEFAULT_APP_SETTING };
	}
}

/**
 * Saves the settings. A failure (storage full or blocked) is logged, not
 * thrown: the change still shows until the page is reloaded.
 *
 * @param setting - The complete settings to save.
 */
export function setAppSetting(setting: AppSetting): void {
	try {
		localStorage.setItem(APP_SETTING, JSON.stringify(setting));
	} catch (error) {
		console.error('Could not save the app settings:', error);
	}
}
