import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';

import { LoadingOverlay } from '@/components/common/feedback/LoadingOverlay';
import { RouteErrorBoundary } from '@/components/common/feedback/RouteErrorBoundary';
import { Footer } from '@/components/layout/footer/Footer';
import { Header } from '@/components/layout/header/Header';
import { RouteFocus } from '@/components/layout/navigation/RouteFocus';
import { ScrollToTop } from '@/components/layout/navigation/ScrollToTop';
import { SkipLink } from '@/components/layout/navigation/SkipLink';
import { PAGE_ROUTES } from '@/constants/routes';
import HomePage from '@/pages/HomePage';
import { MAIN_CONTENT_ID } from '@/utils/a11y/pageFocus';

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
 * Every page's frame: the skip link, the header, the current page and the
 * footer. A separate component because reading the location needs the
 * router above it.
 *
 * Two error boundaries, one inside the other. The inner one is around the
 * page only: when a page fails, the header and footer stay, so the visitor
 * can go elsewhere. The outer one is around the frame itself: if the header,
 * the footer or the menu fails, the visitor gets the same message and Reload
 * button on an otherwise empty page, where React alone would leave nothing
 * at all.
 *
 * @returns The header, the page for the current address and the footer.
 */
function AppLayout() {
	// a new key on every navigation, which clears both error boundaries
	const location = useLocation();

	return (
		<RouteErrorBoundary resetKey={location.key}>
			<SkipLink />
			<Header />
			<main
				id={MAIN_CONTENT_ID}
				className="mx-auto min-h-screen w-full max-w-[1280px] bg-background px-4 transition-colors duration-200"
			>
				{/* After a navigation: back to the top, then focus on the new
				    page's heading */}
				<ScrollToTop />
				<RouteFocus />
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
		</RouteErrorBoundary>
	);
}
