/**
 * Vitest global setup file.
 *
 * - Imports @testing-library/jest-dom to add custom DOM matchers
 *   (toBeInTheDocument, toHaveTextContent, etc.) to every test file.
 * - Runs RTL cleanup after each test to unmount rendered components and
 *   clear the DOM, preventing state leaking between tests.
 * - Stubs window.matchMedia, which jsdom does not implement. AppSettingProvider
 *   reads it to resolve the "system" theme, so without this every test that
 *   mounts the provider dies with "window.matchMedia is not a function".
 */
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

/**
 * Minimal MediaQueryList: reports "no match" and accepts listeners without
 * firing them. Tests that need a specific preference should override this per
 * test rather than relying on a global default.
 */
if (!window.matchMedia) {
	window.matchMedia = vi.fn().mockImplementation((query: string) => ({
		matches: false,
		media: query,
		onchange: null,
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		addListener: vi.fn(),
		removeListener: vi.fn(),
		dispatchEvent: vi.fn(),
	}));
}

afterEach(() => {
	cleanup();
});
