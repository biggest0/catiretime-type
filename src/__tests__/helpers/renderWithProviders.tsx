import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';

// the app's real translations: tests read the same English text visitors do
import '@/i18n/config';
import { AppSettingProvider } from '@/contexts/AppSettingProvider';
import { createAppStore } from '@/store/store';

interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
	/** The address the component is rendered at. Default: `/`. */
	route?: string;
}

/**
 * Renders a component with everything the app gives it: the translations, a
 * new Redux store, the settings provider and a router at `route`. Use it for
 * every component test, so a component that starts using the router or the
 * settings doesn't break its tests. The session isn't included: a test that
 * needs a signed-in visitor mocks `useAuth`.
 *
 * To render the whole app (it brings its own router), use `renderApp`.
 *
 * @param ui - The element to render.
 * @param options - `route`, plus Testing Library's own render options.
 * @returns Testing Library's render result (`rerender` keeps the
 *   providers), and the `store`.
 */
export function renderWithProviders(
	ui: ReactElement,
	{ route = '/', ...options }: RenderWithProvidersOptions = {}
) {
	const store = createAppStore();

	/** The providers, in the order main.tsx and App.tsx nest them. */
	const wrapper = ({ children }: { children: ReactNode }) => (
		<Provider store={store}>
			<AppSettingProvider>
				<MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
			</AppSettingProvider>
		</Provider>
	);

	return { store, ...render(ui, { wrapper, ...options }) };
}
