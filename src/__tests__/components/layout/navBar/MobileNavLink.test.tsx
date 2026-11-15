import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/__tests__/helpers/renderWithProviders';
import { MobileNavLink } from '@/components/layout/navBar/MobileNavLink';
import { PAGE_ROUTES } from '@/constants/routes';

/**
 * Renders two menu links as they look on the home page: one to that page,
 * one to another.
 */
function renderLinks() {
	renderWithProviders(
		<>
			<MobileNavLink linkTo={PAGE_ROUTES.HOME} linkLabel="Home" />
			<MobileNavLink linkTo={PAGE_ROUTES.ACCOUNT} linkLabel="Account" />
		</>,
		{ route: PAGE_ROUTES.HOME }
	);
}

describe('MobileNavLink', () => {
	it('marks the link to the current page for screen readers', () => {
		renderLinks();

		expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
			'aria-current',
			'page'
		);
		expect(screen.getByRole('link', { name: 'Account' })).not.toHaveAttribute(
			'aria-current'
		);
	});

	it('underlines the link to the current page, not only colours it', () => {
		renderLinks();

		// the two colours are too close to tell apart by colour alone
		expect(screen.getByRole('link', { name: 'Home' })).toHaveClass('underline');
		expect(screen.getByRole('link', { name: 'Account' })).not.toHaveClass(
			'underline'
		);
	});
});
