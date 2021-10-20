// assumes browserFake() has already been made global

let tabIncrementor = 0;

async function createTab(pinned = false, lastAccessed = new Date().getTime()) {
	tabIncrementor++;

	await browser.tabs.create({
		active: false,
		lastAccessed: lastAccessed, // epoch ms
		pinned: pinned,
		url: `https://www.example.com/tab-${tabIncrementor}`,
		title: `Test tab ${tabIncrementor}`
	});

	let tabs = await browser.tabs.query({
		active: false,
		pinned: false
	});
}

async function createPinnedTab() {
	createTab(true);
}

async function createExpiredTab(ttl, pinned = false) {
	const expirationDate = new Date().getTime() - (ttl + 1) * 24 * 60 * 60 * 1000;
	createTab(pinned, expirationDate);
}

async function createExpiredPinnedTab(ttl) {
	createExpiredTab(ttl, true);
}

export {
	createTab, //
	createPinnedTab,
	createExpiredTab,
	createExpiredPinnedTab
};
