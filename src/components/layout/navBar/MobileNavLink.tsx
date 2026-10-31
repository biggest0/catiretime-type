import { NavLink } from 'react-router-dom';

import { cn } from '@/lib/utils';

interface MobileNavLinkProps {
	linkTo: string;
	linkLabel: string;
}

/**
 * A full-width link in the mobile menu. The link to the current page is
 * amber and `aria-current="page"`, like the section bar's. The menu closes by
 * itself on any navigation (see `NavBar`), so the link needs no click
 * handler.
 *
 * @param props.linkTo - Where it goes (a path from `routes.ts`).
 * @param props.linkLabel - Its text, already translated.
 * @returns The link.
 */
export function MobileNavLink({ linkTo, linkLabel }: MobileNavLinkProps) {
	return (
		<NavLink
			to={linkTo}
			className={({ isActive }) =>
				cn(
					'flex items-center rounded-md px-4 py-2 transition-colors hover:bg-muted',
					isActive ? 'text-brand' : 'text-foreground-secondary'
				)
			}
		>
			{linkLabel}
		</NavLink>
	);
}
