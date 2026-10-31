import { Button as ButtonPrimitive } from '@base-ui/react/button';
import type { VariantProps } from 'class-variance-authority';

import { buttonVariants } from '@/components/ui/buttonVariants';
import { cn } from '@/lib/utils';

interface ButtonProps
	extends ButtonPrimitive.Props, VariantProps<typeof buttonVariants> {}

/**
 * The app's button: base-ui's accessible button, styled by `buttonVariants`.
 * Use it for actions. For navigation, give a link the `buttonVariants`
 * classes instead.
 *
 * @param props.variant - The look: `default` (amber fill), `outline`,
 *   `secondary`, `ghost`, `destructive` or `link`.
 * @param props.size - The size: `default`, `xs`, `sm`, `lg`, or a square
 *   `icon`, `icon-xs`, `icon-sm`, `icon-lg`.
 * @param props.className - Extra classes, merged last so they can override
 *   the recipe's (e.g. `className="w-full"`).
 * @returns A `<button>` with the recipe's classes and the other props given.
 */
export function Button({
	className,
	variant = 'default',
	size = 'default',
	...props
}: ButtonProps) {
	return (
		<ButtonPrimitive
			data-slot="button"
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	);
}
