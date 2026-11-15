import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/__tests__/helpers/renderWithProviders';
import { SocialMediaLinks } from '@/components/common/social/SocialMediaLinks';
import { SOCIAL_PROFILES } from '@/constants/site';

describe('SocialMediaLinks', () => {
	it('links to every profile in a new tab, named for screen readers', () => {
		renderWithProviders(<SocialMediaLinks />);

		SOCIAL_PROFILES.forEach(({ label, url }) => {
			const link = screen.getByRole('link', { name: label });
			expect(link).toHaveAttribute('href', url);
			expect(link).toHaveAttribute('target', '_blank');
			// the new tab gets no handle on this page
			expect(link).toHaveAttribute('rel', 'noopener noreferrer');
		});
	});

	it('gives each icon link a 24px box to tap', () => {
		renderWithProviders(<SocialMediaLinks />);

		// the icons are 20px; the link around each is the tap target
		screen.getAllByRole('link').forEach((link) => {
			expect(link).toHaveClass('h-6', 'w-6');
		});
	});
});
