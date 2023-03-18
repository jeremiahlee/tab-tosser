// Fake the browser
import browserFake from "webextensions-api-fake";
global.browser = browserFake.default();

import {
	isBackFromHiatus,
	clearFromArchiveDate,
	expirationDate,
	getTtl,
	isPaused,
	isTimeToResume,
	pause,
	resume,
	setTtl
} from "../dist/lib/config.js";

QUnit.test("config: ttl", async function (assert) {
	await setTtl(30);
	assert.equal(await getTtl(), 30);
});

QUnit.test("config: clearFromArchiveDate", async function (assert) {
	const lastCheckFake = "2019-01-15T00:00:00Z";
	const ttlFake = 30; // Hardcoded to 30 days in v3.3

	await browser.storage.local.set({
		lastCheck: lastCheckFake,
		ttl: ttlFake
	});

	const expectedArchiveDate = new Date(lastCheckFake).valueOf() + ttlFake * 24 * 60 * 60 * 1000;

	assert.equal(await clearFromArchiveDate(), expectedArchiveDate);
});

QUnit.test("config: expirationDate", async function (assert) {
	// Check non-manual ttl
	const ttlFake = 7;
	await setTtl(ttlFake);

	const expirationDateMin = new Date().valueOf() - ttlFake * 24 * 60 * 60 * 1000;
	const expirationDateResult = await expirationDate();
	const expirationDateMax = expirationDateMin + 30 * 1000; // 30 seconds

	assert.ok(expirationDateResult >= expirationDateMin && expirationDateResult <= expirationDateMax);

	// Check manual ttl
	await setTtl(0);
	const manualExpirationDateResult = await expirationDate();
	assert.equal(manualExpirationDateResult, Number.NEGATIVE_INFINITY);
});

QUnit.test("config: pause", async function (assert) {
	// Setup not paused state
	await setTtl(0);
	assert.equal(await isPaused(), false);

	// Verify paused state
	await setTtl(7); // setting the TTL will pause Tab Tosser

	assert.equal(await isPaused(), true);

	const expectedPauseDate = new Date(new Date().valueOf() + 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);

	const storage = await browser.storage.local.get({ pauseUntil: 0 });
	const actualPauseDate = new Date(storage.pauseUntil).toISOString().substring(0, 10);

	// pauseUntil is stored in epoch milliseconds
	// This test confirms the ISO day since millisecond precision is unlikely in a test
	assert.equal(actualPauseDate, expectedPauseDate);

	// Verify paused period does not get extended once set
	await setTtl(30);
	const storage2 = await browser.storage.local.get({ pauseUntil: 0 });
	const actualPauseDate2 = new Date(storage2.pauseUntil).toISOString().substring(0, 10);

	assert.equal(expectedPauseDate, actualPauseDate2);

	// Verify paused period does get shortened
	await setTtl(1);
	const expectedShorterPauseDate = new Date(new Date().valueOf() + 1 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);
	const storage3 = await browser.storage.local.get({ pauseUntil: 0 });
	const actualPauseDate3 = new Date(storage3.pauseUntil).toISOString().substring(0, 10);

	assert.equal(expectedShorterPauseDate, actualPauseDate3);
});

QUnit.test("config: resume", async function (assert) {
	await setTtl(30);
	await resume();
	assert.equal(await isPaused(), false);
});

QUnit.test("config: isBackFromHiatus true", async function (assert) {
	// Hiatus mode should be triggered because the last check happened
	// more than 3 days ago.

	const now = new Date().valueOf();
	const ttlFake = 3;
	const lastCheckFake = new Date(now - (ttlFake + 1) * 24 * 60 * 60 * 1000).toISOString(); // 1 day beyond the TTL

	await browser.storage.local.set({
		lastCheck: lastCheckFake,
		ttl: ttlFake
	});

	assert.equal(await isBackFromHiatus(), true);
});

QUnit.test("config: isBackFromHiatus false", async function (assert) {
	// Hiatus mode should be triggered because the last check happened
	// more recently than 3 days ago.

	const now = new Date().valueOf();
	const ttlFake = 3;
	const lastCheckFake = new Date(now - (ttlFake - 1) * 24 * 60 * 60 * 1000).toISOString(); // 1 day less than the TTL

	await browser.storage.local.set({
		lastCheck: lastCheckFake,
		ttl: ttlFake
	});

	assert.equal(await isBackFromHiatus(), false);
});

QUnit.test("config: isTimeToResume true", async function (assert) {
	const dateInPast = new Date().valueOf() - 60 * 1000;

	await browser.storage.local.set({
		pauseUntil: dateInPast
	});

	assert.equal(await isTimeToResume(), true);
});

QUnit.test("config: isTimeToResume false", async function (assert) {
	const dateInFuture = new Date().valueOf() + 60 * 1000;

	await browser.storage.local.set({
		pauseUntil: dateInFuture
	});

	assert.equal(await isTimeToResume(), false);
});
