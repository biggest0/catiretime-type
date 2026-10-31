import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

// the real English strings for the labels
import '@/i18n/config';
import { Header } from '@/components/layout/header/Header';

describe('Header', () => {
	it("is the page's banner, with one navigation area: the section links", () => {
		render(
			<MemoryRouter>
				<Header />
			</MemoryRouter>
		);

		const banner = screen.getByRole('banner');
		// two unnamed navigation areas couldn't be told apart (backport K36)
		const navigation = within(banner).getByRole('navigation');
		expect(
			within(navigation).getByRole('link', { name: 'HOME' })
		).toBeInTheDocument();
	});
});
