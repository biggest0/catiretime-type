import { describe, expect, it } from 'vitest';

import {
	PASSWORD_MIN_LENGTH,
	PASSWORD_RULES,
	unmetPasswordRules,
} from '@/utils/auth/passwordRules';

/**
 * The codes of the rules a password breaks, in the list's order.
 *
 * @param password - The password to check.
 * @returns The codes, e.g. `['PASSWORD_NEEDS_NUMBER']`; empty when it passes.
 */
const unmetCodes = (password: string) =>
	unmetPasswordRules(password).map((rule) => rule.code);

describe('passwordRules', () => {
	it("lists the backend's four rules, in the order it checks them", () => {
		// the first rule a password breaks is the code the backend answers
		// with, so the order matters as much as the rules
		expect(PASSWORD_RULES.map((rule) => rule.code)).toEqual([
			'PASSWORD_TOO_SHORT',
			'PASSWORD_NEEDS_UPPERCASE',
			'PASSWORD_NEEDS_LOWERCASE',
			'PASSWORD_NEEDS_NUMBER',
		]);
		expect(PASSWORD_MIN_LENGTH).toBe(8);
	});

	// The backend's own test cases for its password check, with the code it
	// answers each one with (read from its tests on 2026-11-20).
	it.each([
		['', 'PASSWORD_TOO_SHORT'],
		['Ab1', 'PASSWORD_TOO_SHORT'],
		['Abcde1x', 'PASSWORD_TOO_SHORT'],
		['abcdefg1', 'PASSWORD_NEEDS_UPPERCASE'],
		['ABCDEFG1', 'PASSWORD_NEEDS_LOWERCASE'],
		['Abcdefgh', 'PASSWORD_NEEDS_NUMBER'],
	])('refuses %j first for the rule the backend names', (password, code) => {
		expect(unmetCodes(password)[0]).toBe(code);
	});

	it.each(['Abcdef1x', 'Abcdef1!', 'ThisIsAVeryLongPassword1'])(
		'accepts %j, as the backend does',
		(password) => {
			expect(unmetCodes(password)).toEqual([]);
		}
	);

	it('names every rule a password breaks, not only the first', () => {
		expect(unmetCodes('abc')).toEqual([
			'PASSWORD_TOO_SHORT',
			'PASSWORD_NEEDS_UPPERCASE',
			'PASSWORD_NEEDS_NUMBER',
		]);
	});

	it('counts only A to Z as capitals, as the backend does', () => {
		// the backend's check is /[A-Z]/: an accented capital isn't one
		expect(unmetCodes('Égalité1')).toEqual(['PASSWORD_NEEDS_UPPERCASE']);
	});

	it('counts length the way the backend does', () => {
		// both count UTF-16 units, so four emoji make eight
		expect(unmetCodes('Ab1😀😀😀')).toEqual([]);
		expect(unmetCodes('Ab1😀😀')).toEqual(['PASSWORD_TOO_SHORT']);
	});
});
