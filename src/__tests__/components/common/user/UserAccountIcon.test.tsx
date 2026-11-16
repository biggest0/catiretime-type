import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes, useLocation } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/__tests__/helpers/renderWithProviders';
import { UserAccountIcon } from '@/components/common/user/UserAccountIcon';
import { PAGE_ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';

// the session comes from a fake useAuth, set per test
vi.mock('@/hooks/useAuth');

/**
 * Renders the icon for a signed-in or signed-out visitor.
 *
 * @param isAuthenticated - Whether the visitor is signed in.
 * @param variant - Which version to render (the icon by default).
 */
function renderAs(isAuthenticated: boolean, variant?: 'icon' | 'full') {
	vi.mocked(useAuth).mockReturnValue({
		user: isAuthenticated ? { id: '1', email: 'reader@example.com' } : null,
		isAuthenticated,
		isLoading: false,
		login: vi.fn(),
		register: vi.fn(),
		loginWithGoogle: vi.fn(),
		logout: vi.fn(),
	});
	renderWithProviders(<UserAccountIcon variant={variant} />);
}

describe('UserAccountIcon', () => {
	it('links a signed-out visitor to the login page', () => {
		renderAs(false);

		expect(screen.getByRole('link', { name: 'Log In' })).toHaveAttribute(
			'href',
			PAGE_ROUTES.LOGIN
		);
	});

	it('is a text link in its full version, for the mobile menu', () => {
		renderAs(true, 'full');

		const link = screen.getByRole('link', { name: 'Account' });
		expect(link).toHaveTextContent('Account');
		expect(link).toHaveAttribute('href', PAGE_ROUTES.ACCOUNT);
	});

	it('links a signed-in visitor to the account page', () => {
		renderAs(true);

		expect(screen.getByRole('link', { name: 'Account' })).toHaveAttribute(
			'href',
			PAGE_ROUTES.ACCOUNT
		);
	});

	it.each([
		['icon', undefined],
		['full', 'full' as const],
	])(
		'tells the login page which page the visitor was on (%s)',
		async (_label, variant) => {
			vi.mocked(useAuth).mockReturnValue({
				user: null,
				isAuthenticated: false,
				isLoading: false,
				login: vi.fn(),
				register: vi.fn(),
				loginWithGoogle: vi.fn(),
				logout: vi.fn(),
			});
			renderWithProviders(
				<Routes>
					<Route
						path="/somewhere"
						element={<UserAccountIcon variant={variant} />}
					/>
					<Route path={PAGE_ROUTES.LOGIN} element={<ShowState />} />
				</Routes>,
				{ route: '/somewhere?x=1#part' }
			);

			await userEvent.click(screen.getByRole('link', { name: 'Log In' }));

			// the login page sends the visitor back there once signed in
			expect(screen.getByTestId('state')).toHaveTextContent(
				JSON.stringify({ from: '/somewhere?x=1#part' })
			);
		}
	);
});

/** Shows the navigation state the page was reached with. */
function ShowState() {
	return <p data-testid="state">{JSON.stringify(useLocation().state)}</p>;
}
