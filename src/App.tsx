import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';

import { LoadingOverlay } from '@/components/common/feedback/LoadingOverlay';
import { RouteErrorBoundary } from '@/components/common/feedback/RouteErrorBoundary';
import { Footer } from '@/components/layout/footer/Footer';
import { Header } from '@/components/layout/header/Header';
import { ScrollToTop } from '@/components/layout/navigation/ScrollToTop';
import { PAGE_ROUTES } from '@/constants/routes';
import HomePage from '@/pages/HomePage';

// Every page except the home page loads on demand, from its own file, so a
// visitor downloads only the pages they open. The home page stays in the
// main file: most visits start there.
const AccountPage = lazy(() => import('@/pages/AccountPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

/**
 * The app: the router around the page layout. `main.tsx` renders it inside
 * the Redux store and the settings provider.
 *
 * @returns The app.
 */
export default function App() {
	return (
		<BrowserRouter>
			<AppLayout />
		</BrowserRouter>
	);
}

/**
 * Every page's frame: the header, the current page and the footer. A
 * separate component because reading the location needs the router above it.
 *
 * @returns The header, the page for the current address and the footer.
 */
function AppLayout() {
	// a new key on every navigation, which clears the error boundary
	const location = useLocation();

	return (
		<>
			<Header />
			<main className="mx-auto min-h-screen w-full max-w-[1280px] bg-background px-4 transition-colors duration-200">
				<ScrollToTop />
				{/* Outside Suspense, so it also catches a page file that fails to
				    load: a tab left open across a deploy asks for files that are
				    gone. */}
				<RouteErrorBoundary resetKey={location.key}>
					<Suspense fallback={<LoadingOverlay loading />}>
						<Routes>
							<Route path={PAGE_ROUTES.HOME} element={<HomePage />} />
							<Route path={PAGE_ROUTES.ACCOUNT} element={<AccountPage />} />
							{/* Every other address, including the shell's paths whose
							    pages come later (login, privacy…) */}
							<Route path="*" element={<NotFoundPage />} />
						</Routes>
					</Suspense>
				</RouteErrorBoundary>
			</main>
			<Footer />
		</>
	);
}
