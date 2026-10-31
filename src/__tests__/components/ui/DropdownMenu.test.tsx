import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';

/**
 * Renders a closed two-item menu, like the language switcher's.
 *
 * @param onEnglish - Runs when the "English" item is chosen.
 * @returns The trigger button.
 */
function renderMenu(onEnglish = vi.fn()) {
	render(
		<DropdownMenu>
			<DropdownMenuTrigger>Language</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuItem onClick={onEnglish}>English</DropdownMenuItem>
				<DropdownMenuItem>Français</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
	return screen.getByRole('button', { name: 'Language' });
}

describe('DropdownMenu', () => {
	it('opens from its trigger and lists the items', async () => {
		const trigger = renderMenu();
		expect(screen.queryByRole('menu')).not.toBeInTheDocument();

		await userEvent.click(trigger);

		// a mouse press opens the menu on the next animation frame (base-ui
		// lets focus settle first), so wait for it rather than check at once
		expect(await screen.findByRole('menu')).toBeInTheDocument();
		expect(screen.getAllByRole('menuitem')).toHaveLength(2);
	});

	it('runs the chosen item and closes', async () => {
		const onEnglish = vi.fn();
		await userEvent.click(renderMenu(onEnglish));

		await userEvent.click(
			await screen.findByRole('menuitem', { name: 'English' })
		);

		expect(onEnglish).toHaveBeenCalledOnce();
		await waitFor(() =>
			expect(screen.queryByRole('menu')).not.toBeInTheDocument()
		);
	});

	it('closes on Escape and gives focus back to the trigger', async () => {
		const trigger = renderMenu();
		await userEvent.click(trigger);
		await screen.findByRole('menu');

		await userEvent.keyboard('{Escape}');

		await waitFor(() =>
			expect(screen.queryByRole('menu')).not.toBeInTheDocument()
		);
		expect(trigger).toHaveFocus();
	});
});
