import { archiveTabs } from "./closed-tabs.js";
import { clearFromArchiveDate, expirationDate } from "./config.js";
import { TabArchive } from "./TabArchiveType.js";
import { formatPageTitle } from "./utils.js";

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

// Not used yet. To be used for smart default on first run.
// async function findExpiredTabsByLevel() {
//     // Get all non-pinned tabs
//     const tabs = await browser.tabs.query({
//         pinned: false
//     });

//     // Sort tabs ascending by lastAccessed
//     tabs.sort((a, b) => {
//         if (a.lastAccessed < b.lastAccessed) {
//             return -1;
//         } else if (a.lastAccessed > b.lastAccessed) {
//             return 1;
//         } else {
//             return 0;
//         }
//     });

//     // Get the expiration date for each slider mark
//     const now = new Date();
//     const expirationDates = [];

//     for (const sliderMark of sliderMarks) {
//         expirationDates.push(now.valueOf() - (sliderMark * 86400000));
//     }

//     // Determine how many tabs would be removed with each TTL
//     const expiredTabsByLevel = [];
//     let numberOfTabsAffected = 0;

//     let expirationDate = expirationDates.shift();

//     dateLoop:
//     for (const tab of tabs) {
//         let evaluated = false;

//         while (evaluated === false) {
//             if (tab.lastAccessed < expirationDate) {
//                 numberOfTabsAffected++;
//                 evaluated = true;
//             } else {
//                 expiredTabsByLevel.push(numberOfTabsAffected);

//                 expirationDate = expirationDates.shift();

//                 if (typeof expirationDate === "undefined") {
//                     break dateLoop;
//                 }
//             }
//         }
//     }

//     return expiredTabsByLevel;
// }

async function removeTabs(expiredTabs: browser.tabs.Tab[]): Promise<void> {
	if (expiredTabs.length === 0) {
		return;
	}

	// Create array of tab ids to remove
	// prettier-ignore
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

			// prettier-ignore
			return [
                tab.url as string,
                formatPageTitle(pageTitle),
                tab.lastAccessed as number,
                clearFromArchiveDateCache
            ];
		});

	// Remove and archive
	await browser.tabs.remove(expiredTabIds);
	await archiveTabs(expiredTabLogs);
}

async function removeExpiredTabs(): Promise<void> {
	const expiredTabs: browser.tabs.Tab[] = await findExpiredTabs();
	return removeTabs(expiredTabs);
}

export {
	findExpiredTabs, //
	removeExpiredTabs
};
