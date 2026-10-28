/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
import pkg from './package.json' with { type: 'json' };

/** Vendor chunk name → the npm packages that go in it (see `manualChunks`). */
const vendorChunks = {
	react: ['react', 'react-dom', 'react-router-dom'],
	redux: ['@reduxjs/toolkit', 'react-redux'],
	i18n: ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
	baseui: ['@base-ui/react'],
};

// https://vite.dev/config/
export default defineConfig({
	// package.json is the single source of truth for the app version and public
	// origin; both are injected at build time and read back in src/config/config.ts.
	define: {
		__APP_VERSION__: JSON.stringify(pkg.version),
		__SITE_URL__: JSON.stringify(pkg.homepage.replace(/\/$/, '')),
	},
	plugins: [react(), tailwindcss()],
	server: {
		host: 'localhost',
		port: 5173,
		// fail loudly when the port is taken instead of silently moving to the next one
		strictPort: true,
	},
	// `vite preview` (used by Playwright). Not Vite's default 4173, which other
	// local apps use: Playwright reuses whatever server answers on its port.
	preview: {
		host: 'localhost',
		port: 4174,
		strictPort: true,
	},
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
		},
	},
	base: '/',
	build: {
		rollupOptions: {
			output: {
				// Rarely-changing vendors in their own cacheable chunks: an app deploy
				// doesn't invalidate them, and the browser fetches them in parallel.
				// Modules are matched by file path, so every file of a package lands
				// in its chunk: subpaths like react-dom/client and react/jsx-runtime,
				// and the wrappers Vite generates for CommonJS packages like React.
				// The object form ({ react: ['react', …] }) matches import names only:
				// once Redux was imported, it put React itself in the redux chunk and
				// the JSX runtime in baseui.
				manualChunks(id) {
					for (const [chunk, packages] of Object.entries(vendorChunks)) {
						if (packages.some((pkg) => id.includes(`/node_modules/${pkg}/`))) {
							return chunk;
						}
					}
					// everything else (the app's own code): Vite's default splitting
					return undefined;
				},
			},
		},
	},
	test: {
		environment: 'jsdom',
		include: ['src/__tests__/**/*.test.{ts,tsx}'],
		setupFiles: ['src/__tests__/setup.ts'],
	},
});
