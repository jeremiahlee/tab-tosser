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
	// Verify non-running state
	await setTtl(0);
	assert.equal(await isPaused(), false);

	// Verify running state
	const ttls = [1, 7 , 30];

	for (let i = 0; i < ttls.length; i++) {
		const ttl = ttls[i];

		await setTtl(ttl);
		// settingTtl will pause Tab Tosser

		assert.equal(await isPaused(), true);

		const expectedPauseDate = new Date(new Date().valueOf() + ttl * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);

		const storage = await browser.storage.local.get({ pauseUntil: 0 });
		const actualPauseDate = new Date(storage.pauseUntil).toISOString().substring(0, 10);

		assert.equal(actualPauseDate, expectedPauseDate);
	}
});

QUnit.test("config: resume", async function (assert) {
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
