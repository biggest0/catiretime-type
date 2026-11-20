import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/__tests__/helpers/renderWithProviders';
import { ApiError } from '@/api/authApi';
import { PAGE_ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import en from '@/i18n/en/common.json';
import LoginPage from '@/pages/LoginPage';

// the session comes from a fake useAuth, set per test
vi.mock('@/hooks/useAuth');

// Google sign-in is faked too: whether this build offers it, and the call
// that would leave the page
const google = vi.hoisted(() => ({
	available: true,
	start: vi.fn(() => true),
}));
vi.mock('@/utils/auth/googleLogin', async (importOriginal) => ({
	...(await importOriginal<object>()),
	get isGoogleLoginAvailable() {
		return google.available;
	},
	startGoogleLogin: google.start,
}));

/** The fake session: tests change it, and `login` is a spy. */
const session = {
	isAuthenticated: false,
	login: vi.fn<(email: string, password: string) => Promise<void>>(),
};

/**
 * Renders the login page inside the routes it can lead to.
 *
 * @param state - The navigation state the visitor arrived with, if any.
 */
function renderLogin(state?: unknown) {
	renderWithProviders(
		<Routes>
			<Route path={PAGE_ROUTES.LOGIN} element={<LoginPage />} />
			<Route path={PAGE_ROUTES.HOME} element={<p>The home page</p>} />
			<Route path={PAGE_ROUTES.ACCOUNT} element={<p>The account page</p>} />
			<Route path="/somewhere" element={<p>Where they were going</p>} />
		</Routes>,
		{ route: { pathname: PAGE_ROUTES.LOGIN, state } }
	);
}

/** Types into the two fields. */
async function fillIn(email: string, password: string) {
	if (email) await userEvent.type(screen.getByLabelText('Email'), email);
	if (password) {
		await userEvent.type(screen.getByLabelText('Password'), password);
	}
}

const submitButton = () => screen.getByRole('button', { name: /^log/i });

beforeEach(() => {
	google.available = true;
	google.start.mockReset().mockReturnValue(true);
	session.isAuthenticated = false;
	session.login.mockReset().mockResolvedValue();
	vi.mocked(useAuth).mockImplementation(() => ({
		user: session.isAuthenticated
			? { id: '1', email: 'cat@example.com' }
			: null,
		isAuthenticated: session.isAuthenticated,
		isLoading: false,
		login: session.login,
		register: vi.fn(),
		loginWithGoogle: vi.fn(),
		logout: vi.fn(),
	}));
});

describe('LoginPage', () => {
	it('shows the form, with fields a password manager can fill', () => {
		renderLogin();

		expect(
			screen.getByRole('heading', { level: 1, name: en.PAGES.LOGIN.TITLE })
		).toBeInTheDocument();
		expect(screen.getByLabelText('Email')).toHaveAttribute(
			'autocomplete',
			'email'
		);
		expect(screen.getByLabelText('Password')).toHaveAttribute(
			'autocomplete',
			'current-password'
		);
		expect(screen.getByLabelText('Password')).toHaveAttribute(
			'type',
			'password'
		);
	});

	it('links to registering and to resetting the password', () => {
		renderLogin();

		expect(screen.getByRole('link', { name: 'Register' })).toHaveAttribute(
			'href',
			PAGE_ROUTES.REGISTER
		);
		expect(
			screen.getByRole('link', { name: 'Forgot password?' })
		).toHaveAttribute('href', PAGE_ROUTES.RESET_PASSWORD);
	});

	it('names each empty field and puts focus on the first', async () => {
		renderLogin();

		await userEvent.click(submitButton());

		expect(screen.getByLabelText('Email')).toHaveAccessibleDescription(
			'Enter your email.'
		);
		expect(screen.getByLabelText('Password')).toHaveAccessibleDescription(
			'Enter your password.'
		);
		expect(screen.getByLabelText('Email')).toHaveFocus();
		expect(session.login).not.toHaveBeenCalled();
	});

	it('puts focus on the password when only it is missing', async () => {
		renderLogin();
		await fillIn('cat@example.com', '');

		await userEvent.click(submitButton());

		expect(screen.getByLabelText('Email')).toBeValid();
		expect(screen.getByLabelText('Password')).toBeInvalid();
		expect(screen.getByLabelText('Password')).toHaveFocus();
	});

	it("clears a field's message once something is typed in it", async () => {
		renderLogin();
		await userEvent.click(submitButton());

		await userEvent.type(screen.getByLabelText('Email'), 'c');

		// its own message is gone; the other field keeps its message
		expect(screen.getByLabelText('Email')).not.toHaveAttribute('aria-invalid');
		expect(screen.getByLabelText('Email')).not.toHaveAccessibleDescription();
		expect(screen.getByLabelText('Password')).toHaveAccessibleDescription(
			'Enter your password.'
		);
	});

	it('signs in with the email trimmed and the password as typed', async () => {
		renderLogin();
		// a browser strips ordinary spaces from an email field by itself, but
		// not the no-break space that pasted text often carries
		await fillIn('\u00A0cat@example.com\u00A0', ' pass word ');

		await userEvent.click(submitButton());

		expect(session.login).toHaveBeenCalledExactlyOnceWith(
			'cat@example.com',
			' pass word '
		);
	});

	it('keeps the fields usable and ignores a second submit while signing in', async () => {
		// a sign-in that stays out until the test answers it
		let finish = () => {};
		session.login.mockImplementation(
			() => new Promise<void>((resolve) => (finish = resolve))
		);
		renderLogin();
		await fillIn('cat@example.com', 'secret');

		await userEvent.click(submitButton());

		const busy = screen.getByRole('button', { name: 'Logging in...' });
		// marked, not disabled: a disabled button would drop keyboard focus
		expect(busy).toHaveAttribute('aria-disabled', 'true');
		expect(busy).toBeEnabled();
		expect(screen.getByLabelText('Email')).toBeEnabled();

		await userEvent.click(busy);
		expect(session.login).toHaveBeenCalledOnce();

		finish();
		expect(
			await screen.findByRole('button', { name: 'Log In' })
		).toHaveAttribute('aria-disabled', 'false');
	});

	it.each([
		['a wrong password', new ApiError(401, 'x'), en.AUTH.INVALID_CREDENTIALS],
		['no connection', new TypeError('Failed to fetch'), en.AUTH.NETWORK_ERROR],
	])('announces %s', async (_label, thrown, message) => {
		session.login.mockRejectedValue(thrown);
		renderLogin();
		await fillIn('cat@example.com', 'wrong');

		await userEvent.click(submitButton());

		expect(await screen.findByRole('alert')).toHaveTextContent(message);
		// and the form can be sent again
		expect(submitButton()).toHaveAttribute('aria-disabled', 'false');
	});

	it('goes to the home page when the visitor came straight here', async () => {
		session.login.mockImplementation(async () => {
			session.isAuthenticated = true;
		});
		renderLogin();
		await fillIn('cat@example.com', 'secret');

		await userEvent.click(submitButton());

		expect(await screen.findByText('The home page')).toBeInTheDocument();
	});

	it('goes back to the page that sent the visitor here', async () => {
		session.login.mockImplementation(async () => {
			session.isAuthenticated = true;
		});
		renderLogin({ from: '/somewhere' });
		await fillIn('cat@example.com', 'secret');

		await userEvent.click(submitButton());

		expect(
			await screen.findByText('Where they were going')
		).toBeInTheDocument();
	});

	it('sends an already signed-in visitor on, without showing the form', () => {
		session.isAuthenticated = true;

		renderLogin({ from: PAGE_ROUTES.ACCOUNT });

		expect(screen.getByText('The account page')).toBeInTheDocument();
		expect(screen.queryByLabelText('Email')).not.toBeInTheDocument();
	});

	it.each([
		['another site', 'https://elsewhere.example/page'],
		['a protocol-relative address', '//elsewhere.example'],
		['something that is not text', 42],
		['the login page itself', '/login'],
		['the login page with a query', '/login?next=1'],
	])('goes home instead of a "from" that is %s', (_label, from) => {
		session.isAuthenticated = true;

		renderLogin({ from });

		expect(screen.getByText('The home page')).toBeInTheDocument();
	});

	it('starts a Google sign-in from its button', async () => {
		renderLogin();

		await userEvent.click(
			screen.getByRole('button', { name: 'Sign in with Google' })
		);

		expect(google.start).toHaveBeenCalledOnce();
		expect(screen.queryByRole('alert')).not.toBeInTheDocument();
	});

	it('gives Google sign-in the page to come back to', async () => {
		renderLogin({ from: '/somewhere' });

		await userEvent.click(
			screen.getByRole('button', { name: 'Sign in with Google' })
		);

		expect(google.start).toHaveBeenCalledExactlyOnceWith('/somewhere');
	});

	it.each([
		['failed', en.AUTH.GOOGLE_FAILED],
		['stateInvalid', en.AUTH.GOOGLE_STATE_INVALID],
		['rateLimited', en.AUTH.RATE_LIMITED],
		['network', en.AUTH.NETWORK_ERROR],
	])('says why a Google sign-in came back (%s)', (googleProblem, message) => {
		renderLogin({ from: '/somewhere', googleProblem });

		expect(screen.getByRole('alert')).toHaveTextContent(message);
	});

	it('clears the Google message when the form is sent', async () => {
		renderLogin({ googleProblem: 'failed' });
		await fillIn('cat@example.com', 'secret');

		await userEvent.click(submitButton());

		expect(screen.queryByRole('alert')).not.toBeInTheDocument();
	});

	it("says so when a Google sign-in can't start", async () => {
		google.start.mockReturnValue(false);
		renderLogin();

		await userEvent.click(
			screen.getByRole('button', { name: 'Sign in with Google' })
		);

		expect(screen.getByRole('alert')).toHaveTextContent(en.AUTH.GOOGLE_FAILED);
	});

	it('offers no Google sign-in when the build has no Google settings', () => {
		google.available = false;

		renderLogin();

		expect(
			screen.queryByRole('button', { name: 'Sign in with Google' })
		).not.toBeInTheDocument();
		expect(submitButton()).toBeInTheDocument();
	});
});
