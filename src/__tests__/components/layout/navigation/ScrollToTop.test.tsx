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
		<button type="button" onClick={() => navigate(-1)}>
			Back
		</button>
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
});
