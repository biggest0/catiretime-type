import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

// the real English strings, for the close button's name
import '@/i18n/config';
import {
	Sheet,
	SheetContent,
	SheetTitle,
	SheetTrigger,
} from '@/components/ui/Sheet';

/**
 * Renders a closed sheet with a title, like the mobile menu.
 *
 * @returns The trigger button.
 */
function renderSheet() {
	render(
		<Sheet>
			<SheetTrigger>Menu</SheetTrigger>
			<SheetContent>
				<SheetTitle>Navigation</SheetTitle>
			</SheetContent>
		</Sheet>
	);
	return screen.getByRole('button', { name: 'Menu' });
}

describe('Sheet', () => {
	it('opens as a dialog named by its title', async () => {
		const trigger = renderSheet();
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

		await userEvent.click(trigger);

		expect(
			screen.getByRole('dialog', { name: 'Navigation' })
		).toBeInTheDocument();
	});

	it('closes from its translated close button and gives focus back', async () => {
		const trigger = renderSheet();
		await userEvent.click(trigger);

		await userEvent.click(screen.getByRole('button', { name: 'Close' }));

		await waitFor(() =>
			expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
		);
		expect(trigger).toHaveFocus();
	});

	it('closes on Escape', async () => {
		await userEvent.click(renderSheet());

		await userEvent.keyboard('{Escape}');

		await waitFor(() =>
			expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
		);
	});
});
