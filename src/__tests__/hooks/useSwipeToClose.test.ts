import { act, renderHook } from '@testing-library/react';
import type { TouchEvent } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { useSwipeToClose } from '@/hooks/useSwipeToClose';

/**
 * A touch event with the finger at one horizontal position: all the hook
 * reads.
 *
 * @param clientX - The finger's distance from the left edge, in px.
 * @returns The fake event.
 */
function touchAt(clientX: number) {
	return {
		targetTouches: [{ clientX }],
		changedTouches: [{ clientX }],
	} as unknown as TouchEvent;
}

/**
 * Runs one swipe: finger down, moved, lifted.
 *
 * @param result - The hook's current result (from `renderHook`).
 * @param from - Where the finger lands, in px from the left edge.
 * @param to - Where it's lifted.
 */
function swipe(
	result: { current: ReturnType<typeof useSwipeToClose> },
	from: number,
	to: number
) {
	act(() => result.current.touchHandlers.onTouchStart(touchAt(from)));
	act(() => result.current.touchHandlers.onTouchMove(touchAt(to)));
	act(() => result.current.touchHandlers.onTouchEnd(touchAt(to)));
}

describe('useSwipeToClose', () => {
	it('follows the finger, then closes after a swipe right of more than 100px', () => {
		const onClose = vi.fn();
		const { result } = renderHook(() => useSwipeToClose(onClose));

		act(() => result.current.touchHandlers.onTouchStart(touchAt(100)));
		act(() => result.current.touchHandlers.onTouchMove(touchAt(250)));
		expect(result.current.isDragging).toBe(true);
		expect(result.current.dragOffset).toBe(150);

		act(() => result.current.touchHandlers.onTouchEnd(touchAt(250)));
		expect(onClose).toHaveBeenCalledOnce();
		expect(result.current.isDragging).toBe(false);
		expect(result.current.dragOffset).toBe(0);
	});

	it('springs back without closing after a shorter swipe', () => {
		const onClose = vi.fn();
		const { result } = renderHook(() => useSwipeToClose(onClose));

		swipe(result, 100, 200);

		expect(onClose).not.toHaveBeenCalled();
		expect(result.current.dragOffset).toBe(0);
	});

	it("doesn't follow a drag to the left", () => {
		const onClose = vi.fn();
		const { result } = renderHook(() => useSwipeToClose(onClose));

		act(() => result.current.touchHandlers.onTouchStart(touchAt(300)));
		act(() => result.current.touchHandlers.onTouchMove(touchAt(100)));

		expect(result.current.dragOffset).toBe(0);
	});

	it('ignores a touch at the left edge, even after an earlier swipe', () => {
		const onClose = vi.fn();
		const { result } = renderHook(() => useSwipeToClose(onClose));
		swipe(result, 100, 250);
		onClose.mockClear();

		// a tap in the browser's back-swipe strip, after the menu reopened
		act(() => result.current.touchHandlers.onTouchStart(touchAt(10)));
		act(() => result.current.touchHandlers.onTouchEnd(touchAt(10)));

		expect(onClose).not.toHaveBeenCalled();
		expect(result.current.isDragging).toBe(false);
	});
});
