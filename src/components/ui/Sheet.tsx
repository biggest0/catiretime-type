import { Dialog as SheetPrimitive } from '@base-ui/react/dialog';
import type { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import { LuX } from 'react-icons/lu';

import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

/*
 * A panel that slides in from an edge of the screen, built on base-ui's
 * Dialog: it traps focus, closes on Escape or a click outside, locks page
 * scrolling and returns focus to what opened it. From the shadcn registry
 * (base-sera), adapted like Çatire Time's: react-icons instead of lucide and
 * a translated close label.
 */

/**
 * The sheet's root: holds the open state. Renders no element of its own.
 *
 * @param props - base-ui's `Dialog.Root` props (`open`, `onOpenChange`, …).
 * @returns The sheet's children, connected.
 */
function Sheet({ ...props }: SheetPrimitive.Root.Props) {
	return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

/**
 * The button that opens the sheet.
 *
 * @param props - base-ui's `Dialog.Trigger` props.
 * @returns A `<button>` that opens the sheet.
 */
function SheetTrigger({ ...props }: SheetPrimitive.Trigger.Props) {
	return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

/**
 * A button that closes the sheet, for use inside it.
 *
 * @param props - base-ui's `Dialog.Close` props.
 * @returns A `<button>` that closes the sheet.
 */
function SheetClose({ ...props }: SheetPrimitive.Close.Props) {
	return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

/**
 * Renders its children at the end of `<body>`, above the page.
 *
 * @param props - base-ui's `Dialog.Portal` props.
 * @returns The portal.
 */
function SheetPortal({ ...props }: SheetPrimitive.Portal.Props) {
	return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

/**
 * The dimmed, blurred layer behind the panel. Clicking it closes the sheet.
 *
 * @param props.className - Extra classes, merged last.
 * @returns The overlay.
 */
function SheetOverlay({ className, ...props }: SheetPrimitive.Backdrop.Props) {
	return (
		<SheetPrimitive.Backdrop
			data-slot="sheet-overlay"
			className={cn(
				'fixed inset-0 z-50 bg-black/20 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-sm',
				className
			)}
			{...props}
		/>
	);
}

/**
 * The panel, with its overlay and (by default) a close button in the
 * top-right corner.
 *
 * @param props.side - The edge it slides in from: `right` (default), `left`,
 *   `top` or `bottom`.
 * @param props.showCloseButton - Whether to show the close button (default
 *   true).
 * @param props.children - The panel's content. Include a `SheetTitle`, which
 *   names the panel for screen readers.
 * @param props.className - Extra classes for the panel, merged last.
 * @returns The panel, in a portal.
 */
function SheetContent({
	className,
	children,
	side = 'right',
	showCloseButton = true,
	...props
}: SheetPrimitive.Popup.Props & {
	side?: 'top' | 'right' | 'bottom' | 'left';
	showCloseButton?: boolean;
}) {
	const { t } = useTranslation();
	return (
		<SheetPortal>
			<SheetOverlay />
			<SheetPrimitive.Popup
				data-slot="sheet-content"
				data-side={side}
				className={cn(
					'fixed z-50 flex flex-col bg-popover bg-clip-padding text-sm text-popover-foreground shadow-md transition duration-200 ease-in-out data-ending-style:opacity-0 data-starting-style:opacity-0 data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:h-auto data-[side=bottom]:border-t data-[side=bottom]:data-ending-style:translate-y-[2.5rem] data-[side=bottom]:data-starting-style:translate-y-[2.5rem] data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:h-full data-[side=left]:w-3/4 data-[side=left]:border-r data-[side=left]:data-ending-style:translate-x-[-2.5rem] data-[side=left]:data-starting-style:translate-x-[-2.5rem] data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:h-full data-[side=right]:w-3/4 data-[side=right]:border-l data-[side=right]:data-ending-style:translate-x-[2.5rem] data-[side=right]:data-starting-style:translate-x-[2.5rem] data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:h-auto data-[side=top]:border-b data-[side=top]:data-ending-style:translate-y-[-2.5rem] data-[side=top]:data-starting-style:translate-y-[-2.5rem] data-[side=left]:sm:max-w-sm data-[side=right]:sm:max-w-sm',
					className
				)}
				{...props}
			>
				{children}
				{showCloseButton && (
					<SheetPrimitive.Close
						data-slot="sheet-close"
						render={
							<Button
								variant="ghost"
								className="absolute top-4 right-4 bg-secondary"
								size="icon-sm"
							/>
						}
					>
						<LuX />
						<span className="sr-only">{t('COMMON.CLOSE')}</span>
					</SheetPrimitive.Close>
				)}
			</SheetPrimitive.Popup>
		</SheetPortal>
	);
}

/**
 * The top area of the panel, for the title and description.
 *
 * @param props.className - Extra classes, merged last.
 * @returns A `<div>`.
 */
function SheetHeader({ className, ...props }: ComponentProps<'div'>) {
	return (
		<div
			data-slot="sheet-header"
			className={cn('flex flex-col gap-1.5 p-8', className)}
			{...props}
		/>
	);
}

/**
 * The bottom area of the panel, pushed to the end.
 *
 * @param props.className - Extra classes, merged last.
 * @returns A `<div>`.
 */
function SheetFooter({ className, ...props }: ComponentProps<'div'>) {
	return (
		<div
			data-slot="sheet-footer"
			className={cn('mt-auto flex flex-col gap-2 p-8', className)}
			{...props}
		/>
	);
}

/**
 * The panel's title. Screen readers use it as the panel's name.
 *
 * @param props.className - Extra classes, merged last.
 * @returns A heading.
 */
function SheetTitle({ className, ...props }: SheetPrimitive.Title.Props) {
	return (
		<SheetPrimitive.Title
			data-slot="sheet-title"
			className={cn(
				'font-heading text-lg font-semibold tracking-wider text-foreground uppercase',
				className
			)}
			{...props}
		/>
	);
}

/**
 * A sentence under the title. Screen readers read it after the name.
 *
 * @param props.className - Extra classes, merged last.
 * @returns A paragraph.
 */
function SheetDescription({
	className,
	...props
}: SheetPrimitive.Description.Props) {
	return (
		<SheetPrimitive.Description
			data-slot="sheet-description"
			className={cn(
				'mt-0.5 text-sm leading-relaxed text-muted-foreground',
				className
			)}
			{...props}
		/>
	);
}

export {
	Sheet,
	SheetTrigger,
	SheetClose,
	SheetContent,
	SheetHeader,
	SheetFooter,
	SheetTitle,
	SheetDescription,
};
