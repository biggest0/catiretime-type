import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';

import '@/index.css';
// starts i18next (and keeps <html lang> in step) before the first render
import '@/i18n/config';
import App from '@/App';
import { authStore } from '@/auth/authStore';
import { AppSettingProvider } from '@/contexts/AppSettingProvider';
import { store } from '@/store/store';

// Check the session once per page load, before the first render. Not in a
// component's effect: StrictMode runs effects twice in development, and each
// refresh replaces the session cookie. Pages wait while
// useAuth().isLoading is true.
void authStore.bootstrap();

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<Provider store={store}>
			<AppSettingProvider>
				<App />
			</AppSettingProvider>
		</Provider>
	</StrictMode>
);
