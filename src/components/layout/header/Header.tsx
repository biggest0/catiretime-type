import { SectionBar } from '@/components/layout/header/SectionBar';
import { NavBar } from '@/components/layout/navBar/NavBar';

/**
 * The site header: the brand row and the section links, stuck to the top of
 * the window as the page scrolls. Render it once, inside the router.
 *
 * @returns The header.
 */
export function Header() {
	return (
		// Full-bleed so the bar spans the window, with its content held to the
		// same 1280px column as the rest of the page. z-30 keeps it above page
		// content; overlays, menus and side panels sit above it at z-50.
		//
		// Frosted, not opaque: content scrolling under the bar shows through as
		// a soft, blurred tint (bg-background-glass is the page colour at 80%).
		// No scroll listener is needed for "only when scrolled": at the top of
		// the page there is nothing under the bar but page background, so the
		// glass is invisible until content passes beneath it. Browsers without
		// backdrop-filter fall back to the opaque page colour, since a
		// translucent bar without blur just looks broken.
		<header className="sticky top-0 z-30 bg-background supports-backdrop-filter:bg-background-glass supports-backdrop-filter:backdrop-blur-lg">
			<div className="mx-auto w-full max-w-[1280px] px-4">
				<NavBar />
				<SectionBar />
			</div>
		</header>
	);
}
