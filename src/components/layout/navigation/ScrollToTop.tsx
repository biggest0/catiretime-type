import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * Scrolls to the top when a link (or `navigate()`) opens another page, as a
 * full page load would; without it, a page opened from far down a long page
 * starts scrolled down. Back and Forward are left to the browser's own
 * scroll restoration. React Router's `<ScrollRestoration>` would do both,
 * but it only works with a data router, and this app uses `<BrowserRouter>`.
 * Render it once, inside the router.
 *
 * @returns Nothing visible.
 */
export function ScrollToTop() {
	const { pathname } = useLocation();
	const navigationType = useNavigationType();

	useEffect(() => {
		// PUSH: a link or navigate(). POP: Back, Forward, or the first load.
		// REPLACE: a redirect. Only a PUSH starts a page at the top.
		if (navigationType === 'PUSH') {
			window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
		}
	}, [pathname, navigationType]);

	return null;
}
