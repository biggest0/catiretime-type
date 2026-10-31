import { AppLogo } from '@/components/common/brand/AppLogo';
import { AppTitle } from '@/components/layout/navBar/AppTitle';

/**
 * The header's top row below the `md` breakpoint (768px): the house icon and
 * the wordmark.
 *
 * @returns The mobile row, hidden from `md` up.
 */
export function MobileNavigation() {
	return (
		<div className="flex w-full items-center justify-between md:hidden">
			{/* "sm" keeps the house in scale with the smaller wordmark; AppLogo
			    still takes a 24px box (see AppLogo). */}
			<AppLogo size="sm" />
			<AppTitle variant="mobile" />
		</div>
	);
}
