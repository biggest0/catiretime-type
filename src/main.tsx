import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '@/index.css';
import App from '@/App';
import { authStore } from '@/auth/authStore';
import { AppSettingProvider } from '@/contexts/AppSettingProvider';

// Check the session once per page load, before the first render. Not in a
// component's effect: StrictMode runs effects twice in development, and each
// refresh replaces the session cookie. Pages wait while
// useAuth().isLoading is true.
void authStore.bootstrap();

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<AppSettingProvider>
			<App />
		</AppSettingProvider>
	</StrictMode>
);
