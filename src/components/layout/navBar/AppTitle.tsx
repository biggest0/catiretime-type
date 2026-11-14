import { Link } from 'react-router-dom';

import CatBackground from '@/assets/app_title_background_cat.svg';
import { PAGE_ROUTES } from '@/constants/routes';
import { SITE_NAME } from '@/constants/site';
import { cn } from '@/lib/utils';

// A brand name, so it isn't translated. Shown in capitals, its first letter
// over the cat drawing.
const WORDMARK = SITE_NAME.toUpperCase();

interface AppTitleProps {
	variant?: 'desktop' | 'mobile';
}

/**
 * The wordmark (`SITE_NAME` in capitals), a link home as readers expect a
 * masthead to be; `AppLogo`'s house icon is the other, icon-only way home.
 *
 * @param props.variant - `desktop` (default) is centred on the whole header
 *   row and grows on wide screens; `mobile` is smaller and sits in the row.
 * @returns The wordmark link.
 */
export function AppTitle({ variant = 'desktop' }: AppTitleProps) {
	return (
		// aria-label: the first letter's inline-block box makes Chrome read
		// the name as "Ç ATIRE TYPE", split in two. The label gives screen
		// readers the name in one piece, in normal case.
		<Link
			to={PAGE_ROUTES.HOME}
			aria-label={SITE_NAME}
			className={cn(
				'font-semibold tracking-wide text-foreground',
				variant === 'desktop'
					? 'absolute left-1/2 -translate-x-1/2 text-3xl lg:text-5xl'
					: 'text-2xl'
			)}
		>
			<span className="relative inline-block">
				<span className="relative z-10">{WORDMARK.charAt(0)}</span>
				{/* Decorative, so no alt text. An image can't take a colour
				    token, so dark mode inverts it (a documented dark: exception). */}
				<img
					src={CatBackground}
					alt=""
					className="absolute top-[52%] left-1/2 -z-10 h-5 w-5 -translate-x-1/2 -translate-y-1/2 md:top-[54%] md:h-6 md:w-6 lg:top-[57%] lg:h-9 lg:w-9 dark:opacity-80 dark:invert"
				/>
			</span>
			{WORDMARK.slice(1)}
		</Link>
	);
}
