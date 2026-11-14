import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/__tests__/helpers/renderWithProviders';
import { Header } from '@/components/layout/header/Header';

describe('Header', () => {
	it("is the page's banner, with one navigation area: the section links", () => {
		renderWithProviders(<Header />);

		const banner = screen.getByRole('banner');
		// two unnamed navigation areas couldn't be told apart (backport K36)
		const navigation = within(banner).getByRole('navigation');
		expect(
			within(navigation).getByRole('link', { name: 'Home' })
		).toBeInTheDocument();
	});
});
