import { useTranslation } from 'react-i18next';

import { MobileNavLink } from '@/components/layout/navBar/MobileNavLink';
import { NAV_SECTIONS } from '@/constants/navigation';

/**
 * The mobile menu's section links, one per entry in `NAV_SECTIONS` (the same
 * list as the section bar).
 *
 * @returns The links, stacked.
 */
export function NavigationLinks() {
	const { t } = useTranslation();

	return (
		<div className="space-y-4">
			{NAV_SECTIONS.map(({ path, labelKey }) => (
				<MobileNavLink key={path} linkTo={path} linkLabel={t(labelKey)} />
			))}
		</div>
	);
}
