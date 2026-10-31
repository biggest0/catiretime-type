import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

// the real English strings for the label
import '@/i18n/config';
import { AppLogo } from '@/components/common/brand/AppLogo';
import { PAGE_ROUTES } from '@/constants/routes';

describe('AppLogo', () => {
	it('is a link home named for screen readers', () => {
		render(
			<MemoryRouter>
				<AppLogo />
			</MemoryRouter>
		);

		expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
			'href',
			PAGE_ROUTES.HOME
		);
	});
});
