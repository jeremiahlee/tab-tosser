// Fake the browser
import browserFake from "webextensions-api-fake";
global.browser = browserFake.default();

import {
	findExpiredTabs,
	removeExpiredTabs
} from "../dist/lib/open-tabs.js";

import { getClosedTabs } from "../dist/lib/closed-tabs.js";

import { setTtl } from "../dist/lib/config.js";

import {
	createTab,
	createPinnedTab,
	createExpiredTab,
	createExpiredPinnedTab
} from "./helpers/tab-creator.js";

QUnit.test("open-tabs: findExpiredTabs", async function (assert) {
	// Create some tabs to close
	// 3 expired tabs created, but pinned tabs should not be counted
	const ttlFake = 7;

	await createTab();
	await createTab();
	await createPinnedTab();
	await createPinnedTab();
	await createExpiredTab(ttlFake);
	await createExpiredTab(ttlFake);
	await createExpiredPinnedTab(ttlFake);

	// Verify no tabs closed when in manual mode
	await setTtl(0);
	const expiredTabs = await findExpiredTabs();
	assert.equal(expiredTabs.length, 0);

	// Verify 2 tabs closed in non-manual mode
	await setTtl(ttlFake);

	const expiredTabs2 = await findExpiredTabs();
	assert.equal(expiredTabs2.length, 2);
});

QUnit.test("open-tabs: removeExpiredTabs", async function (assert) {
	let initialOpenTabs = await browser.tabs.query({
		active: false,
		pinned: false
	});

	await removeExpiredTabs();

	let remainingOpenTabs = await browser.tabs.query({
		active: false,
		pinned: false
	});

	assert.equal(initialOpenTabs.length - remainingOpenTabs.length, 2);
});

QUnit.test("open-tabs: removeExpiredTabs title check", async function (assert) {
	// Firefox for Android does not default tab title to a string
	// Tab Tosser should use the URL as the page title if none exists

	// Missing title tab test
	const url = `https://www.example.com/titleless-tab`;

	await browser.tabs.create({
		active: false,
		lastAccessed: 1000,
		url: url,
		title: undefined
	});

	await removeExpiredTabs();

	let archivedTabs = await getClosedTabs();

	const missingTitleTab = archivedTabs[archivedTabs.length - 1];
	assert.equal(missingTitleTab[1].slice(0, 10), url.slice(0, 10));

	// Short title test
	await browser.tabs.create({
		active: false,
		lastAccessed: 1000,
		url: url,
		title: "123456789"
	});

	await removeExpiredTabs();

	archivedTabs = await getClosedTabs();

	const shortTitleTab = archivedTabs[archivedTabs.length - 1];
	assert.equal(shortTitleTab[1].slice(0, 10), url.slice(0, 10));
});
