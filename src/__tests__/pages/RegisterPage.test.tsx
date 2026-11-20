import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSyncExternalStore } from 'react';
import { Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/__tests__/helpers/renderWithProviders';
import { ApiError } from '@/api/authApi';
import { PAGE_ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import en from '@/i18n/en/common.json';
import RegisterPage from '@/pages/RegisterPage';
import { MAIN_CONTENT_ID } from '@/utils/a11y/pageFocus';

// the session comes from a fake useAuth, below
vi.mock('@/hooks/useAuth');

/**
 * A stand-in for the session store. Like the real one, it re-renders what
 * reads it when it changes: registering signs the visitor in *before* the
 * call returns, and the page must cope with that order. (A plain object
 * would only be seen at the page's next render of its own.)
 */
const session = (() => {
	let signedIn = false;
	const listeners = new Set<() => void>();
	return {
		isSignedIn: () => signedIn,
		/** @param value - Whether the visitor is now signed in. */
		set(value: boolean) {
			signedIn = value;
			listeners.forEach((listener) => listener());
		},
		/** @param listener - Called on every change. */
		subscribe(listener: () => void) {
			listeners.add(listener);
			return () => listeners.delete(listener);
		},
	};
})();

const register = vi.fn<(email: string, password: string) => Promise<void>>();

/**
 * The fake `useAuth`: reads the stand-in store as the real hook reads the
 * real one.
 *
 * @returns What `useAuth()` returns.
 */
function useFakeAuth(): ReturnType<typeof useAuth> {
	const isAuthenticated = useSyncExternalStore(
		session.subscribe,
		session.isSignedIn
	);
	return {
		user: isAuthenticated ? { id: '1', email: 'cat@example.com' } : null,
		isAuthenticated,
		isLoading: false,
		login: vi.fn(),
		register,
		loginWithGoogle: vi.fn(),
		logout: vi.fn(),
	};
}

/**
 * Renders the register page inside the routes it can lead to, in a `<main>`
 * like the app's, where focus moves after a change of view.
 *
 * @param state - The navigation state the visitor arrived with, if any.
 */
function renderRegister(state?: unknown) {
	renderWithProviders(
		<main id={MAIN_CONTENT_ID}>
			<Routes>
				<Route path={PAGE_ROUTES.REGISTER} element={<RegisterPage />} />
				<Route path={PAGE_ROUTES.HOME} element={<p>The home page</p>} />
				<Route path="/somewhere" element={<p>Where they were going</p>} />
			</Routes>
		</main>,
		{ route: { pathname: PAGE_ROUTES.REGISTER, state } }
	);
}

const emailField = () => screen.getByLabelText('Email');
const passwordField = () => screen.getByLabelText('Password');
const confirmationField = () => screen.getByLabelText('Confirm Password');
const submitButton = () => screen.getByRole('button', { name: /^regist/i });

/**
 * Types into the three fields; an empty value leaves its field alone.
 *
 * @param email - For the email field.
 * @param password - For the password field.
 * @param confirmation - For the confirmation; the password when left out.
 */
async function fillIn(
	email: string,
	password: string,
	confirmation = password
) {
	if (email) await userEvent.type(emailField(), email);
	if (password) await userEvent.type(passwordField(), password);
	if (confirmation) await userEvent.type(confirmationField(), confirmation);
}

/**
 * Escapes a text for use inside a regular expression.
 *
 * @param text - Any text.
 * @returns The text, matching only itself.
 */
const literally = (text: string) =>
	new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

/** A password that meets every rule. */
const GOOD_PASSWORD = 'Abcdefg1';

beforeEach(() => {
	session.set(false);
	// like the real store: the visitor is signed in before the call returns
	register.mockReset().mockImplementation(async () => session.set(true));
	vi.mocked(useAuth).mockImplementation(useFakeAuth);
});

describe('RegisterPage', () => {
	it('shows the form, with fields a password manager can fill', () => {
		renderRegister();

		expect(
			screen.getByRole('heading', { level: 1, name: en.PAGES.REGISTER.TITLE })
		).toBeInTheDocument();
		expect(emailField()).toHaveAttribute('autocomplete', 'email');
		// new-password: the browser offers to make one up and save it
		expect(passwordField()).toHaveAttribute('autocomplete', 'new-password');
		expect(confirmationField()).toHaveAttribute('autocomplete', 'new-password');
		expect(passwordField()).toHaveAttribute('type', 'password');
		expect(confirmationField()).toHaveAttribute('type', 'password');
	});

	it('shows the password rules before anything is typed, tied to the field', () => {
		renderRegister();

		expect(screen.getByText(en.AUTH.PASSWORD_RULES)).toBeInTheDocument();
		// a screen reader on the field reads the rules too
		expect(passwordField()).toHaveAccessibleDescription(
			literally(en.AUTH.PASSWORD_RULES)
		);
	});

	it('links to the login page', () => {
		renderRegister();

		expect(screen.getByRole('link', { name: 'Log In' })).toHaveAttribute(
			'href',
			PAGE_ROUTES.LOGIN
		);
	});

	it('names each empty field and puts focus on the first', async () => {
		renderRegister();

		await userEvent.click(submitButton());

		expect(emailField()).toHaveAccessibleDescription(en.AUTH.EMAIL_REQUIRED);
		expect(passwordField()).toHaveAccessibleDescription(
			literally(en.AUTH.NEW_PASSWORD_REQUIRED)
		);
		expect(confirmationField()).toHaveAccessibleDescription(
			en.AUTH.CONFIRM_PASSWORD_REQUIRED
		);
		expect(emailField()).toHaveFocus();
		expect(register).not.toHaveBeenCalled();
	});

	it('refuses a password that breaks a rule, before sending it', async () => {
		renderRegister();
		await fillIn('cat@example.com', 'abcdefgh');

		await userEvent.click(submitButton());

		expect(passwordField()).toBeInvalid();
		expect(passwordField()).toHaveAccessibleDescription(
			literally(en.AUTH.PASSWORD_RULES_UNMET)
		);
		expect(passwordField()).toHaveFocus();
		expect(register).not.toHaveBeenCalled();
	});

	it('refuses a confirmation that differs, with focus on it', async () => {
		renderRegister();
		await fillIn('cat@example.com', GOOD_PASSWORD, 'Abcdefg2');

		await userEvent.click(submitButton());

		expect(passwordField()).toBeValid();
		expect(confirmationField()).toHaveAccessibleDescription(
			en.AUTH.PASSWORDS_MISMATCH
		);
		expect(confirmationField()).toHaveFocus();
		expect(register).not.toHaveBeenCalled();
	});

	it("clears a field's message once something is typed in it", async () => {
		renderRegister();
		await userEvent.click(submitButton());

		await userEvent.type(emailField(), 'c');
		await userEvent.type(confirmationField(), 'x');

		// (not toBeValid: the browser's own check finds "c" isn't an email)
		expect(emailField()).not.toHaveAttribute('aria-invalid');
		expect(emailField()).not.toHaveAccessibleDescription();
		expect(confirmationField()).toBeValid();
		// the password field keeps its message until it's edited
		expect(passwordField()).toBeInvalid();
	});

	it('registers with the email trimmed and the password as typed', async () => {
		renderRegister();
		// a browser strips ordinary spaces from an email field by itself, but
		// not the no-break space that pasted text often carries
		await fillIn('\u00A0cat@example.com\u00A0', ' Abcdefg1 ');

		await userEvent.click(submitButton());

		expect(register).toHaveBeenCalledExactlyOnceWith(
			'cat@example.com',
			' Abcdefg1 '
		);
	});

	it('then says where the verification email went, with focus on it', async () => {
		renderRegister();
		await fillIn(' cat@example.com', GOOD_PASSWORD);

		await userEvent.click(submitButton());

		// registering signed the visitor in, yet they aren't sent away
		const heading = await screen.findByRole('heading', {
			level: 1,
			name: en.PAGES.REGISTER.VERIFY_TITLE,
		});
		expect(screen.getByText(en.AUTH.VERIFY_EMAIL_SENT)).toBeInTheDocument();
		expect(screen.getByText('cat@example.com')).toBeInTheDocument();
		expect(screen.queryByText('The home page')).not.toBeInTheDocument();
		// the form and its button are gone: focus goes to the new heading
		await waitFor(() => expect(heading).toHaveFocus());
	});

	it('keeps the fields usable and ignores a second submit while registering', async () => {
		// a registration that stays out until the test answers it
		let finish = () => {};
		register.mockImplementation(
			() => new Promise<void>((resolve) => (finish = resolve))
		);
		renderRegister();
		await fillIn('cat@example.com', GOOD_PASSWORD);

		await userEvent.click(submitButton());

		const busy = screen.getByRole('button', { name: en.AUTH.REGISTERING });
		// marked, not disabled: a disabled button would drop keyboard focus
		expect(busy).toHaveAttribute('aria-disabled', 'true');
		expect(busy).toBeEnabled();
		expect(emailField()).toBeEnabled();

		await userEvent.click(busy);
		expect(register).toHaveBeenCalledOnce();

		finish();
		expect(
			await screen.findByRole('heading', {
				name: en.PAGES.REGISTER.VERIFY_TITLE,
			})
		).toBeInTheDocument();
	});

	it.each([
		[
			'an email that has an account',
			new ApiError(409, 'Email already in use', 'EMAIL_IN_USE'),
			en.AUTH.EMAIL_IN_USE,
		],
		[
			'an email the server reads as invalid',
			new ApiError(400, 'Invalid email format', 'EMAIL_INVALID'),
			en.AUTH.EMAIL_INVALID,
		],
		['no connection', new TypeError('Failed to fetch'), en.AUTH.NETWORK_ERROR],
	])('announces %s and keeps the form', async (_label, thrown, message) => {
		register.mockRejectedValue(thrown);
		renderRegister();
		await fillIn('cat@example.com', GOOD_PASSWORD);

		await userEvent.click(submitButton());

		expect(await screen.findByRole('alert')).toHaveTextContent(message);
		expect(emailField()).toHaveValue('cat@example.com');
		expect(submitButton()).toHaveAttribute('aria-disabled', 'false');
	});

	it('sends an already signed-in visitor on, without showing the form', () => {
		session.set(true);

		renderRegister({ from: '/somewhere' });

		expect(screen.getByText('Where they were going')).toBeInTheDocument();
		expect(screen.queryByLabelText('Email')).not.toBeInTheDocument();
	});

	it('sends an already signed-in visitor home when nothing says where', () => {
		session.set(true);

		renderRegister();

		expect(screen.getByText('The home page')).toBeInTheDocument();
	});
});
