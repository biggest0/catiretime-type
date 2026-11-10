import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

// the real English strings for the labels
import '@/i18n/config';
import { Footer } from '@/components/layout/footer/Footer';
import { PAGE_ROUTES } from '@/constants/routes';
import { PARENT_SITE, SITE_NAME, SOCIAL_PROFILES } from '@/constants/site';

afterEach(() => {
	vi.useRealTimers();
});

/**
 * Renders the footer inside a router (its privacy link needs one).
 *
 * @returns The footer landmark.
 */
function renderFooter() {
	render(
		<MemoryRouter>
			<Footer />
		</MemoryRouter>
	);
	return screen.getByRole('contentinfo');
}

describe('Footer', () => {
	it("shows the app's name, its tagline and the social links", () => {
		const footer = renderFooter();

		expect(within(footer).getByText(SITE_NAME)).toBeVisible();
		expect(
			within(footer).getByText(`Typing practice by ${PARENT_SITE.name}`)
		).toBeVisible();
		SOCIAL_PROFILES.forEach(({ label }) => {
			expect(within(footer).getByRole('link', { name: label })).toBeVisible();
		});
	});

	it('dates the copyright from the clock and links its name to Çatire Time', () => {
		// only Date is faked: nothing here waits on a timer
		vi.useFakeTimers({ toFake: ['Date'] });
		vi.setSystemTime(new Date(2031, 5, 15));
		const footer = renderFooter();

		const parentLink = within(footer).getByRole('link', {
			name: PARENT_SITE.name,
		});
		expect(parentLink).toHaveAttribute('href', PARENT_SITE.url);
		expect(parentLink.parentElement).toHaveTextContent(
			`${PARENT_SITE.name} © 2031`
		);
	});

	it('links to the privacy page', () => {
		const footer = renderFooter();

		expect(
			within(footer).getByRole('link', { name: 'Privacy' })
		).toHaveAttribute('href', PAGE_ROUTES.PRIVACY);
	});

	it('adds no navigation landmark (the section bar is the only one)', () => {
		const footer = renderFooter();

		expect(within(footer).queryByRole('navigation')).not.toBeInTheDocument();
	});
});
