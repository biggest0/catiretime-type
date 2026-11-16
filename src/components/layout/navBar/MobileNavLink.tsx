import { NavLink } from 'react-router-dom';

import { cn } from '@/lib/utils';

interface MobileNavLinkProps {
	linkTo: string;
	linkLabel: string;
	state?: unknown;
}

/**
 * A full-width link in the mobile menu. The link to the current page is
 * amber, underlined and `aria-current="page"`, like the section bar's. The
 * menu closes by itself on any navigation (see `NavBar`), so the link needs
 * no click handler.
 *
 * @param props.linkTo - Where it goes (a path from `routes.ts`).
 * @param props.linkLabel - Its text, already translated.
 * @param props.state - Navigation state for the page it opens (the login
 *   link sends the page the visitor is on).
 * @returns The link.
 */
export function MobileNavLink({
	linkTo,
	linkLabel,
	state,
}: MobileNavLinkProps) {
	return (
		<NavLink
			to={linkTo}
			state={state}
			className={({ isActive }) =>
				cn(
					'flex items-center rounded-md px-4 py-2 transition-colors hover:bg-muted',
					// underlined as well: the two colours alone are too close to
					// tell apart (1.5:1 in light, 1.1:1 in dark)
					isActive ? 'text-brand underline' : 'text-foreground-secondary'
				)
			}
		>
			{linkLabel}
		</NavLink>
	);
}
