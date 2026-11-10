import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { PageMeta } from '@/components/common/seo/PageMeta';
import { buttonVariants } from '@/components/ui/buttonVariants';
import { PAGE_ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';

/**
 * The page for any address the app has no page for, including the shell's
 * paths whose pages come later. It links back to the home page.
 *
 * @returns The not-found page.
 */
export default function NotFoundPage() {
	const { t } = useTranslation();

	return (
		<section className="flex flex-col items-center gap-4 py-16 text-center">
			<PageMeta
				title={t('SEO.NOT_FOUND.TITLE')}
				description={t('SEO.NOT_FOUND.DESCRIPTION')}
				noindex
			/>
			{/* a numeral, the same in every language */}
			<p className="font-heading text-6xl text-brand">404</p>
			<h1 className="text-2xl text-foreground">{t('PAGES.NOT_FOUND.TITLE')}</h1>
			<p className="max-w-md text-foreground-secondary">
				{t('PAGES.NOT_FOUND.MESSAGE')}
			</p>
			<Link
				to={PAGE_ROUTES.HOME}
				className={cn(buttonVariants({ size: 'sm' }), 'mt-2')}
			>
				{t('PAGES.NOT_FOUND.HOME')}
			</Link>
		</section>
	);
}
