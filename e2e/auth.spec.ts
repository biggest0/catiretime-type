import { expect, test } from '@playwright/test';

import en from '../src/i18n/en/common.json' with { type: 'json' };
import {
	GOOGLE_OAUTH_RETURN_TO,
	GOOGLE_OAUTH_STATE,
} from '../src/constants/keys';
import {
	stubAnonymousVisitor,
	stubGoogleExchange,
	stubLogin,
	TEST_USER,
} from './support/stubApi';

// Signing in, in the built app, against the fake backend.

test.beforeEach(async ({ page }) => {
	await stubAnonymousVisitor(page);
});

test('signing in returns to the page the visitor logged in from', async ({
	page,
}) => {
	await stubLogin(page);
	// a page that stays public (until it exists, it's the not-found page)
	await page.goto('/privacy');
	await page.getByRole('banner').getByRole('link', { name: 'Log In' }).click();

	await page.getByLabel('Email').fill(TEST_USER.email);
	await page.getByLabel('Password').fill('a password');
	await page.getByRole('button', { name: 'Log In' }).click();

	await expect(page).toHaveURL('/privacy');
	// the header now offers the account, not the login page
	await expect(
		page.getByRole('banner').getByRole('link', { name: 'Account' })
	).toBeVisible();
});

test('signing in on a login page opened directly leads home', async ({
	page,
}) => {
	await stubLogin(page);
	await page.goto('/login');

	await page.getByLabel('Email').fill(TEST_USER.email);
	await page.getByLabel('Password').fill('a password');
	await page.getByRole('button', { name: 'Log In' }).click();

	await expect(page).toHaveURL('/');
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

test.describe('coming back from Google', () => {
	/** The state the login page saved before leaving for Google. */
	const STATE = 'type.0b9c6f4e-3a5d-4c1e-9f7a-2d8b6e5c4a31';

	test.beforeEach(async ({ page }) => {
		// what the login page saves in this tab before leaving for Google
		await page.goto('/');
		await page.evaluate(
			([stateKey, state, returnKey]) => {
				sessionStorage.setItem(stateKey, state);
				sessionStorage.setItem(returnKey, '/privacy');
			},
			[GOOGLE_OAUTH_STATE, STATE, GOOGLE_OAUTH_RETURN_TO]
		);
	});

	test('signs in and returns to the page the sign-in started from', async ({
		page,
	}) => {
		await stubGoogleExchange(page);

		// where the backend sends the visitor after Google
		await page.goto(`/auth/google/callback?loginCode=code-1&state=${STATE}`);

		await expect(page).toHaveURL('/privacy');
		await expect(
			page.getByRole('banner').getByRole('link', { name: 'Account' })
		).toBeVisible();
	});

	test('refuses a return with another state, on the login page', async ({
		page,
	}) => {
		await stubGoogleExchange(page);

		await page.goto('/auth/google/callback?loginCode=code-1&state=type.forged');

		await expect(page).toHaveURL('/login');
		await expect(page.getByRole('alert')).toHaveText(
			en.AUTH.GOOGLE_STATE_INVALID
		);
	});

	test('an expired code ends on the login page with a message', async ({
		page,
	}) => {
		await stubGoogleExchange(page, {
			status: 401,
			error: 'Login code is invalid or expired',
		});

		await page.goto(`/auth/google/callback?loginCode=code-1&state=${STATE}`);

		await expect(page).toHaveURL('/login');
		await expect(page.getByRole('alert')).toHaveText(en.AUTH.GOOGLE_FAILED);
	});
});
