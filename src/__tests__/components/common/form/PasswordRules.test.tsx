import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/__tests__/helpers/renderWithProviders';
import { PasswordRules } from '@/components/common/form/PasswordRules';
import { TextField } from '@/components/common/form/TextField';
import i18n from '@/i18n/config';
import en from '@/i18n/en/common.json';
import fr from '@/i18n/fr/common.json';

/** The four rules' English labels, in order, the number filled in. */
const LABELS = [
	'At least 8 characters',
	en.AUTH.PASSWORD_RULE_UPPERCASE,
	en.AUTH.PASSWORD_RULE_LOWERCASE,
	en.AUTH.PASSWORD_RULE_NUMBER,
];
const MET = en.AUTH.PASSWORD_RULE_MET;
const NOT_MET = en.AUTH.PASSWORD_RULE_NOT_MET;

/**
 * Each rule's line, as a screen reader reads it.
 *
 * @returns The text of each list item, in order.
 */
const ruleLines = () =>
	within(screen.getByRole('list'))
		.getAllByRole('listitem')
		.map((item) => item.textContent);

describe('PasswordRules', () => {
	it('lists the four rules, none met while the password is empty', () => {
		renderWithProviders(<PasswordRules password="" />);

		expect(screen.getByText(en.AUTH.PASSWORD_RULES)).toBeInTheDocument();
		expect(ruleLines()).toEqual(LABELS.map((label) => `${label}, ${NOT_MET}`));
	});

	it('ticks each rule the password meets, in words as well as colour', () => {
		renderWithProviders(<PasswordRules password="abcdefg1" />);

		// a screen reader can't see the tick: the state is in the text
		expect(ruleLines()).toEqual([
			`${LABELS[0]}, ${MET}`,
			`${LABELS[1]}, ${NOT_MET}`,
			`${LABELS[2]}, ${MET}`,
			`${LABELS[3]}, ${MET}`,
		]);
	});

	it("is read with each rule's state by a screen reader on the field", () => {
		renderWithProviders(
			<TextField
				label="Password"
				hint={<PasswordRules password="abcdefg1" />}
			/>
		);

		// computed as assistive technology does: hidden text wouldn't count
		expect(screen.getByLabelText('Password')).toHaveAccessibleDescription(
			`${en.AUTH.PASSWORD_RULES} ${LABELS[0]}, ${MET} ` +
				`${LABELS[1]}, ${NOT_MET} ${LABELS[2]}, ${MET} ${LABELS[3]}, ${MET}`
		);
	});

	it('updates as the password changes', () => {
		const { rerender } = renderWithProviders(<PasswordRules password="a" />);

		rerender(<PasswordRules password="Abcdefg1" />);

		expect(ruleLines()).toEqual(LABELS.map((label) => `${label}, ${MET}`));
	});

	it('follows the UI language', async () => {
		await i18n.changeLanguage('fr');
		try {
			renderWithProviders(<PasswordRules password="" />);

			expect(screen.getByText(fr.AUTH.PASSWORD_RULES)).toBeInTheDocument();
			expect(ruleLines()[0]).toBe(
				`Au moins 8 caractères, ${fr.AUTH.PASSWORD_RULE_NOT_MET}`
			);
		} finally {
			await i18n.changeLanguage('en');
		}
	});
});
