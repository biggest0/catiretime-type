import type { RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { LuX } from 'react-icons/lu';

import { SocialMediaLinks } from '@/components/common/social/SocialMediaLinks';
import { ThemeToggle } from '@/components/common/theme/ThemeToggle';
import { UserAccountIcon } from '@/components/common/user/UserAccountIcon';
import { LanguageSwitcherMobile } from '@/components/layout/navBar/LanguageSwitcherMobile';
import { NavigationLinks } from '@/components/layout/navBar/NavigationLinks';
import { Sheet, SheetContent } from '@/components/ui/Sheet';
import { APP_VERSION } from '@/config/config';
import { useSwipeToClose } from '@/hooks/useSwipeToClose';
import { cn } from '@/lib/utils';

interface MobileMenuProps {
	isOpen: boolean;
	onClose: () => void;
	returnFocusRef: RefObject<HTMLButtonElement | null>;
}

/**
 * The full-screen mobile menu, on the `Sheet` primitive (base-ui Dialog):
 * focus trap, Escape, page scroll lock and focus return come with it. On
 * top: the theme toggle and a close button; then the section links, the
 * account link, the language row, the social links, and the app version at
 * the bottom. A swipe to the right closes it too, the panel following the
 * finger. Small screens only: `NavBar` closes it if the window grows to
 * `md`.
 *
 * @param props.isOpen - Whether the menu is showing.
 * @param props.onClose - Closes it (the close button, Escape, a swipe).
 * @param props.returnFocusRef - The menu button, which gets focus back when
 *   the menu closes.
 * @returns The menu (nothing while closed).
 */
export function MobileMenu({
	isOpen,
	onClose,
	returnFocusRef,
}: MobileMenuProps) {
	const { t } = useTranslation();
	const { isDragging, dragOffset, touchHandlers } = useSwipeToClose(onClose);

	return (
		<Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<SheetContent
				side="right"
				showCloseButton={false}
				finalFocus={returnFocusRef}
				// no visible title, so the label names the dialog
				aria-label={t('NAVIGATION.MENU_LABEL')}
				className={cn(
					'border-l-0 bg-background text-foreground-secondary data-[side=right]:w-full data-[side=right]:sm:max-w-none md:hidden',
					// follow the finger without the slide animation's delay
					isDragging && 'transition-none'
				)}
				style={{
					transform: isDragging ? `translateX(${dragOffset}px)` : undefined,
				}}
				{...touchHandlers}
			>
				<div className="flex h-full flex-col justify-between overflow-y-auto p-4">
					<div>
						{/* Top bar: theme toggle left, close button right */}
						<div className="mb-6 flex items-center justify-between">
							<ThemeToggle />
							<button
								type="button"
								onClick={onClose}
								aria-label={t('COMMON.CLOSE')}
								className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-muted"
							>
								<LuX className="h-5 w-5 text-muted-foreground" />
							</button>
						</div>

						<NavigationLinks />

						{/* Account and language */}
						<div className="mt-6 border-t border-border-subtle pt-4">
							<UserAccountIcon variant="full" />
							<div className="mt-4">
								<LanguageSwitcherMobile />
							</div>
						</div>

						<div className="mt-6 flex justify-center border-t border-border-subtle pt-4">
							<SocialMediaLinks />
						</div>
					</div>

					<div className="flex justify-end text-xs text-muted-foreground">
						{APP_VERSION}
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
}
