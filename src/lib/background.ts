import { isTimeToCheckTabs } from "./config.js";
import { removeExpiredTabs } from "./open-tabs.js";
import { log } from "./utils.js";

// On first run and upgrade, show the onboarding page
browser.runtime.onInstalled.addListener(async (): Promise<void> => {
	const manifest: browser._manifest.WebExtensionManifest = browser.runtime.getManifest();
	const currentVersion: string = manifest.version;

	const { lastInstalledVersion }: { lastInstalledVersion?: string } = await browser.storage.local.get({ lastInstalledVersion: "0.0.0" });

	if (currentVersion !== lastInstalledVersion) {
		browser.tabs.create({
			active: true,
			url: "/lib/first-run.html"
		});

		browser.storage.local.set({ lastInstalledVersion: currentVersion });

		await log(`Version ${currentVersion} installed`);
	} else {
		await log(`Version ${currentVersion} reinitialized after browser update`);
	}
});

// Run in the background when the browser is chillin’
browser.idle.onStateChanged.addListener(async (state) => {
	if (state === "idle") {
		if (await isTimeToCheckTabs()) {
			await removeExpiredTabs();
		}
	}
});
