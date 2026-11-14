import { act, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/__tests__/helpers/renderWithProviders';
import { LoadingOverlay } from '@/components/common/feedback/LoadingOverlay';
import { APP_SETTING } from '@/constants/keys';

/**
 * Renders the overlay for a visitor with a saved theme.
 *
 * @param themeMode - The saved theme.
 * @param loading - The overlay's `loading` prop.
 * @returns RTL's render result, to re-render with another `loading`.
 */
function renderOverlay(themeMode: 'light' | 'dark', loading = true) {
	localStorage.setItem(APP_SETTING, JSON.stringify({ themeMode }));
	const result = renderWithProviders(<LoadingOverlay loading={loading} />);
	return {
		...result,
		setLoading: (next: boolean) =>
			result.rerender(<LoadingOverlay loading={next} />),
	};
}

afterEach(() => {
	vi.useRealTimers();
	localStorage.clear();
});

describe('LoadingOverlay', () => {
	it('shows one light cat and the status text in the light theme', () => {
		renderOverlay('light');

		expect(screen.getByRole('status')).toHaveTextContent('Loading...');
		// alt="" makes the image decorative, so it has no img role
		const images = document.querySelectorAll('img');
		expect(images).toHaveLength(1);
		expect(images[0].getAttribute('src')).toMatch(/cat_loading\.gif$/);
	});

	it('shows the dark cat in the dark theme', () => {
		renderOverlay('dark');

		const images = document.querySelectorAll('img');
		expect(images).toHaveLength(1);
		expect(images[0].getAttribute('src')).toMatch(/cat_loading_dark\.gif$/);
	});

	it('fades out, then disappears, when loading ends', () => {
		vi.useFakeTimers();
		const { setLoading } = renderOverlay('light');

		setLoading(false);

		// still there, fading
		expect(screen.getByRole('status')).toHaveClass('opacity-0');

		act(() => vi.advanceTimersByTime(300));

		expect(screen.queryByRole('status')).not.toBeInTheDocument();
	});

	it('comes back when loading starts again', () => {
		vi.useFakeTimers();
		const { setLoading } = renderOverlay('light', false);
		expect(screen.queryByRole('status')).not.toBeInTheDocument();

		setLoading(true);

		expect(screen.getByRole('status')).toHaveClass('opacity-100');
	});
});
