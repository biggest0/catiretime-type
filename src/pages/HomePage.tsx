import { useTranslation } from 'react-i18next';

import { SectionHeader } from '@/components/common/layout/SectionHeader';
import { PageMeta } from '@/components/common/seo/PageMeta';

/**
 * The home page. A placeholder until the app's own content arrives: it names
 * what the app does, with the same title and description search engines get.
 *
 * @returns The home page.
 */
export default function HomePage() {
	const { t } = useTranslation();

	return (
		<section className="py-6">
			{/* no description: PageMeta uses the home description by default */}
			<PageMeta title={t('SEO.HOME.TITLE')} />
			<SectionHeader title={t('SEO.HOME.TITLE')} as="h1" />
			<p className="max-w-2xl text-foreground-secondary">
				{t('SEO.HOME.DESCRIPTION')}
			</p>
		</section>
	);
}
