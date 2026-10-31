import { cva } from 'class-variance-authority';

/**
 * The button class recipe: give it a variant and a size, get back the
 * classes. `Button` uses it, and it can make a link look like a button
 * without rendering `Button`. Kept out of `Button.tsx` so that file exports
 * only the component, which Fast Refresh needs to hot-swap it.
 *
 * @param options - `variant` and `size` (both optional, see below) and
 *   `className`, extra classes added last.
 * @returns The class string, e.g. `buttonVariants({ variant: 'outline' })`.
 */
export const buttonVariants = cva(
	// every variant: layout, the uppercase newspaper type, the focus ring, and
	// the disabled, invalid and icon styles. The dark: classes are shadcn's
	// opacity tweaks on tokens, the app's one allowed dark: exception
	"group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-xs font-semibold tracking-widest whitespace-nowrap uppercase transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
	{
		variants: {
			variant: {
				// the amber fill: the main action
				default: 'bg-primary text-primary-foreground hover:bg-primary/80',
				// a border, no fill: secondary actions
				outline:
					'border-border bg-transparent hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-input/30',
				// a grey fill
				secondary:
					'bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground',
				// no fill or border until hovered: icon buttons, menu triggers
				ghost:
					'hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50',
				// a red tint: actions that delete or can't be undone
				destructive:
					'bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40',
				// looks like a text link
				link: 'text-primary underline underline-offset-4 hover:underline',
			},
			// heights from 28 px (xs) to 44 px (lg); icon-* sizes are square
			size: {
				default:
					'h-10 gap-1.5 px-6 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4',
				xs: "h-7 gap-1 px-3 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3",
				sm: 'h-9 gap-1 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3',
				lg: 'h-11 gap-1.5 px-8 has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5',
				icon: 'size-10',
				'icon-xs': "size-7 [&_svg:not([class*='size-'])]:size-3",
				'icon-sm': 'size-9',
				'icon-lg': 'size-11',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	}
);
