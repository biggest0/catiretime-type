import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SocialMediaLinks } from '@/components/common/social/SocialMediaLinks';
import { SOCIAL_PROFILES } from '@/constants/site';

describe('SocialMediaLinks', () => {
	it('links to every profile in a new tab, named for screen readers', () => {
		render(<SocialMediaLinks />);

		SOCIAL_PROFILES.forEach(({ label, url }) => {
			const link = screen.getByRole('link', { name: label });
			expect(link).toHaveAttribute('href', url);
			expect(link).toHaveAttribute('target', '_blank');
			// the new tab gets no handle on this page
			expect(link).toHaveAttribute('rel', 'noopener noreferrer');
		});
	});
});
