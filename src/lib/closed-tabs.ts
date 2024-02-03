import { countClosedTabs } from "./stats.js";
import { TabArchive } from "./TabArchiveType.js";

async function getClosedTabs(): Promise<TabArchive[]> {
	const { closedTabs }: { closedTabs?: TabArchive[] } = await browser.storage.local.get({ closedTabs: [] });

	return closedTabs as TabArchive[];
}

async function archiveTabs(tabsArchive: TabArchive[]): Promise<void> {
	let closedTabs: TabArchive[] = await getClosedTabs();

	// Add the newly closed tabs
	closedTabs.push(...tabsArchive);

	// Clean up really old tabs
	closedTabs = purgeArchivedTabs(closedTabs);

	// Save the running count of closed tabs
	await countClosedTabs(tabsArchive.length);

	// Save the tab archive
	await save(closedTabs);
}

// Only keep tabs that have a purge date in the future
function purgeArchivedTabs(tabs: TabArchive[]): TabArchive[] {
	const now = new Date().valueOf();

	const filteredTabs: TabArchive[] = tabs.filter((tab) => tab[3] > now);

	return filteredTabs;
}

async function clearArchivedTabsHistory(): Promise<boolean> {
	try {
		await save([]);
		return true;
	} catch (err) {
		return false;
	}
}

async function save(tabsArchive): Promise<void> {
	return browser.storage.local.set({ closedTabs: tabsArchive });
}

export {
	clearArchivedTabsHistory,
	getClosedTabs,
	archiveTabs
};
