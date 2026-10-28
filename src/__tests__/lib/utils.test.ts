import { describe, expect, it } from 'vitest';

import { cn } from '@/lib/utils';

describe('cn', () => {
	it('should merge class names correctly', () => {
		expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white');
		expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
		expect(cn('p-4', 'p-2')).toBe('p-2');
		expect(cn('text-lg', 'text-sm')).toBe('text-sm');
	});

	it('should handle conditional class names', () => {
		const isActive = true;
		const isDisabled = false;

		expect(
			cn('bg-red-500', isActive && 'text-white', isDisabled && 'opacity-50')
		).toBe('bg-red-500 text-white');
	});

	it('should handle null, undefined values', () => {
		expect(cn('bg-red-500', null, undefined, 'text-white')).toBe(
			'bg-red-500 text-white'
		);
	});

	it('should handle object syntax', () => {
		expect(cn({ 'bg-red-500': true, 'text-white': false })).toBe('bg-red-500');
		expect(cn({ 'bg-red-500': false, 'text-white': true })).toBe('text-white');
		expect(cn({ 'bg-red-500': true, 'text-white': true })).toBe(
			'bg-red-500 text-white'
		);
	});
});
