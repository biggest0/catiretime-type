import { AppLogo } from '@/components/common/brand/AppLogo';
import { AppTitle } from '@/components/layout/navBar/AppTitle';

/**
 * The header's top row from the `md` breakpoint (768px) up: the house icon
 * on the left and the wordmark centred.
 *
 * @returns The desktop row, hidden on small screens.
 */
export function DesktopNavigation() {
	// min-h-8.5 (34px): the wordmark is positioned absolutely, so it doesn't
	// stretch the row; without it the row is as tall as the 24px icons and
	// the 48px wordmark runs into the section bar.
	return (
		<div className="hidden min-h-8.5 w-full items-center justify-between md:flex">
			<AppLogo size="md" />
			<AppTitle variant="desktop" />
		</div>
	);
}
