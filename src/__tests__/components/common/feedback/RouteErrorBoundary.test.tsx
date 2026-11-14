import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/__tests__/helpers/renderWithProviders';
import { RouteErrorBoundary } from '@/components/common/feedback/RouteErrorBoundary';
import { ROUTE_RELOAD_ATTEMPTED } from '@/constants/keys';

const realLocation = window.location;
const reload = vi.fn();

/** A page that fails like any ordinary bug. */
function BrokenPage(): ReactNode {
	throw new Error('Cannot read properties of undefined');
}

/** A page whose file a deploy removed (Chrome's wording). */
function StalePage(): ReactNode {
	throw new TypeError(
		'Failed to fetch dynamically imported module: /assets/Page-old.js'
	);
}

/**
 * Renders a page inside the boundary, then removes it, as navigating away
 * would.
 *
 * @param page - The page element to render.
 */
function visit(page: ReactNode) {
	renderWithProviders(
		<RouteErrorBoundary resetKey="first">{page}</RouteErrorBoundary>
	).unmount();
}

beforeEach(() => {
	// jsdom can't reload; replace location with a copy whose reload is a spy
	Object.defineProperty(window, 'location', {
		configurable: true,
		value: { ...realLocation, reload },
	});
	// React and the boundary both log caught errors
	vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
	Object.defineProperty(window, 'location', {
		configurable: true,
		value: realLocation,
	});
	vi.restoreAllMocks();
	reload.mockReset();
	sessionStorage.clear();
});

describe('RouteErrorBoundary', () => {
	it('renders the page when nothing fails', () => {
		renderWithProviders(
			<RouteErrorBoundary resetKey="first">
				<p>Home</p>
			</RouteErrorBoundary>
		);

		expect(screen.getByText('Home')).toBeInTheDocument();
	});

	it('shows the fallback for an ordinary error, without reloading', () => {
		renderWithProviders(
			<RouteErrorBoundary resetKey="first">
				<BrokenPage />
			</RouteErrorBoundary>
		);

		expect(screen.getByText("This page didn't load.")).toBeInTheDocument();
		expect(reload).not.toHaveBeenCalled();
	});

	it('renders the next page after a navigation, not the fallback', () => {
		const { rerender } = renderWithProviders(
			<RouteErrorBoundary resetKey="first">
				<BrokenPage />
			</RouteErrorBoundary>
		);
		expect(screen.getByText("This page didn't load.")).toBeInTheDocument();

		// the visitor follows a link: a new location key and another page
		rerender(
			<RouteErrorBoundary resetKey="second">
				<p>Account</p>
			</RouteErrorBoundary>
		);

		expect(screen.getByText('Account')).toBeInTheDocument();
		expect(
			screen.queryByText("This page didn't load.")
		).not.toBeInTheDocument();
	});

	it("reloads from the fallback's button", async () => {
		renderWithProviders(
			<RouteErrorBoundary resetKey="first">
				<BrokenPage />
			</RouteErrorBoundary>
		);

		await userEvent.click(screen.getByRole('button', { name: 'Reload' }));

		expect(reload).toHaveBeenCalledOnce();
	});

	it('reloads once for a missing page file, not again right after', () => {
		visit(<StalePage />);
		// the reloaded page still can't find the file
		visit(<StalePage />);

		expect(reload).toHaveBeenCalledOnce();
	});

	it('reloads again for a missing page file after the cooldown', () => {
		const now = vi.spyOn(Date, 'now').mockReturnValue(1_000_000);
		visit(<StalePage />);

		// another deploy, a few minutes later in the same tab
		now.mockReturnValue(1_000_000 + 5 * 60_000);
		visit(<StalePage />);

		expect(reload).toHaveBeenCalledTimes(2);
	});

	it('shows the fallback, without reloading, when storage is blocked', () => {
		vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
			throw new DOMException('The operation is insecure.', 'SecurityError');
		});

		renderWithProviders(
			<RouteErrorBoundary resetKey="first">
				<StalePage />
			</RouteErrorBoundary>
		);

		expect(screen.getByText("This page didn't load.")).toBeInTheDocument();
		expect(reload).not.toHaveBeenCalled();
		expect(sessionStorage.length).toBe(0);
	});

	it('saves when it reloaded under its storage key', () => {
		vi.spyOn(Date, 'now').mockReturnValue(1_234_567);

		visit(<StalePage />);

		expect(sessionStorage.getItem(ROUTE_RELOAD_ATTEMPTED)).toBe('1234567');
	});
});
