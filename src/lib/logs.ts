document.addEventListener("DOMContentLoaded", async () => {
	// Display Tab Tosser settings
	const settings = await browser.storage.local.get([
		"enabled",
		"initDate",
		"lastCheck",
		"pauseUntil",
		"statTabsClosed",
		"ttl"
	]);
	const settingsSection = document.getElementById("settings")!;
	settingsSection.innerHTML = JSON.stringify(settings, null, "	");

	// Display extension logs
	const { logs } = await browser.storage.local.get([
		"logs"
	]);
	const logsSection = document.getElementById("logs")!;
	logsSection.innerHTML = JSON.stringify(logs, null, "	");

	// Display recently closed tabs
	const { closedTabs } = await browser.storage.local.get([
		"closedTabs"
	]);
	const closedTabsSection = document.getElementById("closedTabs")!;
	closedTabsSection.innerHTML = JSON.stringify(closedTabs, null, "	");

	// Display currently open tabs eligible for tossing
	const tabs: browser.tabs.Tab[] = await browser.tabs.query({
		pinned: false
	});
	const openTabsSection = document.getElementById("openTabs")! as HTMLTableSectionElement;
	for (const tab of tabs) {
		openTabsSection.insertAdjacentHTML(
			"beforeend",
			`<tr><td>${tab.id}</td><td>${tab.windowId}</td><td data-sort="${tab.lastAccessed}">${tab.lastAccessed? new Date(tab.lastAccessed).toISOString() : ""}</td><td>${tab.title}</td></tr>`
		);
	}
});
