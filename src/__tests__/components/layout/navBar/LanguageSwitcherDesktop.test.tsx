import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

// the real i18n instance: the menu reads and changes its language
import i18n from '@/i18n/config';
import { LanguageSwitcherDesktop } from '@/components/layout/navBar/LanguageSwitcherDesktop';
import { LANGUAGES } from '@/i18n/languages';

afterEach(async () => {
	await i18n.changeLanguage('en');
	// after the language reset, which saves 'en' again
	localStorage.clear();
});

/**
 * Renders the menu and opens it (the test browser is English).
 *
 * @returns The menu's language options, in order.
 */
async function openMenu() {
	render(<LanguageSwitcherDesktop />);
	await userEvent.click(screen.getByRole('button', { name: 'Language' }));
	// a mouse press opens the menu on the next animation frame
	return screen.findAllByRole('menuitemradio');
}

describe('LanguageSwitcherDesktop', () => {
	it('lists every language in its own language, marked with lang', async () => {
		const options = await openMenu();

		expect(options).toHaveLength(LANGUAGES.length);
		LANGUAGES.forEach(({ code, name }, index) => {
			expect(options[index]).toHaveTextContent(name);
			expect(screen.getByText(name)).toHaveAttribute('lang', code);
		});
	});

	it('marks the current language as checked', async () => {
		const [english, french] = await openMenu();

		expect(english).toHaveAttribute('aria-checked', 'true');
		expect(french).toHaveAttribute('aria-checked', 'false');
	});

	it('switches the language and closes when one is chosen', async () => {
		const [, french] = await openMenu();

		await userEvent.click(french);

		expect(i18n.resolvedLanguage).toBe('fr');
		expect(document.documentElement.lang).toBe('fr');
		await waitFor(() =>
			expect(screen.queryByRole('menu')).not.toBeInTheDocument()
		);
		// the trigger's label is now French
		expect(screen.getByRole('button', { name: 'Langue' })).toBeInTheDocument();
	});
});
