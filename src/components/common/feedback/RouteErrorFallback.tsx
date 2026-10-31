import { useTranslation } from 'react-i18next';

import { buttonVariants } from '@/components/ui/buttonVariants';

/**
 * What `RouteErrorBoundary` shows when a page can't render: a short message
 * and a reload button. A separate component because the boundary has to be a
 * class, and only function components can call `useTranslation()`.
 *
 * @returns The message and the reload button.
 */
export function RouteErrorFallback() {
	const { t } = useTranslation();

	return (
		<section className="flex flex-col items-center gap-4 py-16 text-center">
			<p className="text-foreground-secondary">{t('COMMON.PAGE_ERROR')}</p>
			<button
				type="button"
				onClick={() => window.location.reload()}
				className={buttonVariants({ variant: 'default', size: 'sm' })}
			>
				{t('COMMON.RELOAD')}
			</button>
		</section>
	);
}
