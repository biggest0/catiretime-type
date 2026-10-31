import { useRef, useState, type TouchEvent } from 'react';

/** A swipe must travel further right than this (px) to close the panel. */
const MIN_SWIPE_DISTANCE = 100;

/**
 * Touches that start this close (px) to the screen's left edge are left
 * alone: browsers use that strip for their own "back" swipe.
 */
const LEFT_EDGE_ZONE = 20;

/**
 * Swipe right to close a panel that slides in from the right. While a finger
 * drags right, `dragOffset` says how far, so the panel can follow it; on
 * release, a swipe of more than 100px calls `onClose`; anything shorter lets
 * the panel spring back.
 *
 * @param onClose - Called when a swipe goes far enough.
 * @returns `isDragging`, `dragOffset` (px, never negative) and
 *   `touchHandlers`, to spread on the panel element.
 */
export function useSwipeToClose(onClose: () => void) {
	const [isDragging, setIsDragging] = useState(false);
	const [dragOffset, setDragOffset] = useState(0);
	// Where the current swipe started, or null when there's none. A ref, not
	// state: nothing renders it, and the handlers must see it at once.
	const startX = useRef<number | null>(null);

	/** @param event - The touch that may start a swipe. */
	const onTouchStart = (event: TouchEvent) => {
		const x = event.targetTouches[0].clientX;
		if (x < LEFT_EDGE_ZONE) return;

		startX.current = x;
		setIsDragging(true);
	};

	/** @param event - The finger's new position. */
	const onTouchMove = (event: TouchEvent) => {
		if (startX.current === null) return;

		// Follow the finger to the right only
		const offset = event.targetTouches[0].clientX - startX.current;
		setDragOffset(Math.max(offset, 0));
	};

	/** @param event - The finger leaving the screen. */
	const onTouchEnd = (event: TouchEvent) => {
		if (startX.current === null) return;

		const distance = event.changedTouches[0].clientX - startX.current;
		startX.current = null;
		setIsDragging(false);
		setDragOffset(0);
		if (distance > MIN_SWIPE_DISTANCE) onClose();
	};

	return {
		isDragging,
		dragOffset,
		touchHandlers: { onTouchStart, onTouchMove, onTouchEnd },
	};
}
