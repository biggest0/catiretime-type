import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { SocialMediaLinks } from '@/components/common/social/SocialMediaLinks';
import { PAGE_ROUTES } from '@/constants/routes';
import { PARENT_SITE, SITE_NAME } from '@/constants/site';

/**
 * The site footer, below every page: the app's name, its tagline and
 * Çatire's social links, then a bottom row with the copyright notice (whose
 * name links to Çatire Time) and the privacy link. Its links sit in a
 * `<div>`, not a `<nav>`: the section bar is the page's only navigation
 * landmark.
 *
 * @returns The footer.
 */
export function Footer() {
	const { t } = useTranslation();
	// Read from the visitor's clock, so the notice never needs a yearly edit
	// (Çatire types the year into its translation files).
	const year = new Date().getFullYear();

	return (
		<footer className="mx-auto mt-6 w-full max-w-[1280px] border-t border-border-subtle bg-background transition-colors duration-200">
			{/* Name, tagline and social links: centred on phones, on the left
			    from md */}
			<div className="flex flex-col items-center space-y-4 px-4 py-12 md:items-start">
				<div className="text-2xl font-bold text-foreground">{SITE_NAME}</div>
				<div className="text-sm text-foreground-secondary">
					{t('FOOTER.BRAND_TAGLINE', { parentSite: PARENT_SITE.name })}
				</div>
				{/* Çatire's spacing: its icon row had this margin built in */}
				<SocialMediaLinks className="mt-2" />
			</div>

			{/* Bottom row: the copyright on its own line on phones, the links
			    beside it from sm */}
			<div className="flex flex-col items-center gap-2 border-t border-border-subtle py-6 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:justify-center sm:gap-6">
				{/* A brand name and a year, the same in every language, so no
				    translation key. The name is underlined: inside a line of
				    text, a link needs a cue besides colour (WCAG F73). */}
				<span className="shrink-0">
					<a
						href={PARENT_SITE.url}
						className="underline transition-colors hover:text-foreground"
					>
						{PARENT_SITE.name}
					</a>{' '}
					© {year}
				</span>
				<div className="flex flex-wrap justify-center gap-6">
					<Link
						to={PAGE_ROUTES.PRIVACY}
						className="transition-colors hover:text-foreground"
					>
						{t('FOOTER.PRIVACY')}
					</Link>
				</div>
			</div>
		</footer>
	);
}
