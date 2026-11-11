import type { MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { focusPageStart, MAIN_CONTENT_ID } from '@/utils/a11y/pageFocus';

/**
 * "Skip to main content": the first Tab stop on every page, so keyboard
 * users don't have to Tab through the whole header each time. Off screen
 * until it has focus, then shown in the top-left corner. Render it first,
 * before the header.
 *
 * @returns The link.
 */
export function SkipLink() {
	const { t } = useTranslation();

	/**
	 * Moves focus to the content without changing the address: following
	 * the link itself would add `#main-content` to it, and a step to the
	 * visitor's Back history.
	 *
	 * @param event - The click (or Enter) on the link.
	 */
	const skipToContent = (event: MouseEvent<HTMLAnchorElement>) => {
		event.preventDefault();
		focusPageStart();
	};

	return (
		<a
			href={`#${MAIN_CONTENT_ID}`}
			onClick={skipToContent}
			// Parked above the top edge until it has focus, then slid into the
			// corner, over the sticky header (z-30). Not `sr-only`: its
			// counterpart `not-sr-only` resets the padding to zero.
			className="fixed top-2 left-2 z-50 -translate-y-16 bg-background px-4 py-2 text-brand underline focus:translate-y-0"
		>
			{t('NAVIGATION.SKIP_TO_CONTENT')}
		</a>
	);
}
