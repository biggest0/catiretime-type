import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

// the real English strings for the labels
import '@/i18n/config';
import { UserAccountIcon } from '@/components/common/user/UserAccountIcon';
import { PAGE_ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';

// the session comes from a fake useAuth, set per test
vi.mock('@/hooks/useAuth');

/**
 * Renders the icon for a signed-in or signed-out visitor.
 *
 * @param isAuthenticated - Whether the visitor is signed in.
 */
function renderAs(isAuthenticated: boolean) {
	vi.mocked(useAuth).mockReturnValue({
		user: isAuthenticated ? { id: '1', email: 'reader@example.com' } : null,
		isAuthenticated,
		isLoading: false,
		login: vi.fn(),
		register: vi.fn(),
		loginWithGoogle: vi.fn(),
		logout: vi.fn(),
	});
	render(
		<MemoryRouter>
			<UserAccountIcon />
		</MemoryRouter>
	);
}

describe('UserAccountIcon', () => {
	it('links a signed-out visitor to the login page', () => {
		renderAs(false);

		expect(screen.getByRole('link', { name: 'Log In' })).toHaveAttribute(
			'href',
			PAGE_ROUTES.LOGIN
		);
	});

	it('links a signed-in visitor to the account page', () => {
		renderAs(true);

		expect(screen.getByRole('link', { name: 'Account' })).toHaveAttribute(
			'href',
			PAGE_ROUTES.ACCOUNT
		);
	});
});
