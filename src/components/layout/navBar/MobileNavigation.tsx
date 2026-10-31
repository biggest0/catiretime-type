import type { Ref } from 'react';

import { AppLogo } from '@/components/common/brand/AppLogo';
import { AppTitle } from '@/components/layout/navBar/AppTitle';
import { HamburgerButton } from '@/components/layout/navBar/HamburgerButton';

interface MobileNavigationProps {
	menuOpen: boolean;
	onMenuToggle: () => void;
	menuButtonRef?: Ref<HTMLButtonElement>;
}

/**
 * The header's top row below the `md` breakpoint (768px): the house icon,
 * the wordmark, and the button that opens the mobile menu.
 *
 * @param props.menuOpen - Whether the mobile menu is open.
 * @param props.onMenuToggle - Opens or closes it.
 * @param props.menuButtonRef - Passed to the menu button, so the menu can
 *   give focus back to it.
 * @returns The mobile row, hidden from `md` up.
 */
export function MobileNavigation({
	menuOpen,
	onMenuToggle,
	menuButtonRef,
}: MobileNavigationProps) {
	return (
		<div className="flex w-full items-center justify-between md:hidden">
			{/* "sm" keeps the house in scale with the menu button opposite it.
			    Both ends take a 24px box, which keeps the wordmark centred:
			    with justify-between, unequal ends would shift it by half the
			    difference. */}
			<AppLogo size="sm" />
			<AppTitle variant="mobile" />
			<HamburgerButton
				ref={menuButtonRef}
				isOpen={menuOpen}
				onClick={onMenuToggle}
			/>
		</div>
	);
}
