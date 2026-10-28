import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

// Project rules, each defined once and combined per folder below. When two
// blocks set the same rule for the same file, the later block REPLACES the
// earlier one, so a block for a narrower folder must repeat every entry it keeps.

/** Imports use the @/ alias, never ./ or ../ paths. */
const relativeImports = {
	regex: "^\\.{1,2}/",
	message: "Use the @/ alias (e.g. @/components/...) instead of a relative path.",
};

/** DTOs stay behind the store/mapper boundary. */
const dtoImports = {
	group: ["@/types/*Dto", "@/types/*Dto/*"],
	message: "DTO types must not be imported by components/hooks/pages. Use the mapped domain types.",
};

/** Hardcoded colour pairs should be semantic tokens from src/index.css. */
const colourPairs = {
	selector:
		"Literal[value=/\\bdark:(text|bg|border)-(gray|slate|red|green|amber|yellow|blue|purple|teal|cyan|orange|black|white)/]",
	message: "Avoid hardcoded colour pairs (e.g. text-gray-800 dark:text-slate-100). Use a semantic token from src/index.css.",
};

/** User-visible strings go through useTranslation() / t("KEY"). */
const jsxText = {
	selector: "JSXText[value=/[A-Z][a-zA-Z]{3,}/]",
	message: 'Hardcoded user-visible string in JSX. Use useTranslation() and t("KEY") with entries in src/i18n/{en,fr}/common.json.',
};

export default defineConfig([
	globalIgnores(["dist", "playwright-report", "test-results"]),

	// Vite's react-ts template (v7.3); react-hooks v5 names its flat preset "recommended-latest"
	{
		files: ["**/*.{ts,tsx}"],
		extends: [
			js.configs.recommended,
			tseslint.configs.recommended,
			reactHooks.configs["recommended-latest"],
			reactRefresh.configs.vite,
		],
		languageOptions: {
			ecmaVersion: 2020,
			globals: globals.browser,
		},
	},

	// all app code
	{
		files: ["src/**/*.{ts,tsx}"],
		rules: {
			"no-restricted-imports": ["error", { patterns: [relativeImports] }],
		},
	},
	{
		files: ["src/**/*.tsx"],
		rules: {
			"no-restricted-syntax": ["warn", colourPairs],
		},
	},

	// UI layers: no DTOs, and no hardcoded text
	{
		files: ["src/components/**/*.{ts,tsx}", "src/hooks/**/*.{ts,tsx}", "src/pages/**/*.{ts,tsx}"],
		rules: {
			"no-restricted-imports": ["error", { patterns: [relativeImports, dtoImports] }],
		},
	},
	{
		files: ["src/components/**/*.tsx", "src/pages/**/*.tsx"],
		rules: {
			"no-restricted-syntax": ["warn", colourPairs, jsxText],
		},
	},
]);
