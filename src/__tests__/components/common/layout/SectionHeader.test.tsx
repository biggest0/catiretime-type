import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SectionHeader } from '@/components/common/layout/SectionHeader';

describe('SectionHeader', () => {
	it('is a level-2 heading in capitals by default', () => {
		render(<SectionHeader title="Account" />);

		expect(
			screen.getByRole('heading', { level: 2, name: 'ACCOUNT' })
		).toBeInTheDocument();
	});

	it('is the page heading with as="h1"', () => {
		render(<SectionHeader title="Account" as="h1" />);

		expect(
			screen.getByRole('heading', { level: 1, name: 'ACCOUNT' })
		).toBeInTheDocument();
	});
});
