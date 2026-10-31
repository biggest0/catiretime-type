import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { DesktopNavigation } from '@/components/layout/navBar/DesktopNavigation';
import { MobileMenu } from '@/components/layout/navBar/MobileMenu';
import { MobileNavigation } from '@/components/layout/navBar/MobileNavigation';

/** Tailwind's `md` breakpoint (48rem, 768px), where the mobile row hides. */
const MD_UP = '(min-width: 48rem)';

/**
 * The header's top row: the desktop or the mobile version, depending on the
 * screen width (each hides itself at the other size), and the mobile menu,
 * whose open state lives here. `relative` is the anchor for the desktop
 * wordmark, which is centred on the whole row.
 *
 * @returns The top row and the mobile menu.
 */
export function NavBar() {
	const location = useLocation();
	const [menuOpen, setMenuOpen] = useState(false);
	// the menu gives focus back to its button when it closes
	const menuButtonRef = useRef<HTMLButtonElement>(null);

	// Any navigation closes the menu: a link in it (even to the current page,
	// which still gets a new location key), Back or Forward. Adjusted while
	// rendering, as React's docs recommend over an effect ("You Might Not
	// Need an Effect": adjusting state when a prop changes).
	const [menuLocationKey, setMenuLocationKey] = useState(location.key);
	if (location.key !== menuLocationKey) {
		setMenuLocationKey(location.key);
		setMenuOpen(false);
	}

	// The menu is for small screens. If the window grows to md with it open
	// (a tablet turned sideways), close it: its panel hides at md, but its
	// backdrop would stay over the page and block it (K39).
	useEffect(() => {
		const mdUp = window.matchMedia(MD_UP);
		const closeAtMd = () => {
			if (mdUp.matches) setMenuOpen(false);
		};
		mdUp.addEventListener('change', closeAtMd);
		return () => mdUp.removeEventListener('change', closeAtMd);
	}, []);

	// A <div>, not a <nav>: the row holds the brand and controls, not a list
	// of links. The section bar is the header's only navigation landmark, so
	// screen readers don't list two unnamed "navigation" regions.
	return (
		<div className="relative z-20 flex w-full items-center justify-between py-3">
			<DesktopNavigation />
			<MobileNavigation
				menuOpen={menuOpen}
				onMenuToggle={() => setMenuOpen(!menuOpen)}
				menuButtonRef={menuButtonRef}
			/>
			<MobileMenu
				isOpen={menuOpen}
				onClose={() => setMenuOpen(false)}
				returnFocusRef={menuButtonRef}
			/>
		</div>
	);
}
