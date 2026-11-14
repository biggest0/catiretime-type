import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/__tests__/helpers/renderWithProviders';
import { ThemeToggle } from '@/components/common/theme/ThemeToggle';
import { APP_SETTING } from '@/constants/keys';

afterEach(() => {
	localStorage.clear();
	document.documentElement.classList.remove('dark');
});

/** Renders the toggle (the test OS is light). */
function renderToggle() {
	renderWithProviders(<ThemeToggle />);
}

describe('ThemeToggle', () => {
	it('offers dark mode while the page is light', () => {
		renderToggle();

		expect(
			screen.getByRole('button', { name: 'Switch to Dark mode' })
		).toBeInTheDocument();
	});

	it('switches to dark, saves it, and then offers light', async () => {
		renderToggle();

		await userEvent.click(screen.getByRole('button'));

		expect(document.documentElement).toHaveClass('dark');
		expect(JSON.parse(localStorage.getItem(APP_SETTING)!)).toEqual({
			themeMode: 'dark',
		});
		expect(screen.getByRole('button')).toHaveAccessibleName(
			'Switch to Light mode'
		);
	});
});
