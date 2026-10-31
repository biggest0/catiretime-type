import type { IconType } from 'react-icons';
import { CgInstagram } from 'react-icons/cg';
import { RiTwitterXFill } from 'react-icons/ri';
import { TfiYoutube } from 'react-icons/tfi';

import { SOCIAL_PROFILES, type SocialProfileId } from '@/constants/site';
import { cn } from '@/lib/utils';

/** The icon for each profile; the addresses and names are in `site.ts`. */
const ICONS: Record<SocialProfileId, IconType> = {
	instagram: CgInstagram,
	x: RiTwitterXFill,
	youtube: TfiYoutube,
};

interface SocialMediaLinksProps {
	className?: string;
}

/**
 * A row of icon links to Çatire's social profiles, each opening in a new
 * tab and named for screen readers ("Instagram"). Used at the bottom of the
 * mobile menu and in the footer.
 *
 * @param props.className - Extra classes for the row (spacing), merged last.
 * @returns The icon links.
 */
export function SocialMediaLinks({ className }: SocialMediaLinksProps) {
	return (
		<div className={cn('flex gap-4', className)}>
			{SOCIAL_PROFILES.map(({ id, label, url }) => {
				const Icon = ICONS[id];
				return (
					<a
						key={id}
						href={url}
						target="_blank"
						rel="noopener noreferrer"
						aria-label={label}
					>
						<Icon className="h-5 w-5 cursor-pointer text-muted-foreground hover:text-foreground" />
					</a>
				);
			})}
		</div>
	);
}
