import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import CatLoading from '@/assets/cat_loading.gif';
import CatLoadingDark from '@/assets/cat_loading_dark.gif';
import { useAppSettings } from '@/hooks/useAppSettings';
import { cn } from '@/lib/utils';

/** How long the fade-out lasts, in ms. Keep equal to `duration-300` below. */
const FADE_OUT_MS = 300;

interface LoadingOverlayProps {
	loading: boolean;
}

/**
 * A full-screen loading cat with "Loading...". It fades out when `loading`
 * turns false, but only if it stays rendered: write
 * `<LoadingOverlay loading={isLoading} />`, not
 * `if (isLoading) return <LoadingOverlay loading />`, which removes it at
 * once. As a `Suspense` fallback it simply disappears when the page is ready.
 *
 * @param props.loading - Whether something is loading.
 * @returns The overlay, or nothing once it has faded out.
 */
export function LoadingOverlay({ loading }: LoadingOverlayProps) {
	const { t } = useTranslation();
	const { isDarkMode } = useAppSettings();
	const [show, setShow] = useState(loading);

	// show at once; hide only after the fade-out has played
	useEffect(() => {
		if (loading) setShow(true);
		else {
			const timer = setTimeout(() => setShow(false), FADE_OUT_MS);
			return () => clearTimeout(timer);
		}
	}, [loading]);

	return (
		show && (
			<div
				role="status"
				className={cn(
					'fixed inset-0 z-50 flex flex-col items-center justify-center bg-background text-foreground-secondary transition-opacity duration-300',
					loading ? 'opacity-100' : 'opacity-0'
				)}
			>
				{/* One <img> picked here rather than two swapped with dark:
				    classes: a hidden <img> is still downloaded. alt is empty
				    because the text below already says it's loading. */}
				<img
					src={isDarkMode ? CatLoadingDark : CatLoading}
					alt=""
					className="h-32 w-32"
				/>
				<div>{t('COMMON.LOADING')}</div>
			</div>
		)
	);
}
