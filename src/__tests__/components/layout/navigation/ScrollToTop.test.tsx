import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
	Link,
	MemoryRouter,
	Route,
	Routes,
	useNavigate,
} from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ScrollToTop } from '@/components/layout/navigation/ScrollToTop';

/** A second page with a Back button, like the browser's. */
function LongPage() {
	const navigate = useNavigate();
	return (
		<>
			<button type="button" onClick={() => navigate(-1)}>
				Back
			</button>
			<Link to="/long">This same page</Link>
			<Link to="/long#notes">A place in this page</Link>
			{/* what a filter does: the address changes, the page doesn't */}
			<button
				type="button"
				onClick={() => navigate('/long?sort=new', { replace: true })}
			>
				Sort
			</button>
		</>
	);
}

/** Renders two pages and `ScrollToTop`, starting on the first. */
function renderPages() {
	render(
		<MemoryRouter>
			<ScrollToTop />
			<Routes>
				<Route path="/" element={<Link to="/long">Open the long page</Link>} />
				<Route path="/long" element={<LongPage />} />
			</Routes>
		</MemoryRouter>
	);
}

/** Opens the long page and forgets the scroll that made. */
async function openLongPage() {
	renderPages();
	await userEvent.click(screen.getByRole('link'));
	scrollTo.mockClear();
}

// jsdom doesn't implement scrolling
let scrollTo: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
	scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
});
afterEach(() => {
	vi.restoreAllMocks();
});

describe('ScrollToTop', () => {
	it("doesn't scroll on the first load", () => {
		renderPages();

		expect(scrollTo).not.toHaveBeenCalled();
	});

	it('scrolls to the top when a link opens another page', async () => {
		renderPages();

		await userEvent.click(screen.getByRole('link'));

		expect(scrollTo).toHaveBeenCalledExactlyOnceWith({
			top: 0,
			left: 0,
			behavior: 'instant',
		});
	});

	it('leaves Back to the browser', async () => {
		renderPages();
		await userEvent.click(screen.getByRole('link'));
		scrollTo.mockClear();

		await userEvent.click(screen.getByRole('button', { name: 'Back' }));

		expect(screen.getByRole('link')).toBeInTheDocument();
		expect(scrollTo).not.toHaveBeenCalled();
	});

	it("scrolls to the top for a link to the page you're already on", async () => {
		await openLongPage();

		await userEvent.click(screen.getByRole('link', { name: 'This same page' }));

		expect(scrollTo).toHaveBeenCalledOnce();
	});

	it("doesn't scroll when the address changes within the page", async () => {
		await openLongPage();

		await userEvent.click(screen.getByRole('button', { name: 'Sort' }));

		expect(scrollTo).not.toHaveBeenCalled();
	});

	it("doesn't scroll for a link to a place inside a page", async () => {
		await openLongPage();

		await userEvent.click(
			screen.getByRole('link', { name: 'A place in this page' })
		);

		expect(scrollTo).not.toHaveBeenCalled();
	});
});
