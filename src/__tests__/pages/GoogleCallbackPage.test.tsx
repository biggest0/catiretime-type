import { screen } from '@testing-library/react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/__tests__/helpers/renderWithProviders';
import { ApiError } from '@/api/authApi';
import { GOOGLE_OAUTH_RETURN_TO, GOOGLE_OAUTH_STATE } from '@/constants/keys';
import { PAGE_ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import en from '@/i18n/en/common.json';
import GoogleCallbackPage from '@/pages/GoogleCallbackPage';

// the session comes from a fake useAuth; `loginWithGoogle` is a spy
vi.mock('@/hooks/useAuth');
const loginWithGoogle = vi.fn<(loginCode: string) => Promise<void>>();

/** The state this tab saved when it started the sign-in. */
const STATE = 'type.0b9c6f4e-3a5d-4c1e-9f7a-2d8b6e5c4a31';

/** Whether the login page was shown, even for a moment. */
let loginShown = false;

/** Stands in for the login page: shows the state it was told, notes it ran. */
function LoginStand() {
	loginShown = true;
	return <p data-testid="login">{JSON.stringify(useLocation().state)}</p>;
}

/**
 * Renders the return page, as the backend's redirect lands on it, in
 * StrictMode around everything: React then runs its effect twice, as in
 * development.
 *
 * @param query - The return address's query string.
 */
function renderReturn(query: string) {
	renderWithProviders(
		<Routes>
			<Route
				path={PAGE_ROUTES.GOOGLE_CALLBACK}
				element={<GoogleCallbackPage />}
			/>
			<Route path={PAGE_ROUTES.LOGIN} element={<LoginStand />} />
			<Route path={PAGE_ROUTES.HOME} element={<p>The home page</p>} />
			<Route path="/somewhere" element={<p>Where they were</p>} />
		</Routes>,
		{
			route: `${PAGE_ROUTES.GOOGLE_CALLBACK}?${query}`,
			// StrictMode outside everything; inside the router, React 19 runs
			// effects once (measured)
			reactStrictMode: true,
		}
	);
}

/**
 * Saves what the login page saves before leaving for Google.
 *
 * @param returnTo - The page to come back to, if any.
 */
function startedHere(returnTo?: string) {
	sessionStorage.setItem(GOOGLE_OAUTH_STATE, STATE);
	if (returnTo) sessionStorage.setItem(GOOGLE_OAUTH_RETURN_TO, returnTo);
}

/**
 * Waits for the login page and reads what it was told.
 *
 * @returns The navigation state it received.
 */
async function loginPageState() {
	return JSON.parse((await screen.findByTestId('login')).textContent ?? '');
}

beforeEach(() => {
	loginShown = false;
	sessionStorage.clear();
	loginWithGoogle.mockReset().mockResolvedValue();
	vi.mocked(useAuth).mockReturnValue({
		user: null,
		isAuthenticated: false,
		isLoading: false,
		login: vi.fn(),
		register: vi.fn(),
		loginWithGoogle,
		logout: vi.fn(),
	});
});

describe('GoogleCallbackPage', () => {
	it('says it is signing in, out of search results', () => {
		// a code that never answers, so the page stays
		loginWithGoogle.mockReturnValue(new Promise(() => {}));
		startedHere();

		renderReturn(`loginCode=c1&state=${STATE}`);

		expect(
			screen.getByRole('heading', {
				level: 1,
				name: en.PAGES.GOOGLE_CALLBACK.TITLE,
			})
		).toBeInTheDocument();
		expect(screen.getByRole('status')).toBeInTheDocument();
	});

	it('spends the one-time code once, then returns to the saved page', async () => {
		startedHere('/somewhere');

		renderReturn(`loginCode=c1&state=${STATE}`);

		expect(await screen.findByText('Where they were')).toBeInTheDocument();
		// StrictMode ran the effect twice; the code was sent once, and the
		// second run didn't refuse the (now used) state on the way
		expect(loginWithGoogle).toHaveBeenCalledExactlyOnceWith('c1');
		expect(loginShown).toBe(false);
	});

	it('goes to the home page when the sign-in started on the login page itself', async () => {
		startedHere('/login');

		renderReturn(`loginCode=c1&state=${STATE}`);

		expect(await screen.findByText('The home page')).toBeInTheDocument();
	});

	it('goes back to the login page quietly when the visitor cancelled', async () => {
		startedHere('/somewhere');

		renderReturn('error=access_denied&cancelled=true');

		// no message, and the page to come back to is kept
		expect(await loginPageState()).toEqual({ from: '/somewhere' });
		expect(loginWithGoogle).not.toHaveBeenCalled();
	});

	it.each([
		['Google reports an error', 'error=server_error&cancelled=false', 'failed'],
		['the state differs', 'loginCode=c1&state=type.forged', 'stateInvalid'],
		['there is no code', `state=${STATE}`, 'failed'],
	])(
		'sends the visitor back to log in when %s',
		async (_label, query, googleProblem) => {
			startedHere('/somewhere');

			renderReturn(query);

			expect(await loginPageState()).toEqual({
				from: '/somewhere',
				googleProblem,
			});
			expect(loginWithGoogle).not.toHaveBeenCalled();
		}
	);

	it('refuses a return this tab never started', async () => {
		// nothing saved: the sign-in was started in another tab or browser
		renderReturn(`loginCode=c1&state=${STATE}`);

		expect(await loginPageState()).toEqual({ googleProblem: 'stateInvalid' });
		expect(loginWithGoogle).not.toHaveBeenCalled();
	});

	it.each([
		['the code is refused', new ApiError(401, 'expired'), 'failed'],
		['there were too many attempts', new ApiError(429, 'x'), 'rateLimited'],
		['the server is out of reach', new TypeError('Failed to fetch'), 'network'],
	])(
		'sends the visitor back to log in when %s',
		async (_label, thrown, googleProblem) => {
			loginWithGoogle.mockRejectedValue(thrown);
			startedHere('/somewhere');

			renderReturn(`loginCode=c1&state=${STATE}`);

			expect(await loginPageState()).toEqual({
				from: '/somewhere',
				googleProblem,
			});
		}
	);
});
