import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SectionHeader } from '@/components/common/layout/SectionHeader';

describe('SectionHeader', () => {
	it('is a level-2 heading by default, capitalised by CSS', () => {
		render(<SectionHeader title="Account" />);

		// the page holds the real text; the class shows it in capitals
		const heading = screen.getByRole('heading', { level: 2, name: 'Account' });
		expect(heading).toHaveClass('uppercase');
	});

	it('is the page heading with as="h1"', () => {
		render(<SectionHeader title="Account" as="h1" />);

		expect(
			screen.getByRole('heading', { level: 1, name: 'Account' })
		).toBeInTheDocument();
	});
});
