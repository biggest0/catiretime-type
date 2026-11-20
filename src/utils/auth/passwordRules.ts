/** The fewest characters a password may have. */
export const PASSWORD_MIN_LENGTH = 8;

/**
 * The rules a new password must meet: the backend's, copied here so the
 * register and new-password forms can show them from the start and check
 * them before sending. The backend checks them again, in this same order,
 * and names the first one a password breaks by its `code`. A change to the
 * backend's rules needs the same change here (`passwordRules.test.ts` holds
 * the backend's own test cases).
 *
 * Each rule has the backend's code, the key of its line in the list shown
 * under the field, and the test a password must pass.
 */
export const PASSWORD_RULES = [
	{
		code: 'PASSWORD_TOO_SHORT',
		label: 'AUTH.PASSWORD_RULE_LENGTH',
		// counted as the backend counts, in UTF-16 units: an emoji counts 2
		isMetBy: (password: string) => password.length >= PASSWORD_MIN_LENGTH,
	},
	{
		code: 'PASSWORD_NEEDS_UPPERCASE',
		label: 'AUTH.PASSWORD_RULE_UPPERCASE',
		// A to Z only, like the backend: É or Ç don't count (the line says so)
		isMetBy: (password: string) => /[A-Z]/.test(password),
	},
	{
		code: 'PASSWORD_NEEDS_LOWERCASE',
		label: 'AUTH.PASSWORD_RULE_LOWERCASE',
		isMetBy: (password: string) => /[a-z]/.test(password),
	},
	{
		code: 'PASSWORD_NEEDS_NUMBER',
		label: 'AUTH.PASSWORD_RULE_NUMBER',
		isMetBy: (password: string) => /[0-9]/.test(password),
	},
] as const;

/** One of `PASSWORD_RULES`. */
export type PasswordRule = (typeof PASSWORD_RULES)[number];

/**
 * Finds the rules a password breaks.
 *
 * @param password - The password, exactly as typed.
 * @returns Every rule it breaks, in the backend's order (the first is the
 *   one the backend would name); empty when it meets them all.
 */
export function unmetPasswordRules(password: string): PasswordRule[] {
	return PASSWORD_RULES.filter((rule) => !rule.isMetBy(password));
}
