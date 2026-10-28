import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright e2e configuration.
 *
 * - Runs against the production build served by `vite preview` on port 4174
 *   (strict, see vite.config.ts): no dev-mode StrictMode double effects, a
 *   prod-like bundle. `npm run test:e2e` builds first; CI builds in a prior step.
 * - The backend is stubbed per test with page.route (see e2e/support), so no
 *   API server is needed, locally or in CI.
 * - Chromium only; add projects here to widen coverage.
 */
export default defineConfig({
	testDir: "./e2e",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
	use: {
		baseURL: "http://localhost:4174",
		trace: "on-first-retry",
	},
	projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
	webServer: {
		command: "npm run preview",
		url: "http://localhost:4174",
		reuseExistingServer: !process.env.CI,
		timeout: 30_000,
	},
});
