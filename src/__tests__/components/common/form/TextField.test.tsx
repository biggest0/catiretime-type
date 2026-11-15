import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/__tests__/helpers/renderWithProviders';
import { TextField } from '@/components/common/form/TextField';

describe('TextField', () => {
	it('ties the label to its input', () => {
		renderWithProviders(<TextField label="Email" />);

		// a click on the label, or a screen reader on the input, finds both
		expect(screen.getByLabelText('Email')).toBe(screen.getByRole('textbox'));
	});

	it('passes the input its own attributes', () => {
		renderWithProviders(
			<TextField
				label="Email"
				type="email"
				name="email"
				autoComplete="email"
				required
				disabled
			/>
		);

		const input = screen.getByLabelText('Email');
		expect(input).toHaveAttribute('type', 'email');
		expect(input).toHaveAttribute('name', 'email');
		// tells browsers and password managers what to fill in
		expect(input).toHaveAttribute('autocomplete', 'email');
		expect(input).toBeRequired();
		expect(input).toBeDisabled();
	});

	it('reports what is typed', async () => {
		const onChange = vi.fn();
		renderWithProviders(<TextField label="Email" onChange={onChange} />);

		await userEvent.type(screen.getByLabelText('Email'), 'cat');

		expect(onChange).toHaveBeenCalledTimes(3);
		expect(screen.getByLabelText('Email')).toHaveValue('cat');
	});

	it('shows no error state without an error', () => {
		renderWithProviders(<TextField label="Email" />);

		const input = screen.getByLabelText('Email');
		expect(input).not.toHaveAttribute('aria-invalid');
		expect(input).not.toHaveAttribute('aria-describedby');
	});

	it('marks the input invalid and describes it by the error', () => {
		renderWithProviders(
			<TextField label="Email" error="Enter your email address." />
		);

		const input = screen.getByLabelText('Email');
		expect(screen.getByText('Enter your email address.')).toBeInTheDocument();
		expect(input).toBeInvalid();
		// a screen reader on the field reads the message after the label
		expect(input).toHaveAccessibleDescription('Enter your email address.');
	});

	it('keeps two fields apart', () => {
		renderWithProviders(
			<>
				<TextField label="Email" error="Enter your email address." />
				<TextField label="Password" type="password" error="Too short." />
			</>
		);

		const email = screen.getByLabelText('Email');
		const password = screen.getByLabelText('Password');
		expect(email.id).not.toBe(password.id);
		expect(email).toHaveAccessibleDescription('Enter your email address.');
		expect(password).toHaveAccessibleDescription('Too short.');
	});

	it('adds extra classes to the input', () => {
		renderWithProviders(<TextField label="Email" className="max-w-xs" />);

		expect(screen.getByLabelText('Email')).toHaveClass('max-w-xs', 'w-full');
	});
});
