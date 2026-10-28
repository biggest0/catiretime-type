import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges class names, resolving Tailwind conflicts (later classes win).
 * clsx handles conditionals, tailwind-merge dedupes.
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
