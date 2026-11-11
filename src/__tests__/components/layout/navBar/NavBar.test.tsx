import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

// the real English strings for the labels
import '@/i18n/config';
import { NavBar } from '@/components/layout/navBar/NavBar';
import { APP_VERSION } from '@/config/config';
import { AppSettingProvider } from '@/contexts/AppSettingProvider';

afterEach(() => {
	vi.restoreAllMocks();
});

/** The media query `NavBar` listens to: Tailwind's `md` breakpoint. */
const MD_UP = '(min-width: 48rem)';

type MediaListener = (event: { matches: boolean }) => void;

/**
 * Replaces `matchMedia` with a fake screen that starts narrow and can be
 * widened. Every other query (the OS theme) reports no match.
 *
 * @returns A function that widens the screen to `md` and tells the `md`
 *   listeners, as the browser does when a tablet turns sideways.
 */
function mockNarrowScreen(): () => void {
	const mdListeners = new Set<MediaListener>();
	let isMdUp = false;

	vi.spyOn(window, 'matchMedia').mockImplementation(
		(query: string) =>
			({
				get matches() {
					return query === MD_UP && isMdUp;
				},
				media: query,
				addEventListener: (_type: string, listener: MediaListener) => {
					if (query === MD_UP) mdListeners.add(listener);
				},
				removeEventListener: (_type: string, listener: MediaListener) => {
					mdListeners.delete(listener);
				},
			}) as unknown as MediaQueryList
	);

	return () => {
		isMdUp = true;
		mdListeners.forEach((listener) => listener({ matches: true }));
	};
}

/**
 * Renders the top row on the home page and opens the mobile menu.
 *
 * @returns The menu dialog.
 */
async function openMenu() {
	// the theme toggle in the menu needs the settings provider
	render(
		<AppSettingProvider>
			<MemoryRouter>
				<NavBar />
			</MemoryRouter>
		</AppSettingProvider>
	);
	await userEvent.click(screen.getByRole('button', { name: 'Toggle menu' }));
	return screen.findByRole('dialog', { name: 'Navigation menu' });
}

describe('NavBar mobile menu', () => {
	it('opens a named menu with the sections, the account link and the version', async () => {
		mockNarrowScreen();
		const menu = await openMenu();

		// the home page is the current one
		expect(within(menu).getByRole('link', { name: 'Home' })).toHaveAttribute(
			'aria-current',
			'page'
		);
		expect(within(menu).getByRole('link', { name: 'Log In' })).toBeVisible();
		expect(within(menu).getByText(APP_VERSION)).toBeInTheDocument();
	});

	it('tells screen readers that its button opens a dialog, and when', async () => {
		mockNarrowScreen();
		render(
			<AppSettingProvider>
				<MemoryRouter>
					<NavBar />
				</MemoryRouter>
			</AppSettingProvider>
		);
		const menuButton = screen.getByRole('button', { name: 'Toggle menu' });
		expect(menuButton).toHaveAttribute('aria-haspopup', 'dialog');
		expect(menuButton).toHaveAttribute('aria-expanded', 'false');

		await userEvent.click(menuButton);
		await screen.findByRole('dialog', { name: 'Navigation menu' });

		// the open menu hides everything else from screen readers, its button
		// included, so it's found by its element
		expect(
			document.querySelector('button[aria-haspopup="dialog"]')
		).toHaveAttribute('aria-expanded', 'true');
	});

	it('closes when a link in it is followed, even to the current page', async () => {
		mockNarrowScreen();
		const menu = await openMenu();

		await userEvent.click(within(menu).getByRole('link', { name: 'Home' }));

		await waitFor(() =>
			expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
		);
	});

	it('closes from its close button and gives focus back to the menu button', async () => {
		mockNarrowScreen();
		const menu = await openMenu();

		await userEvent.click(within(menu).getByRole('button', { name: 'Close' }));

		await waitFor(() =>
			expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
		);
		expect(screen.getByRole('button', { name: 'Toggle menu' })).toHaveFocus();
	});

	it('closes when the screen widens to md', async () => {
		const widenToMd = mockNarrowScreen();
		await openMenu();

		widenToMd();

		await waitFor(() =>
			expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
		);
	});
});
