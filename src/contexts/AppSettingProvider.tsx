import {
	useCallback,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from 'react';

import { APP_SETTING } from '@/constants/keys';
import {
	AppSettingContext,
	type AppSettingContextValue,
} from '@/contexts/appSettingContext';
import type { AppSetting, ThemeMode } from '@/types/localStorageTypes';
import {
	getAppSetting,
	setAppSetting,
} from '@/utils/storage/localStorageUtils';

/** Matches when the OS is set to dark. */
const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';

/**
 * Puts the page in light or dark, then matches the browser's bar colour
 * (`theme-color`) to the page background. The colour tokens in index.css
 * switch on the `dark` class of `<html>`.
 *
 * @param isDark - Whether the page should be dark.
 */
function applyTheme(isDark: boolean): void {
	const root = document.documentElement;
	// the `dark` class is toggled on/off at root HTML to determine CSS theme
	root.classList.toggle('dark', isDark);

	// read the colour from the token, so another style's background follows
	// too; empty when the stylesheet isn't loaded (unit tests)
	const background = getComputedStyle(root)
		.getPropertyValue('--background')
		.trim();
	if (!background) return;

	// index.html has one tag per OS scheme for the first paint; once the app
	// runs, both follow the theme on screen
	document
		.querySelectorAll('meta[name="theme-color"]')
		.forEach((meta) => meta.setAttribute('content', background));
}

interface AppSettingProviderProps {
	children: ReactNode;
}

/**
 * Holds the display settings for the whole app: loads them on start, saves
 * each change, applies the theme to the page, and picks up changes saved in
 * other tabs.
 *
 * @param props.children - The part of the app that can read the settings.
 * @returns The children, with the settings available to `useAppSettings()`.
 */
export function AppSettingProvider({ children }: AppSettingProviderProps) {
	// a function passed to useState runs on the first render only
	const [appSetting, setAppSettingState] = useState<AppSetting>(getAppSetting);

	// the OS preference is state, so an OS switch re-renders whatever reads
	// isDarkMode (read during render, it would go stale)
	const [systemPrefersDark, setSystemPrefersDark] = useState(
		() => window.matchMedia(DARK_SCHEME_QUERY).matches
	);

	const { themeMode } = appSetting;
	const isDarkMode =
		themeMode === 'dark' || (themeMode === 'system' && systemPrefersDark);

	// keep the page in step with the theme; the script in index.html did it
	// for the first paint
	useEffect(() => {
		applyTheme(isDarkMode);
	}, [isDarkMode]);

	// follow the OS setting, in every mode, so switching to `system` already
	// knows the current value
	useEffect(() => {
		const query = window.matchMedia(DARK_SCHEME_QUERY);
		const handleChange = (event: MediaQueryListEvent) =>
			setSystemPrefersDark(event.matches);

		query.addEventListener('change', handleChange);
		return () => query.removeEventListener('change', handleChange);
	}, []);

	// pick up settings saved in another tab. The `storage` event fires in
	// every other tab of this site, never in the one that saved. Its key is
	// null when another tab cleared all storage
	useEffect(() => {
		const handleStorage = (event: StorageEvent) => {
			if (event.key === APP_SETTING || event.key === null) {
				setAppSettingState(getAppSetting());
			}
		};

		window.addEventListener('storage', handleStorage);
		return () => window.removeEventListener('storage', handleStorage);
	}, []);

	/**
	 * Saves new settings, then shows them.
	 *
	 * @param next - The complete new settings.
	 */
	const saveSetting = useCallback((next: AppSetting) => {
		setAppSetting(next);
		setAppSettingState(next);
	}, []);

	const setThemeMode = useCallback(
		(mode: ThemeMode) => saveSetting({ ...appSetting, themeMode: mode }),
		[appSetting, saveSetting]
	);

	const toggleDarkMode = useCallback(
		() =>
			saveSetting({
				...appSetting,
				themeMode: isDarkMode ? 'light' : 'dark',
			}),
		[appSetting, isDarkMode, saveSetting]
	);

	// a new object only when something in it changes, so components reading
	// the settings don't re-render for nothing (React docs: "Optimizing
	// re-renders when passing objects and functions")
	const value = useMemo<AppSettingContextValue>(
		() => ({ appSetting, isDarkMode, setThemeMode, toggleDarkMode }),
		[appSetting, isDarkMode, setThemeMode, toggleDarkMode]
	);

	return <AppSettingContext value={value}>{children}</AppSettingContext>;
}
