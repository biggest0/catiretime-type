import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Button } from '@/components/ui/Button';

describe('Button', () => {
	it('runs its action on click without submitting a surrounding form', async () => {
		const onClick = vi.fn();
		render(<Button onClick={onClick}>Save</Button>);
		const button = screen.getByRole('button', { name: 'Save' });

		await userEvent.click(button);

		expect(onClick).toHaveBeenCalledOnce();
		// a plain <button> defaults to type="submit" inside a form
		expect(button).toHaveAttribute('type', 'button');
	});

	it('ignores clicks while disabled', async () => {
		const onClick = vi.fn();
		render(
			<Button disabled onClick={onClick}>
				Save
			</Button>
		);
		const button = screen.getByRole('button', { name: 'Save' });

		await userEvent.click(button);

		expect(button).toBeDisabled();
		expect(onClick).not.toHaveBeenCalled();
	});

	it('lets className override the recipe', () => {
		render(<Button className="h-12">Save</Button>);
		const button = screen.getByRole('button', { name: 'Save' });

		// the default size is h-10; cn() drops it for the conflicting h-12
		expect(button).toHaveClass('h-12');
		expect(button).not.toHaveClass('h-10');
	});
});
