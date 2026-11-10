import { useTranslation } from 'react-i18next';

import { SectionHeader } from '@/components/common/layout/SectionHeader';
import { PageMeta } from '@/components/common/seo/PageMeta';

/**
 * The account page. A placeholder: the account details and sign-out come
 * with the auth pages, which also keep signed-out visitors away from it.
 *
 * @returns The account page.
 */
export default function AccountPage() {
	const { t } = useTranslation();

	return (
		<section className="py-6">
			{/* a visitor's own page: kept out of search results */}
			<PageMeta title={t('SEO.ACCOUNT.TITLE')} noindex />
			<SectionHeader title={t('PAGES.ACCOUNT.TITLE')} as="h1" />
		</section>
	);
}
