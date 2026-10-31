import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

// the real English strings for the labels
import '@/i18n/config';
import { ThemeSelector } from '@/components/common/theme/ThemeSelector';
import { APP_SETTING } from '@/constants/keys';
import { AppSettingProvider } from '@/contexts/AppSettingProvider';

afterEach(() => {
	localStorage.clear();
	document.documentElement.classList.remove('dark');
});

/** Renders the selector inside the settings provider (the test OS is light). */
function renderSelector() {
	render(
		<AppSettingProvider>
			<ThemeSelector />
		</AppSettingProvider>
	);
}

/**
 * Finds one of the three buttons by its theme.
 *
 * @param mode - The visible label: `Light`, `Dark` or `System`.
 * @returns The button.
 */
function themeButton(mode: 'Light' | 'Dark' | 'System') {
	return screen.getByRole('button', { name: `Switch to ${mode} mode` });
}

/** @returns The theme saved in `localStorage`, if any. */
function savedTheme() {
	return JSON.parse(localStorage.getItem(APP_SETTING) ?? '{}').themeMode;
}

describe('ThemeSelector', () => {
	it('shows System as the choice on a first visit', () => {
		renderSelector();

		expect(themeButton('System')).toHaveAttribute('aria-pressed', 'true');
		expect(themeButton('Light')).toHaveAttribute('aria-pressed', 'false');
		expect(themeButton('Dark')).toHaveAttribute('aria-pressed', 'false');
	});

	it('chooses dark and saves it', async () => {
		renderSelector();

		await userEvent.click(themeButton('Dark'));

		expect(themeButton('Dark')).toHaveAttribute('aria-pressed', 'true');
		expect(themeButton('System')).toHaveAttribute('aria-pressed', 'false');
		expect(savedTheme()).toBe('dark');
		expect(document.documentElement).toHaveClass('dark');
	});

	it('goes back to following the device with System', async () => {
		localStorage.setItem(APP_SETTING, JSON.stringify({ themeMode: 'dark' }));
		renderSelector();

		await userEvent.click(themeButton('System'));

		expect(savedTheme()).toBe('system');
		// the test OS is light
		expect(document.documentElement).not.toHaveClass('dark');
	});
});
