import { expect, test } from '@playwright/test';

import en from '../src/i18n/en/common.json' with { type: 'json' };
import {
	stubAnonymousVisitor,
	stubRegister,
	TEST_USER,
} from './support/stubApi';

// Making an account, in the built app, against the fake backend.

/** A password that meets every rule. */
const GOOD_PASSWORD = 'Abcdefg1';

/**
 * Escapes a text for use inside a regular expression.
 *
 * @param text - Any text, brackets and all.
 * @returns The text, matching only itself.
 */
const escaped = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

test.beforeEach(async ({ page }) => {
	await stubAnonymousVisitor(page);
});

test('registering says where the verification email went', async ({ page }) => {
	await stubRegister(page);
	// the way most visitors arrive: from the login page's link
	await page.goto('/login');
	await page.getByRole('link', { name: 'Register' }).click();
	// The login page stays on screen until the register page's file has
	// loaded: wait for it, or the typing lands in the login form.
	await expect(
		page.getByRole('heading', { level: 1, name: en.PAGES.REGISTER.TITLE })
	).toBeVisible();

	await page.getByLabel('Email').fill(TEST_USER.email);
	await page.getByLabel('Password', { exact: true }).fill(GOOD_PASSWORD);
	await page.getByLabel('Confirm Password').fill(GOOD_PASSWORD);
	await page.getByRole('button', { name: 'Register' }).click();

	await expect(
		page.getByRole('heading', {
			level: 1,
			name: en.PAGES.REGISTER.VERIFY_TITLE,
		})
	).toBeVisible();
	await expect(page.getByText(TEST_USER.email)).toBeVisible();
	// registering signed the visitor in, and they stay to read the message
	await expect(page).toHaveURL('/register');
	await expect(
		page.getByRole('banner').getByRole('link', { name: 'Account' })
	).toBeVisible();
});

test('a password that breaks a rule is caught before anything is sent', async ({
	page,
}) => {
	const registerCalls = await stubRegister(page);
	await page.goto('/register');

	await page.getByLabel('Email').fill(TEST_USER.email);
	const password = page.getByLabel('Password', { exact: true });
	await password.fill('abcdefgh');
	await page.getByLabel('Confirm Password').fill('abcdefgh');
	await page.getByRole('button', { name: 'Register' }).click();

	await expect(password).toBeFocused();
	await expect(page.getByText(en.AUTH.PASSWORD_RULES_UNMET)).toBeVisible();
	// The rules list says which ones, to a screen reader too. Browsers put
	// a space before the comma (the state is out of the text's flow);
	// speech doesn't change.
	await expect(password).toHaveAccessibleDescription(
		new RegExp(
			`${escaped(en.AUTH.PASSWORD_RULE_NUMBER)}\\s*,\\s*` +
				escaped(en.AUTH.PASSWORD_RULE_NOT_MET)
		)
	);
	expect(registerCalls()).toBe(0);
});

test('an email that already has an account is announced', async ({ page }) => {
	await stubRegister(page, {
		status: 409,
		error: 'Email already in use',
		code: 'EMAIL_IN_USE',
	});
	await page.goto('/register');

	await page.getByLabel('Email').fill(TEST_USER.email);
	await page.getByLabel('Password', { exact: true }).fill(GOOD_PASSWORD);
	await page.getByLabel('Confirm Password').fill(GOOD_PASSWORD);
	await page.getByRole('button', { name: 'Register' }).click();

	await expect(page.getByRole('alert')).toHaveText(en.AUTH.EMAIL_IN_USE);
	await expect(page.getByLabel('Email')).toHaveValue(TEST_USER.email);
});
