import { describe, expect, it } from "vitest";

import { APP_VERSION, SITE_URL } from "@/config/config";

describe("config", () => {
	it("takes the app version from package.json through Vite's define", () => {
		// "v0.0.0-dev" would mean the build-time constant never reached the code
		expect(APP_VERSION).toMatch(/^v\d+\.\d+\.\d+$/);
		expect(APP_VERSION).not.toBe("v0.0.0-dev");
	});

	it("takes the site origin from package.json, without a trailing slash", () => {
		expect(SITE_URL).toBe("https://type.catiretime.com");
	});
});
