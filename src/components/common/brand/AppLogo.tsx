import { useTranslation } from 'react-i18next';
import { LuHouse } from 'react-icons/lu';
import { Link } from 'react-router-dom';

import { PAGE_ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';

const ICON_SIZES = {
	sm: 'h-5 w-5',
	md: 'h-6 w-6',
} as const;

interface AppLogoProps {
	size?: keyof typeof ICON_SIZES;
}

/**
 * A house icon that links home, at the left end of the header. A placeholder
 * until the app has a real logo.
 *
 * @param props.size - The icon's size: `sm` (20px) or `md` (24px, default).
 * @returns The home link.
 */
export function AppLogo({ size = 'md' }: AppLogoProps) {
	const { t } = useTranslation();

	// Fixed 24px box whatever the icon size: it matches the menu button
	// opposite in the mobile header, and `justify-between` there shifts the
	// centred wordmark by half of any difference between the two ends. It
	// also keeps the tap target at 24px when the icon inside is smaller.
	return (
		<Link
			to={PAGE_ROUTES.HOME}
			aria-label={t('NAVIGATION.HOME')}
			className="flex h-6 w-6 items-center justify-center"
		>
			<LuHouse
				className={cn(
					'cursor-pointer transition-colors hover:text-foreground',
					ICON_SIZES[size]
				)}
			/>
		</Link>
	);
}
