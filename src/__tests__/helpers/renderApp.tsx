import { render } from '@testing-library/react';
import { Provider } from 'react-redux';

// the app's real translations: tests read the same English text visitors do
import '@/i18n/config';
import App from '@/App';
import { AppSettingProvider } from '@/contexts/AppSettingProvider';
import { createAppStore } from '@/store/store';

/**
 * Renders the whole app at an address, as a visitor typing it would, inside
 * what main.tsx wraps it in. The app brings its own router, which reads the
 * browser's address, so that is set first.
 *
 * jsdom can't scroll: the test stubs `window.scrollTo`, which the app calls
 * after each navigation.
 *
 * @param path - The address to open. Default: `/`.
 * @returns Testing Library's render result.
 */
export function renderApp(path = '/') {
	window.history.pushState({}, '', path);

	return render(
		<Provider store={createAppStore()}>
			<AppSettingProvider>
				<App />
			</AppSettingProvider>
		</Provider>
	);
}
