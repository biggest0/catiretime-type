import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { APP_SETTING } from '@/constants/keys';
import { AppSettingProvider } from '@/contexts/AppSettingProvider';
import { useAppSettings } from '@/hooks/useAppSettings';

type SchemeListener = (event: MediaQueryListEvent) => void;

/**
 * Replaces `matchMedia` with a fake OS colour setting that a test can change.
 *
 * @param prefersDark - Whether the OS starts in dark.
 * @returns A function that switches the OS setting and tells the listeners,
 * as the browser does when the visitor changes it.
 */
function mockSystemTheme(prefersDark: boolean): (dark: boolean) => void {
	const listeners = new Set<SchemeListener>();
	let matches = prefersDark;

	vi.spyOn(window, 'matchMedia').mockImplementation(
		(query: string) =>
			({
				get matches() {
					return matches;
				},
				media: query,
				addEventListener: (_type: string, listener: SchemeListener) => {
					listeners.add(listener);
				},
				removeEventListener: (_type: string, listener: SchemeListener) => {
					listeners.delete(listener);
				},
			}) as unknown as MediaQueryList
	);

	return (dark: boolean) => {
		matches = dark;
		listeners.forEach((listener) =>
			listener({ matches: dark } as MediaQueryListEvent)
		);
	};
}

/**
 * Mounts the provider and reads it through the hook, as a component would.
 *
 * @returns Testing Library's handle; `result.current` is the hook's value.
 */
function renderSettings() {
	return renderHook(() => useAppSettings(), { wrapper: AppSettingProvider });
}

/**
 * Whether the page is in dark mode: the class the colour tokens switch on.
 *
 * @returns `true` when `<html>` has the `dark` class.
 */
function pageIsDark(): boolean {
	return document.documentElement.classList.contains('dark');
}

afterEach(() => {
	vi.restoreAllMocks();
	localStorage.clear();
	document.documentElement.classList.remove('dark');
});

describe('AppSettingProvider', () => {
	it('starts from the saved setting', () => {
		mockSystemTheme(false);
		localStorage.setItem(APP_SETTING, JSON.stringify({ themeMode: 'dark' }));

		const { result } = renderSettings();

		expect(result.current.appSetting.themeMode).toBe('dark');
		expect(result.current.isDarkMode).toBe(true);
		expect(pageIsDark()).toBe(true);
	});

	it('follows the OS in system mode, also when the OS changes', () => {
		const setSystemDark = mockSystemTheme(false);

		const { result } = renderSettings();
		expect(result.current.appSetting.themeMode).toBe('system');
		expect(pageIsDark()).toBe(false);

		act(() => setSystemDark(true));

		expect(result.current.isDarkMode).toBe(true);
		expect(pageIsDark()).toBe(true);
	});

	it('saves a picked mode and applies it', () => {
		mockSystemTheme(false);
		const { result } = renderSettings();

		act(() => result.current.setThemeMode('dark'));

		expect(JSON.parse(localStorage.getItem(APP_SETTING)!)).toEqual({
			themeMode: 'dark',
		});
		expect(pageIsDark()).toBe(true);
	});

	it("toggles to the opposite of what's showing", () => {
		// system mode on a dark OS shows dark, so the toggle picks light
		mockSystemTheme(true);
		const { result } = renderSettings();

		act(() => result.current.toggleDarkMode());

		expect(result.current.appSetting.themeMode).toBe('light');
		expect(pageIsDark()).toBe(false);
	});

	it('picks up a theme saved in another tab', () => {
		mockSystemTheme(false);
		const { result } = renderSettings();

		// another tab saves; the browser then tells this tab
		localStorage.setItem(APP_SETTING, JSON.stringify({ themeMode: 'dark' }));
		act(() => {
			window.dispatchEvent(new StorageEvent('storage', { key: APP_SETTING }));
		});

		expect(result.current.appSetting.themeMode).toBe('dark');
		expect(pageIsDark()).toBe(true);
	});

	it('ignores storage changes to other keys', () => {
		mockSystemTheme(false);
		const { result } = renderSettings();

		localStorage.setItem(APP_SETTING, JSON.stringify({ themeMode: 'dark' }));
		act(() => {
			window.dispatchEvent(new StorageEvent('storage', { key: 'other' }));
		});

		expect(result.current.appSetting.themeMode).toBe('system');
	});

	it('returns to the defaults when another tab clears storage', () => {
		mockSystemTheme(false);
		localStorage.setItem(APP_SETTING, JSON.stringify({ themeMode: 'dark' }));
		const { result } = renderSettings();

		// clear() sends a storage event whose key is null
		localStorage.clear();
		act(() => {
			window.dispatchEvent(new StorageEvent('storage', { key: null }));
		});

		expect(result.current.appSetting.themeMode).toBe('system');
		expect(pageIsDark()).toBe(false);
	});
});

describe('useAppSettings', () => {
	it('throws outside the provider', () => {
		// React logs the thrown error; keep the test output clean
		vi.spyOn(console, 'error').mockImplementation(() => {});

		expect(() => renderHook(() => useAppSettings())).toThrow(
			'useAppSettings must be used within AppSettingProvider'
		);
	});
});
