import type { Ref } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils';

/** One of the three lines; they turn into an X while the menu is open. */
const LINE = 'h-0.5 w-5 bg-foreground-secondary transition-all duration-300';

interface HamburgerButtonProps {
	isOpen: boolean;
	onClick: () => void;
	ref?: Ref<HTMLButtonElement>;
}

/**
 * The three-line button that opens the mobile menu.
 *
 * @param props.isOpen - Whether the menu is open (draws an X).
 * @param props.onClick - Opens or closes the menu.
 * @param props.ref - The button element, so the menu can give focus back to
 *   it when it closes (React 19 passes `ref` as an ordinary prop).
 * @returns The button.
 */
export function HamburgerButton({
	isOpen,
	onClick,
	ref,
}: HamburgerButtonProps) {
	const { t } = useTranslation();

	return (
		<button
			ref={ref}
			type="button"
			onClick={onClick}
			aria-label={t('NAVIGATION.TOGGLE_MENU')}
			// what base-ui's own dialog trigger tells screen readers: it opens
			// a dialog, and whether that dialog is open
			aria-haspopup="dialog"
			aria-expanded={isOpen}
			className="flex h-6 w-6 cursor-pointer flex-col items-center justify-center"
		>
			<span className={cn(LINE, isOpen && 'translate-y-1.5 rotate-45')} />
			<span className={cn(LINE, 'mt-1', isOpen && 'opacity-0')} />
			<span
				className={cn(LINE, 'mt-1', isOpen && '-translate-y-1.5 -rotate-45')}
			/>
		</button>
	);
}
