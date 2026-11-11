import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

// the real English strings for the label
import '@/i18n/config';
import { SkipLink } from '@/components/layout/navigation/SkipLink';
import { MAIN_CONTENT_ID } from '@/utils/a11y/pageFocus';

describe('SkipLink', () => {
	it("moves focus to the page's heading, without changing the address", async () => {
		render(
			<>
				<SkipLink />
				<a href="/somewhere">A header link</a>
				<main id={MAIN_CONTENT_ID}>
					<h1>Account</h1>
				</main>
			</>
		);
		const address = window.location.href;

		const skipLink = screen.getByRole('link', { name: 'Skip to main content' });
		// a real link to the content area, for when JavaScript hasn't run
		expect(skipLink).toHaveAttribute('href', `#${MAIN_CONTENT_ID}`);
		await userEvent.click(skipLink);

		expect(screen.getByRole('heading', { name: 'Account' })).toHaveFocus();
		expect(window.location.href).toBe(address);
	});

	it('is the first Tab stop', async () => {
		render(
			<>
				<SkipLink />
				<a href="/somewhere">A header link</a>
			</>
		);

		await userEvent.tab();

		expect(
			screen.getByRole('link', { name: 'Skip to main content' })
		).toHaveFocus();
	});
});
