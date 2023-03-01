import { JSDOM } from "jsdom";
global.document = new JSDOM().window.document;

import { clearLogs, formatPageTitle, log } from "../dist/lib/utils.js";

QUnit.test("utils: formatPageTitle: 40 character max", async function (assert) {
	const tooLongPageTitle = "0123456789 0123456789 0123456789 0123456789";
	const formattedPageTitle = formatPageTitle(tooLongPageTitle);

	assert.equal(formattedPageTitle.length, 40);
});

QUnit.test("utils: formatPageTitle: has ellipsis", async function (assert) {
	const tooLongPageTitle = "0123456789 0123456789 0123456789 0123456789";
	const formattedPageTitle = formatPageTitle(tooLongPageTitle);

	assert.equal(formattedPageTitle, "0123456789 0123456789 0123456789 012345…");
});

QUnit.test("utils: formatPageTitle: trims whitespace", async function (assert) {
	const tooLongPageTitle = "     0123456789 0123456789 0123456789       0123456789";
	// initial trim results in "0123456789 0123456789 0123456789       0123456789"
	// slice results in "0123456789 0123456789 0123456789       "
	// final trim should result in "0123456789 0123456789 0123456789"
	const formattedPageTitle = formatPageTitle(tooLongPageTitle);

	assert.equal(formattedPageTitle, "0123456789 0123456789 0123456789…");
});

QUnit.test("utils: formatPageTitle: no evil characters", async function (assert) {
	const evilPageTitle = `< > & !`; // ! present to preserve space
	const formattedPageTitle = formatPageTitle(evilPageTitle);

	assert.equal(formattedPageTitle.indexOf(`>`), -1);
	assert.equal(formattedPageTitle.indexOf(`<`), -1);
	assert.equal(formattedPageTitle.indexOf(`& `), -1); // note space
});


QUnit.test("utils: log: logs cleared", async function (assert) {
	await clearLogs();
	let { logs } = await browser.storage.local.get({ logs: [] });
	assert.equal(logs.length, 0);
});

QUnit.test("utils: log: log saved", async function (assert) {
	await clearLogs();
	await log("Test message");
	let { logs } = await browser.storage.local.get({ logs: [] });
	assert.equal(logs.length, 1);

	await log("Another test message");
	let { logs: logs2 } = await browser.storage.local.get({ logs: [] });
	assert.equal(logs2.length, 2);
});

QUnit.test("utils: log: logs truncated", async function (assert) {
	await clearLogs();
	let { logs } = await browser.storage.local.get({ logs: [] });
	assert.equal(logs.length, 0);

	// Load 2005 logs
	for (let i = 0; i < 2005; i++) {
		await log(i);
	}

	// Verify only 2000 log messages
	let { logs: logs2 } = await browser.storage.local.get({ logs: [] });
	assert.equal(logs2.length, 2000);

	// Verify the last log is indeed the last log
	let lastLog = logs2.pop().slice(-4);
	assert.equal(lastLog, "2004");
});
