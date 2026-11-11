import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';

import { NAV_SECTIONS } from '@/constants/navigation';
import { cn } from '@/lib/utils';

/**
 * The row of section links under the brand, one per entry in `NAV_SECTIONS`.
 * `NavLink` gives the current section `aria-current="page"` and the brand
 * colour, underlined. A section stays current on its own sub-pages (one at
 * `/a` is current at `/a/b`); Home is current only at `/`.
 *
 * @returns The section navigation.
 */
export function SectionBar() {
	const { t } = useTranslation();

	return (
		<nav className="border-t-2 border-b-2 border-border-subtle transition-colors duration-200">
			<div className="flex justify-center gap-6">
				{NAV_SECTIONS.map(({ path, labelKey }) => (
					<NavLink
						key={path}
						to={path}
						className={({ isActive }) =>
							cn(
								// uppercase: capitals from CSS, real text in the page (see
								// SectionHeader)
								'cursor-pointer py-1 text-base font-medium whitespace-nowrap uppercase transition-colors md:text-lg',
								isActive
									? 'text-brand underline'
									: 'text-foreground-secondary hover:text-foreground'
							)
						}
					>
						{t(labelKey)}
					</NavLink>
				))}
			</div>
		</nav>
	);
}
