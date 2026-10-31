import { Menu as MenuPrimitive } from '@base-ui/react/menu';
import type { ComponentProps } from 'react';
import { GoChevronRight } from 'react-icons/go';
import { IoCheckmark } from 'react-icons/io5';

import { cn } from '@/lib/utils';

/*
 * Accessible dropdown menu built on base-ui's Menu: keyboard navigation,
 * focus management and ARIA roles come with it. From the shadcn registry
 * (base-sera), adapted like Çatire Time's: react-icons instead of lucide, and
 * the panel and plain items restyled to the app's tokens (normal case,
 * text-sm). Radio items share the plain items' look; checkbox items and
 * submenu triggers still have upstream's (capitals, text-xs), since nothing
 * uses them yet. Corners use the radius scale, so they follow --radius.
 */

/**
 * The menu's root: holds the open state and links the trigger to the panel.
 * Renders no element of its own.
 *
 * @param props - base-ui's `Menu.Root` props (`open`, `onOpenChange`, …).
 * @returns The menu's children, connected.
 */
function DropdownMenu({ ...props }: MenuPrimitive.Root.Props) {
	return <MenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

/**
 * Renders its children at the end of `<body>`, above the page.
 *
 * @param props - base-ui's `Menu.Portal` props.
 * @returns The portal.
 */
function DropdownMenuPortal({ ...props }: MenuPrimitive.Portal.Props) {
	return <MenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />;
}

/**
 * The button that opens the menu. Use `render` to make another element the
 * trigger, e.g. `render={<Button variant="ghost" />}`.
 *
 * @param props - base-ui's `Menu.Trigger` props.
 * @returns A `<button>` that toggles the menu.
 */
function DropdownMenuTrigger({ ...props }: MenuPrimitive.Trigger.Props) {
	return <MenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />;
}

/**
 * The panel: placed next to the trigger, kept inside the screen, and animated
 * in and out.
 *
 * @param props.align - Which edge of the trigger it lines up with: `start`
 *   (default), `center` or `end`.
 * @param props.alignOffset - Shift along that edge, in px (default 0).
 * @param props.side - Which side of the trigger it opens on (default
 *   `bottom`).
 * @param props.sideOffset - Gap from the trigger, in px (default 4).
 * @param props.className - Extra classes for the panel, merged last.
 * @returns The positioned panel, in a portal.
 */
function DropdownMenuContent({
	align = 'start',
	alignOffset = 0,
	side = 'bottom',
	sideOffset = 4,
	className,
	...props
}: MenuPrimitive.Popup.Props &
	Pick<
		MenuPrimitive.Positioner.Props,
		'align' | 'alignOffset' | 'side' | 'sideOffset'
	>) {
	return (
		<MenuPrimitive.Portal>
			<MenuPrimitive.Positioner
				className="isolate z-50 outline-none"
				align={align}
				alignOffset={alignOffset}
				side={side}
				sideOffset={sideOffset}
			>
				<MenuPrimitive.Popup
					data-slot="dropdown-menu-content"
					className={cn(
						'z-50 max-h-(--available-height) min-w-48 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-lg border border-border-subtle bg-popover py-1 text-popover-foreground shadow-lg duration-100 outline-none data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:overflow-hidden data-closed:fade-out-0 data-closed:zoom-out-95',
						className
					)}
					{...props}
				/>
			</MenuPrimitive.Positioner>
		</MenuPrimitive.Portal>
	);
}

/**
 * Groups related items, optionally under a `DropdownMenuLabel`.
 *
 * @param props - base-ui's `Menu.Group` props.
 * @returns The group.
 */
function DropdownMenuGroup({ ...props }: MenuPrimitive.Group.Props) {
	return <MenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />;
}

/**
 * A small heading for a group. Screen readers announce it with the group.
 *
 * @param props.inset - Indent it to line up with items that have an icon.
 * @param props.className - Extra classes, merged last.
 * @returns The label.
 */
function DropdownMenuLabel({
	className,
	inset,
	...props
}: MenuPrimitive.GroupLabel.Props & {
	inset?: boolean;
}) {
	return (
		<MenuPrimitive.GroupLabel
			data-slot="dropdown-menu-label"
			data-inset={inset}
			className={cn(
				'px-3 py-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase data-inset:pl-9.5',
				className
			)}
			{...props}
		/>
	);
}

/**
 * One choice in the menu. Choosing it runs `onClick` and closes the menu.
 *
 * @param props.inset - Indent it to line up with items that have an icon.
 * @param props.variant - `default`, or `destructive` (red) for actions that
 *   delete or can't be undone.
 * @param props.className - Extra classes, merged last.
 * @returns The item.
 */
function DropdownMenuItem({
	className,
	inset,
	variant = 'default',
	...props
}: MenuPrimitive.Item.Props & {
	inset?: boolean;
	variant?: 'default' | 'destructive';
}) {
	return (
		<MenuPrimitive.Item
			data-slot="dropdown-menu-item"
			data-inset={inset}
			data-variant={variant}
			className={cn(
				"group/dropdown-menu-item relative flex cursor-pointer items-center gap-2 px-4 py-2 text-sm text-foreground-secondary outline-hidden select-none focus:bg-muted focus:text-foreground data-inset:pl-9.5 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-[variant=destructive]:*:[svg]:text-destructive",
				className
			)}
			{...props}
		/>
	);
}

/**
 * The root of a submenu: a `DropdownMenuSubTrigger` plus a
 * `DropdownMenuSubContent`, inside a menu.
 *
 * @param props - base-ui's `Menu.SubmenuRoot` props.
 * @returns The submenu's children, connected.
 */
function DropdownMenuSub({ ...props }: MenuPrimitive.SubmenuRoot.Props) {
	return <MenuPrimitive.SubmenuRoot data-slot="dropdown-menu-sub" {...props} />;
}

/**
 * The item that opens a submenu, with an arrow at its end.
 *
 * @param props.inset - Indent it to line up with items that have an icon.
 * @param props.children - Its text.
 * @param props.className - Extra classes, merged last.
 * @returns The submenu trigger.
 */
function DropdownMenuSubTrigger({
	className,
	inset,
	children,
	...props
}: MenuPrimitive.SubmenuTrigger.Props & {
	inset?: boolean;
}) {
	return (
		<MenuPrimitive.SubmenuTrigger
			data-slot="dropdown-menu-sub-trigger"
			data-inset={inset}
			className={cn(
				"flex cursor-default items-center gap-2 rounded-md px-3 py-2 text-xs font-medium tracking-wider uppercase outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:pl-9.5 data-popup-open:bg-accent data-popup-open:text-accent-foreground data-open:bg-accent data-open:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
				className
			)}
			{...props}
		>
			{children}
			<GoChevronRight className="ml-auto" />
		</MenuPrimitive.SubmenuTrigger>
	);
}

/**
 * A submenu's panel. Opens beside its trigger by default.
 *
 * @param props - The same props as `DropdownMenuContent`, with defaults for
 *   a side panel (`side` right, `sideOffset` 0, `alignOffset` -3).
 * @returns The submenu panel.
 */
function DropdownMenuSubContent({
	align = 'start',
	alignOffset = -3,
	side = 'right',
	sideOffset = 0,
	className,
	...props
}: ComponentProps<typeof DropdownMenuContent>) {
	return (
		<DropdownMenuContent
			data-slot="dropdown-menu-sub-content"
			className={cn(
				'w-auto min-w-36 rounded-lg bg-popover p-1.5 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
				className
			)}
			align={align}
			alignOffset={alignOffset}
			side={side}
			sideOffset={sideOffset}
			{...props}
		/>
	);
}

/**
 * An item that toggles on and off, with a tick when on.
 *
 * @param props.checked - Whether it's on (controlled).
 * @param props.inset - Indent it to line up with items that have an icon.
 * @param props.children - Its text.
 * @param props.className - Extra classes, merged last.
 * @returns The checkbox item.
 */
function DropdownMenuCheckboxItem({
	className,
	children,
	checked,
	inset,
	...props
}: MenuPrimitive.CheckboxItem.Props & {
	inset?: boolean;
}) {
	return (
		<MenuPrimitive.CheckboxItem
			data-slot="dropdown-menu-checkbox-item"
			data-inset={inset}
			className={cn(
				"relative flex cursor-default items-center gap-2.5 rounded-md py-2 pr-8 pl-3 text-xs font-medium tracking-wider uppercase outline-hidden select-none focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-inset:pl-9.5 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
				className
			)}
			checked={checked}
			{...props}
		>
			<span
				className="pointer-events-none absolute right-2 flex items-center justify-center"
				data-slot="dropdown-menu-checkbox-item-indicator"
			>
				<MenuPrimitive.CheckboxItemIndicator>
					<IoCheckmark />
				</MenuPrimitive.CheckboxItemIndicator>
			</span>
			{children}
		</MenuPrimitive.CheckboxItem>
	);
}

/**
 * A set of `DropdownMenuRadioItem`s where exactly one is chosen.
 *
 * @param props - base-ui's `Menu.RadioGroup` props (`value`,
 *   `onValueChange`).
 * @returns The radio group.
 */
function DropdownMenuRadioGroup({ ...props }: MenuPrimitive.RadioGroup.Props) {
	return (
		<MenuPrimitive.RadioGroup
			data-slot="dropdown-menu-radio-group"
			{...props}
		/>
	);
}

/**
 * One option of a radio group, with a tick on the right when chosen. Styled
 * like `DropdownMenuItem`; screen readers hear it as checked or not. It stays
 * open when clicked unless given `closeOnClick`.
 *
 * @param props.inset - Indent it to line up with items that have an icon.
 * @param props.children - Its text.
 * @param props.className - Extra classes, merged last.
 * @returns The radio item.
 */
function DropdownMenuRadioItem({
	className,
	children,
	inset,
	...props
}: MenuPrimitive.RadioItem.Props & {
	inset?: boolean;
}) {
	return (
		<MenuPrimitive.RadioItem
			data-slot="dropdown-menu-radio-item"
			data-inset={inset}
			className={cn(
				"relative flex cursor-pointer items-center gap-2 py-2 pr-10 pl-4 text-sm text-foreground-secondary outline-hidden select-none focus:bg-muted focus:text-foreground data-inset:pl-9.5 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
				className
			)}
			{...props}
		>
			<span
				className="pointer-events-none absolute right-4 flex items-center justify-center"
				data-slot="dropdown-menu-radio-item-indicator"
			>
				<MenuPrimitive.RadioItemIndicator>
					<IoCheckmark />
				</MenuPrimitive.RadioItemIndicator>
			</span>
			{children}
		</MenuPrimitive.RadioItem>
	);
}

/**
 * A thin line between groups of items.
 *
 * @param props.className - Extra classes, merged last.
 * @returns The separator.
 */
function DropdownMenuSeparator({
	className,
	...props
}: MenuPrimitive.Separator.Props) {
	return (
		<MenuPrimitive.Separator
			data-slot="dropdown-menu-separator"
			className={cn('-mx-1.5 my-1.5 h-px bg-border/50', className)}
			{...props}
		/>
	);
}

/**
 * A keyboard shortcut hint at the end of an item, such as `⌘S`.
 *
 * @param props.className - Extra classes, merged last.
 * @returns The hint.
 */
function DropdownMenuShortcut({ className, ...props }: ComponentProps<'span'>) {
	return (
		<span
			data-slot="dropdown-menu-shortcut"
			className={cn(
				'ml-auto text-xs tracking-widest text-muted-foreground group-focus/dropdown-menu-item:text-accent-foreground',
				className
			)}
			{...props}
		/>
	);
}

export {
	DropdownMenu,
	DropdownMenuPortal,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuLabel,
	DropdownMenuItem,
	DropdownMenuCheckboxItem,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuSub,
	DropdownMenuSubTrigger,
	DropdownMenuSubContent,
};
