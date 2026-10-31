import { DesktopNavigation } from '@/components/layout/navBar/DesktopNavigation';
import { MobileNavigation } from '@/components/layout/navBar/MobileNavigation';

/**
 * The header's top row: the desktop or the mobile version, depending on the
 * screen width (each hides itself at the other size). `relative` is the
 * anchor for the desktop wordmark, which is centred on the whole row.
 *
 * @returns The top row.
 */
export function NavBar() {
	// A <div>, not a <nav>: the row holds the brand and controls, not a list
	// of links. The section bar is the header's only navigation landmark, so
	// screen readers don't list two unnamed "navigation" regions.
	return (
		<div className="relative z-20 flex w-full items-center justify-between py-3">
			<DesktopNavigation />
			<MobileNavigation />
		</div>
	);
}
