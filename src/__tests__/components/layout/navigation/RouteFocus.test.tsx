import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Link, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { renderApp } from '@/__tests__/helpers/renderApp';
import { renderWithProviders } from '@/__tests__/helpers/renderWithProviders';
import { RouteFocus } from '@/components/layout/navigation/RouteFocus';
import { MAIN_CONTENT_ID } from '@/utils/a11y/pageFocus';

/**
 * Renders a small app shaped like the real one: a link outside the content
 * (as the header's and footer's are), then `<main>` with two pages.
 */
function renderPages() {
	renderWithProviders(
		<>
			<Link to="/account">To the account page</Link>
			<Link to="/loading">To a page still loading</Link>
			<main id={MAIN_CONTENT_ID}>
				<RouteFocus />
				<Routes>
					<Route path="/" element={<h1>Home</h1>} />
					<Route path="/account" element={<h1>Account</h1>} />
					{/* a page that has no heading on screen yet */}
					<Route path="/loading" element={<p>Loading…</p>} />
				</Routes>
			</main>
		</>
	);
}

describe('RouteFocus', () => {
	it('leaves focus alone on the first load', () => {
		renderPages();

		expect(document.body).toHaveFocus();
	});

	it("moves focus to the new page's heading after a link is followed", async () => {
		renderPages();

		await userEvent.click(
			screen.getByRole('link', { name: 'To the account page' })
		);

		expect(screen.getByRole('heading', { name: 'Account' })).toHaveFocus();
	});

	it('moves focus to the content area when the new page has no heading yet', async () => {
		renderPages();

		await userEvent.click(
			screen.getByRole('link', { name: 'To a page still loading' })
		);

		expect(screen.getByRole('main')).toHaveFocus();
	});
});

describe('RouteFocus in the app', () => {
	beforeEach(() => {
		// jsdom doesn't scroll; ScrollToTop calls this after each navigation
		vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
		renderApp('/');
	});

	afterEach(() => {
		window.history.pushState({}, '', '/');
		vi.restoreAllMocks();
	});

	it("puts focus on the new page's heading after a link is followed", async () => {
		// the footer's link: before, focus stayed on it, far down the page
		await userEvent.click(screen.getByRole('link', { name: 'Privacy' }));

		expect(
			await screen.findByRole('heading', {
				level: 1,
				name: 'This page wandered off',
			})
		).toHaveFocus();
	});

	it("leaves focus on the new page's heading after a link in the mobile menu", async () => {
		await userEvent.click(screen.getByRole('button', { name: 'Toggle menu' }));
		const menu = await screen.findByRole('dialog', { name: 'Navigation menu' });

		await userEvent.click(within(menu).getByRole('link', { name: 'Log In' }));

		const heading = await screen.findByRole('heading', {
			level: 1,
			name: 'This page wandered off',
		});
		await waitFor(() =>
			expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
		);
		// not back on the menu's button, where the closing menu would put it
		expect(heading).toHaveFocus();
	});
});
