import { isBackFromHiatus, isPaused, isTimeToResume, pause, resume } from "./config.js";
import { findExpiredTabs, removeExpiredTabs } from "./open-tabs.js";
import { log } from "./utils.js";

// On first run, show the explainer/initial settings page
browser.runtime.onInstalled.addListener(async (info) => {
	browser.tabs.create({
		active: true,
		url: "/lib/first-run.html"
	});

	await log(`Version ${browser.runtime.getManifest().version} installed`);
});

// Run in the background when the browser is chillin’
browser.idle.onStateChanged.addListener(async (state) => {
	if (state === "idle") {
		// Check if vacation mode is activated
		// If so, check if now is time to deactive vacation mode

		const pausedStatus = await isPaused();

		if (pausedStatus === true) {
			const isTimeToResumeCheck = await isTimeToResume();

			if (isTimeToResumeCheck === true) {
				await resume();
			} else {
				// Vacation mode still active, so don't do anything
				return;
			}
		}

		// If vacation detected and there are tabs that will be closed,
		// don't close anything for an additional ttl
		// (findExpiredTabs updates lastCheck, causing backFromHiatus to return false on next run)
		// Otherwise, do the normal expired tab cleanup

		const backFromHiatusStatus = await isBackFromHiatus();
		const expiredTabs = await findExpiredTabs();

		if (backFromHiatusStatus === true && expiredTabs.length > 0) {
			await pause();
		} else {
			removeExpiredTabs();
		}
	}
});
