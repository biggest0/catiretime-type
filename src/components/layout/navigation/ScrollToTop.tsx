import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * Scrolls to the top when a link (or `navigate()`) opens a page, as a full
 * page load would; without it, a page opened from far down a long page
 * starts scrolled down. That includes a link to the page you're already on
 * (the wordmark, on the home page). A link to a place inside a page
 * (`#section`) is left alone. Back and Forward are left to the browser's own
 * scroll restoration. React Router's `<ScrollRestoration>` would do both,
 * but it only works with a data router, and this app uses `<BrowserRouter>`.
 * Render it once, inside the router.
 *
 * @returns Nothing visible.
 */
export function ScrollToTop() {
	// key: new on every navigation, even to the same address
	const { key, pathname, search, hash } = useLocation();
	const navigationType = useNavigationType();
	const address = pathname + search + hash;
	// the address before this navigation
	const previousAddress = useRef(address);

	useEffect(() => {
		const isSameAddress = previousAddress.current === address;
		previousAddress.current = address;

		// PUSH: a link or navigate() to another address. A link to the address
		// you're already on arrives as a REPLACE: React Router doesn't add a
		// second history entry for it. Any other REPLACE is a redirect or an
		// update within the page (a filter in the query string), and POP is
		// Back, Forward or the first load: none of those moves the page.
		const isOpenedByLink =
			navigationType === 'PUSH' ||
			(navigationType === 'REPLACE' && isSameAddress);

		if (isOpenedByLink && !hash) {
			window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
		}
	}, [key, address, hash, navigationType]);

	return null;
}
