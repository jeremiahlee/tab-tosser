// Fake the browser
import browserFake from "webextensions-api-fake";

global.browser = browserFake.default();

import {
	clearArchivedTabsHistory,
	getClosedTabs,
	archiveTabs
} from "../dist/lib/closed-tabs.js";

QUnit.test("closed-tabs: archiveTabs", async function (assert) {
	const ttl = 30; // Hardcoded to 30 days in v3.3
	const now = new Date().getTime();

	await archiveTabs([
        [
            "https://www.example.com/tab-archive-0",
            "Test tab archive 0",
            now - ((ttl + 1) * 24 * 60 * 60 * 1000),
            now + (ttl * 24 * 60 * 60 * 1000)
        ],
        [
            "https://www.example.com/tab-archive-1",
            "Test tab archive 1",
            now - ((ttl + 1) * 24 * 60 * 60 * 1000),
            now + (ttl * 24 * 60 * 60 * 1000)
        ]
    ]);

	// archiveTabs twice to ensure the archive is being appended to
	await archiveTabs([
        [
            "https://www.example.com/tab-archive-2",
            "Test tab archive 2",
            now - ((ttl + 1) * 24 * 60 * 60 * 1000),
            now + (ttl * 24 * 60 * 60 * 1000)
        ],
        [
            "https://www.example.com/tab-archive-3",
            "Test tab archive 3",
            now - ((ttl + 1) * 24 * 60 * 60 * 1000),
            now + (ttl * 24 * 60 * 60 * 1000)
        ]
    ]);

	const archivedTabs = await getClosedTabs();

	assert.equal(archivedTabs.length, 4);
});

QUnit.test("closed-tabs: purgeArchivedTabs: purge date", async function (assert) {
	const ttl = 3;
	const now = new Date().getTime();

	const closedTabsFake = [
        [
            "https://www.example.com/tab-archive-0",
            "Test tab archive 0",
            now - ((ttl + 1) * 24 * 60 * 60 * 1000),
            now - (ttl * 24 * 60 * 60 * 1000) // < now, > last accessed
        ],
        [
            "https://www.example.com/tab-archive-1",
            "Test tab archive 1",
            now - ((ttl + 1) * 24 * 60 * 60 * 1000),
            now + (ttl * 24 * 60 * 60 * 1000)
        ]
    ];

	await browser.storage.local.set({ closedTabs: closedTabsFake });

	const pretestArchivedTabs = await getClosedTabs();
	assert.equal(pretestArchivedTabs.length, 2);

	await archiveTabs([
        [
            "https://www.example.com/tab-archive-0",
            "Test tab archive 2",
            now - ((ttl + 1) * 24 * 60 * 60 * 1000),
            now + (ttl * 24 * 60 * 60 * 1000)
        ],
        [
            "https://www.example.com/tab-archive-1",
            "Test tab archive 3",
            now - ((ttl + 1) * 24 * 60 * 60 * 1000),
            now + (ttl * 24 * 60 * 60 * 1000)
        ]
    ]);

	const archivedTabs = await getClosedTabs();
	assert.equal(archivedTabs.length, 3); // 1 archived tab should have been purged
	assert.equal(archivedTabs[0][1], "Test tab archive 1"); // preexisting
	assert.equal(archivedTabs[2][1], "Test tab archive 3"); // newly archived
});

QUnit.test("closed-tabs: clearArchivedTabsHistory", async function (assert) {
	// Insert some tabs into the history and confirm insertion
	const ttl = 3;
	const now = new Date().getTime();

	await archiveTabs([
        [
            "https://www.example.com/tab-archive-0",
            "Test tab archive 0",
            now - ((ttl + 1) * 24 * 60 * 60 * 1000),
            now + (ttl * 24 * 60 * 60 * 1000)
        ],
        [
            "https://www.example.com/tab-archive-1",
            "Test tab archive 1",
            now - ((ttl + 1) * 24 * 60 * 60 * 1000),
            now + (ttl * 24 * 60 * 60 * 1000)
        ]
    ]);

	const archivedTabsInsertionCheck = await getClosedTabs();

	assert.equal(archivedTabsInsertionCheck.length >= 2, true);

	// Clear the archived tabs history and confirm
	await clearArchivedTabsHistory();

	const archivedTabsDeletionCheck = await getClosedTabs();

	assert.equal(archivedTabsDeletionCheck.length === 0, true);
});
