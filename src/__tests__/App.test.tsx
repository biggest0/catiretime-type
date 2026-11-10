import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentType } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// the real English strings for the pages
import '@/i18n/config';
import App from '@/App';
import { AppSettingProvider } from '@/contexts/AppSettingProvider';

// Lets one test make the home page crash, as a bug would. The flag is
// created with vi.hoisted because vi.mock runs before the file's other code.
const homePage = vi.hoisted(() => ({ crashes: false }));
vi.mock('@/pages/HomePage', async (importOriginal) => {
	const actual = await importOriginal<{ default: ComponentType }>();
	return {
		default: function HomeOrCrash() {
			if (homePage.crashes) throw new Error('render bug');
			return <actual.default />;
		},
	};
});

/**
 * Opens the app at an address, as a visitor typing it would.
 *
 * @param path - The address to open.
 */
function openAt(path: string) {
	window.history.pushState({}, '', path);
	// the header's theme toggle needs the settings provider
	render(
		<AppSettingProvider>
			<App />
		</AppSettingProvider>
	);
}

beforeEach(() => {
	// jsdom doesn't scroll; ScrollToTop calls this after each navigation
	vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
});

afterEach(() => {
	homePage.crashes = false;
	window.history.pushState({}, '', '/');
	vi.restoreAllMocks();
});

describe('App', () => {
	it('shows the home page, between the header and the footer', () => {
		openAt('/');

		expect(
			screen.getByRole('heading', { level: 1, name: 'TYPING PRACTICE' })
		).toBeInTheDocument();
		expect(screen.getByRole('banner')).toBeInTheDocument();
		expect(screen.getByRole('main')).toBeInTheDocument();
		expect(screen.getByRole('contentinfo')).toBeInTheDocument();
	});

	it('loads the account page on demand', async () => {
		openAt('/account');

		expect(
			await screen.findByRole('heading', { level: 1, name: 'ACCOUNT' })
		).toBeInTheDocument();
	});

	it('shows the not-found page for an unknown address, with a way home', async () => {
		openAt('/no-such-page');

		expect(
			await screen.findByRole('heading', {
				level: 1,
				name: 'This page wandered off',
			})
		).toBeInTheDocument();

		await userEvent.click(screen.getByRole('link', { name: 'Back to home' }));

		expect(
			screen.getByRole('heading', { level: 1, name: 'TYPING PRACTICE' })
		).toBeInTheDocument();
	});

	it('after a page crashes, a link in the header still opens the next page', async () => {
		// React and the boundary both log the caught error
		vi.spyOn(console, 'error').mockImplementation(() => {});
		homePage.crashes = true;
		openAt('/');
		expect(screen.getByText("This page didn't load.")).toBeInTheDocument();

		// signed out, the header's account icon links to the login page, which
		// shows the not-found page until the auth pages exist
		await userEvent.click(screen.getByRole('link', { name: 'Log In' }));

		expect(
			await screen.findByRole('heading', {
				level: 1,
				name: 'This page wandered off',
			})
		).toBeInTheDocument();
		expect(
			screen.queryByText("This page didn't load.")
		).not.toBeInTheDocument();
	});
});
