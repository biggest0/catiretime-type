import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

// the real English strings for the labels
import '@/i18n/config';
import { SectionBar } from '@/components/layout/header/SectionBar';
import { NAV_SECTIONS } from '@/constants/navigation';
import { PAGE_ROUTES } from '@/constants/routes';

/**
 * Renders the section bar as it looks on one page.
 *
 * @param path - The address of the page.
 */
function renderAt(path: string) {
	render(
		<MemoryRouter initialEntries={[path]}>
			<SectionBar />
		</MemoryRouter>
	);
}

describe('SectionBar', () => {
	it('links to every section in the list, in order', () => {
		renderAt(PAGE_ROUTES.HOME);

		const hrefs = screen
			.getAllByRole('link')
			.map((link) => link.getAttribute('href'));
		expect(hrefs).toEqual(NAV_SECTIONS.map(({ path }) => path));
	});

	it('marks the section of the current page', () => {
		renderAt(PAGE_ROUTES.HOME);

		expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
			'aria-current',
			'page'
		);
	});

	it('marks no section on a page outside the list', () => {
		renderAt(PAGE_ROUTES.ACCOUNT);

		expect(screen.getByRole('link', { name: 'Home' })).not.toHaveAttribute(
			'aria-current'
		);
	});
});
