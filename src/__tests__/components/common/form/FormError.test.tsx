import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/__tests__/helpers/renderWithProviders';
import { FormError } from '@/components/common/form/FormError';

describe('FormError', () => {
	it('renders nothing while there is no message', () => {
		const { container } = renderWithProviders(<FormError message={null} />);

		expect(container).toBeEmptyDOMElement();
	});

	it('announces the message as an alert', () => {
		renderWithProviders(<FormError message="Wrong email or password." />);

		// role="alert": screen readers read it out when it appears
		expect(screen.getByRole('alert')).toHaveTextContent(
			'Wrong email or password.'
		);
	});
});
