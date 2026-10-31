import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges class names, resolving Tailwind conflicts (later classes win).
 * clsx handles conditionals, tailwind-merge dedupes.
 *
 * @param inputs - Class names, or conditionals like `{ 'font-bold': isOn }`.
 * @returns One class string, e.g. `cn('p-2', 'p-4')` → `'p-4'`.
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
