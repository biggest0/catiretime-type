import { expect, test } from '@playwright/test';

import en from '../src/i18n/en/common.json' with { type: 'json' };
import { stubAnonymousVisitor, stubLogin, TEST_USER } from './support/stubApi';

// Signing in, in the built app, against the fake backend.

test.beforeEach(async ({ page }) => {
	await stubAnonymousVisitor(page);
});

test('signing in leads to the account page', async ({ page }) => {
	await stubLogin(page);
	await page.goto('/login');

	await page.getByLabel('Email').fill(TEST_USER.email);
	await page.getByLabel('Password').fill('a password');
	await page.getByRole('button', { name: 'Log In' }).click();

	await expect(page).toHaveURL('/account');
	await expect(
		page.getByRole('heading', { level: 1, name: en.PAGES.ACCOUNT.TITLE })
	).toBeVisible();
	// the header now offers the account, not the login page
	await expect(
		page.getByRole('banner').getByRole('link', { name: 'Account' })
	).toBeVisible();
	// Back doesn't return to the form
	await page.goBack();
	await expect(page).not.toHaveURL('/login');
});

test('a refused sign-in says why and keeps what was typed', async ({
	page,
}) => {
	await stubLogin(page, { status: 401, error: 'Invalid email or password.' });
	await page.goto('/login');

	await page.getByLabel('Email').fill(TEST_USER.email);
	await page.getByLabel('Password').fill('not the password');
	await page.getByLabel('Password').press('Enter');

	await expect(page.getByRole('alert')).toHaveText(en.AUTH.INVALID_CREDENTIALS);
	await expect(page).toHaveURL('/login');
	await expect(page.getByLabel('Email')).toHaveValue(TEST_USER.email);
});

test('an empty form names each field and focuses the first', async ({
	page,
}) => {
	await page.goto('/login');

	await page.getByRole('button', { name: 'Log In' }).click();

	await expect(page.getByText(en.AUTH.EMAIL_REQUIRED)).toBeVisible();
	await expect(page.getByText(en.AUTH.PASSWORD_REQUIRED)).toBeVisible();
	await expect(page.getByLabel('Email')).toBeFocused();
});
