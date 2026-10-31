import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '@/index.css';
import App from '@/App';
import { AppSettingProvider } from '@/contexts/AppSettingProvider';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<AppSettingProvider>
			<App />
		</AppSettingProvider>
	</StrictMode>
);
