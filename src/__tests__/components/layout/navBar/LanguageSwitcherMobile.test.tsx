import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

// the real i18n instance: the row reads and changes its language
import { renderWithProviders } from '@/__tests__/helpers/renderWithProviders';
import i18n from '@/i18n/config';
import { LanguageSwitcherMobile } from '@/components/layout/navBar/LanguageSwitcherMobile';
import { LANGUAGES } from '@/i18n/languages';

afterEach(async () => {
	await i18n.changeLanguage('en');
	// after the language reset, which saves 'en' again
	localStorage.clear();
});

/**
 * Finds one language's button, folded or not.
 *
 * @param name - The language's name, in its own language.
 * @returns The button.
 */
function languageButton(name: string) {
	return screen.getByText(name).closest('button')!;
}

describe('LanguageSwitcherMobile', () => {
	it('keeps the folded languages away from the keyboard and screen readers', () => {
		renderWithProviders(<LanguageSwitcherMobile />);

		expect(screen.getByRole('button', { name: 'Language' })).toHaveAttribute(
			'aria-expanded',
			'false'
		);
		LANGUAGES.forEach(({ name }) => {
			expect(languageButton(name).closest('[inert]')).not.toBeNull();
		});
	});

	it('unfolds the languages, each in its own language, the current one pressed', async () => {
		renderWithProviders(<LanguageSwitcherMobile />);

		await userEvent.click(screen.getByRole('button', { name: 'Language' }));

		LANGUAGES.forEach(({ code, name }) => {
			expect(languageButton(name).closest('[inert]')).toBeNull();
			expect(languageButton(name)).toHaveAttribute('lang', code);
		});
		expect(screen.getByRole('button', { name: 'English' })).toHaveAttribute(
			'aria-pressed',
			'true'
		);
		expect(screen.getByRole('button', { name: 'Français' })).toHaveAttribute(
			'aria-pressed',
			'false'
		);
	});

	it('switches the language and folds the list away', async () => {
		renderWithProviders(<LanguageSwitcherMobile />);
		await userEvent.click(screen.getByRole('button', { name: 'Language' }));

		await userEvent.click(screen.getByRole('button', { name: 'Français' }));

		expect(i18n.resolvedLanguage).toBe('fr');
		expect(document.documentElement.lang).toBe('fr');
		expect(screen.getByRole('button', { name: 'Langue' })).toHaveAttribute(
			'aria-expanded',
			'false'
		);
		expect(languageButton('Français')).toHaveAttribute('aria-pressed', 'true');
	});
});
