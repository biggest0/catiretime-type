import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/__tests__/helpers/renderWithProviders';
import { AppLogo } from '@/components/common/brand/AppLogo';
import { PAGE_ROUTES } from '@/constants/routes';

describe('AppLogo', () => {
	it('is a link home named for screen readers', () => {
		renderWithProviders(<AppLogo />);

		expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
			'href',
			PAGE_ROUTES.HOME
		);
	});
});
