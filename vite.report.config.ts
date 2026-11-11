import { gzipSync } from 'node:zlib';
import { mergeConfig, type Plugin } from 'vite';

import baseConfig, { vendorChunks } from './vite.config';

// `npm run build:report`: builds the app in memory (nothing is written to
// dist/) and prints what each JavaScript file would hold. Run it after
// upgrading a dependency or changing `vendorChunks`: an upgrade can move a
// package into another file without any error or warning.

/** 1000 bytes, the kilobyte Vite's own build output uses. */
const KILOBYTE = 1000;

/** What `ownerOf()` calls the modules that don't come from an npm package. */
const APP_CODE = "the app's own code";
const BUILD_HELPERS = 'build helpers';

/**
 * Formats a size for the report.
 *
 * @param bytes - The size in bytes.
 * @returns The size in kB with one decimal, right-aligned, e.g. `  71.8 kB`.
 */
function kilobytes(bytes: number): string {
	return `${(bytes / KILOBYTE).toFixed(1)} kB`.padStart(9);
}

/**
 * Names where a module comes from, so modules can be added up per package.
 *
 * @param id - The module's id: usually its file path.
 * @returns The npm package's name (`react-dom`, `@base-ui/react`),
 *   `APP_CODE` for files under src/, or `BUILD_HELPERS` for the few modules
 *   Vite itself adds.
 */
function ownerOf(id: string): string {
	// the last node_modules/ in the path: a package installed inside another
	const insidePackages = id.split('/node_modules/').pop();
	if (insidePackages !== undefined && insidePackages !== id) {
		const [first, second] = insidePackages.split('/');
		return first.startsWith('@') ? `${first}/${second}` : first;
	}
	return id.includes('/src/') ? APP_CODE : BUILD_HELPERS;
}

/**
 * Shortens a built file's name to the name it's known by.
 *
 * @param fileName - e.g. `assets/react-WOJugs-c.js`.
 * @returns e.g. `react`: without the folder, the content hash and `.js`.
 */
function shortName(fileName: string): string {
	return fileName.replace(/^assets\//, '').replace(/-[\w-]{8}\.js$/, '');
}

/** Prints, for each built JavaScript file, its size and what's inside. */
const chunkReport: Plugin = {
	name: 'chunk-report',
	generateBundle(_options, bundle) {
		const lines: string[] = [];

		// biggest file first
		const chunks = Object.values(bundle)
			.filter((file) => file.type === 'chunk')
			.sort((a, b) => b.code.length - a.code.length);

		for (const chunk of chunks) {
			const gzipped = gzipSync(chunk.code).length;
			lines.push(
				'',
				`${shortName(chunk.fileName)}   ${kilobytes(chunk.code.length).trim()} (${kilobytes(gzipped).trim()} gzipped)`
			);

			// which other files the browser fetches with it, and later
			if (chunk.imports.length > 0) {
				lines.push(
					`  loads with it:   ${chunk.imports.map(shortName).join(', ')}`
				);
			}
			if (chunk.dynamicImports.length > 0) {
				lines.push(
					`  loads on demand: ${chunk.dynamicImports.map(shortName).join(', ')}`
				);
			}

			// add the modules up per package
			const sizes = new Map<string, number>();
			for (const [id, module] of Object.entries(chunk.modules)) {
				const owner = ownerOf(id);
				sizes.set(owner, (sizes.get(owner) ?? 0) + module.renderedLength);
			}

			// a vendor file's packages that `vendorChunks` doesn't name got
			// there by being imported: mark them
			const named = [
				...(vendorChunks[chunk.name] ?? []),
				APP_CODE,
				BUILD_HELPERS,
			];
			[...sizes]
				.filter(([, bytes]) => bytes > 0)
				.sort(([, a], [, b]) => b - a)
				.forEach(([owner, bytes]) => {
					const followed =
						chunk.name in vendorChunks && !named.includes(owner) ? ' *' : '';
					lines.push(`  ${kilobytes(bytes)}  ${owner}${followed}`);
				});
		}

		lines.push(
			'',
			'File sizes are minified, as shipped (`npm run build` prints the exact',
			'figures; they can differ by a fraction of a kB). The sizes inside a',
			'file are before minifying, so they add up to more: compare them with',
			'each other.',
			'* not named in vendorChunks (vite.config.ts): it came with a package',
			'  that imports it.',
			''
		);
		console.log(lines.join('\n'));
	},
};

export default mergeConfig(baseConfig, {
	plugins: [chunkReport],
	// in memory only: dist/ keeps the last real build
	build: { write: false },
});
