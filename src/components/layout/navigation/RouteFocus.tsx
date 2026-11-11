import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

import { focusPageStart } from '@/utils/a11y/pageFocus';

/**
 * Moves keyboard focus to the new page's heading after every navigation, as
 * a full page load would reset it. Without it, focus stays on the link that
 * was followed (often in the footer, now off screen) and a screen reader
 * says nothing: the visitor can't tell the page changed. The first load is
 * left alone, so Tab starts at the top, on the skip link. Render it once,
 * inside the router.
 *
 * @returns Nothing visible.
 */
export function RouteFocus() {
	const location = useLocation();
	// the key of the page focus was last moved for; at first, the one the
	// app opened on
	const focusedKey = useRef(location.key);

	useEffect(() => {
		// the same page: the first load (and StrictMode's repeat of it)
		if (focusedKey.current === location.key) return;

		focusedKey.current = location.key;
		focusPageStart();
	}, [location.key]);

	return null;
}
