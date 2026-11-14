import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/__tests__/helpers/renderWithProviders';
import { AppTitle } from '@/components/layout/navBar/AppTitle';
import { PAGE_ROUTES } from '@/constants/routes';
import { SITE_NAME } from '@/constants/site';

describe('AppTitle', () => {
	it('is a link home named after the site, in one piece', () => {
		renderWithProviders(<AppTitle />);

		expect(screen.getByRole('link', { name: SITE_NAME })).toHaveAttribute(
			'href',
			PAGE_ROUTES.HOME
		);
	});

	it('hides the cat drawing from screen readers', () => {
		renderWithProviders(<AppTitle />);

		// alt="" makes an image decorative: it has no role to find
		expect(screen.queryByRole('img')).not.toBeInTheDocument();
	});
});
