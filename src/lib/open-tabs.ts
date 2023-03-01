import { archiveTabs } from "./closed-tabs.js";
import { clearFromArchiveDate, expirationDate } from "./config.js";
import { TabArchive } from "./TabArchiveType.js";
import { formatPageTitle, log } from "./utils.js";

async function findExpiredTabs(): Promise<browser.tabs.Tab[]> {
	// Get all non-pinned tabs
	const tabs: browser.tabs.Tab[] = await browser.tabs.query({
		pinned: false
	});

	// Determine which tabs to remove
	const expiredTabs: browser.tabs.Tab[] = [];
	const tabExpirationDate: number = await expirationDate();

	for (const tab of tabs) {
		if (typeof tab.lastAccessed !== "undefined" && tab.lastAccessed < tabExpirationDate) {
			expiredTabs.push(tab);
		}
	}

	return expiredTabs;
}

async function removeTabs(expiredTabs: browser.tabs.Tab[]): Promise<void> {
	if (expiredTabs.length === 0) {
		return;
	}

	// Create array of tab ids to remove
	const expiredTabIds: number[] = expiredTabs
		.map((tab) => tab.id)
		.filter((tabId) => typeof tabId !== "undefined") as number[];
	// TypeScript static analysis is unable to track filtering out types

	const clearFromArchiveDateCache: number = await clearFromArchiveDate();

	// Prepare expired tabs for archival
	// Do not store private window tabs in the archive.
	const expiredTabLogs: TabArchive[] = expiredTabs
		.filter((tab) => !tab.incognito)
		.filter((tab) => typeof tab.url === "string")
		.map((tab) => {
			let pageTitle: string | undefined = tab.title;

			if (pageTitle === undefined || (typeof pageTitle === "string" && pageTitle.length < 10)) {
				pageTitle = tab.url as string;
				// TypeScript static analysis is unable to track filtering out non-strings above
			}

			return [
				tab.url as string,
				formatPageTitle(pageTitle),
				tab.lastAccessed as number,
				clearFromArchiveDateCache
			];
		});

	// Archive and close tabs
	await archiveTabs(expiredTabLogs);
	await browser.tabs.remove(expiredTabIds);

	await log(`removeTabs: ${expiredTabLogs.length}`);
}

async function removeExpiredTabs(): Promise<void> {
	const expiredTabs: browser.tabs.Tab[] = await findExpiredTabs();
	return removeTabs(expiredTabs);
}

export {
	findExpiredTabs,
	removeExpiredTabs
};
