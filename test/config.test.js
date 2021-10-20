// Fake the browser
import browserFake from "webextensions-api-fake";
global.browser = browserFake();

import {
	backFromHiatus, //
	clearFromArchiveDate,
	disable,
	expirationDate,
	enable,
	getTtl,
	isEnabled,
	isPaused,
	isTimeToResume,
	pause,
	resume,
	setTtl
} from "../dist/lib/config.js";

QUnit.test("config: enable", async function (assert) {
	await enable();
	assert.equal(await isEnabled(), true);
});

QUnit.test("config: disable", async function (assert) {
	await disable();
	assert.equal(await isEnabled(), false);
});

QUnit.test("config: ttl", async function (assert) {
	await setTtl(30);
	assert.equal(await getTtl(), 30);
});

QUnit.test("config: clearFromArchiveDate", async function (assert) {
	const lastCheckFake = "2019-01-15T00:00:00Z";
	const ttlFake = 3;

	await browser.storage.local.set({
		lastCheck: lastCheckFake,
		ttl: ttlFake
	});

	const expectedArchiveDate = new Date(lastCheckFake).valueOf() + ttlFake * 24 * 60 * 60 * 1000;

	assert.equal(await clearFromArchiveDate(), expectedArchiveDate);
});

QUnit.test("config: expirationDate", async function (assert) {
	const ttlFake = 3;
	await setTtl(ttlFake);

	const expirationDateMin = new Date().valueOf() - ttlFake * 24 * 60 * 60 * 1000;
	const expirationDateResult = await expirationDate();
	const expirationDateMax = expirationDateMin + 30 * 1000; // 30 seconds

	assert.ok(expirationDateResult >= expirationDateMin && expirationDateResult <= expirationDateMax);
});

QUnit.test("config: pause", async function (assert) {
	// The pauseUntil date should be ttl-1 days away if
	// the ttl is 7 or less days

	const ttls = [3, 4, 5, 6, 7, 14];
	const pauseTtls = [2, 3, 4, 5, 6, 7];

	for (let i = 0; i < ttls.length; i++) {
		const ttl = ttls[i];
		const pauseTtl = pauseTtls[i];

		await setTtl(ttl);
		await pause();

		const expectedPauseDate = new Date(new Date().valueOf() + pauseTtl * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);

		const storage = await browser.storage.local.get({ pauseUntil: 0 });
		const actualPauseDate = new Date(storage.pauseUntil).toISOString().substring(0, 10);

		assert.equal(actualPauseDate, expectedPauseDate);
	}
});

QUnit.test("config: resume", async function (assert) {
	await resume();
	assert.equal(await isPaused(), false);
});

QUnit.test("config: backFromHiatus true", async function (assert) {
	// Hiatus mode should be triggered because the last check happened
	// more than 3 days ago.

	const now = new Date().valueOf();
	const ttlFake = 3;
	const lastCheckFake = new Date(now - (ttlFake + 1) * 24 * 60 * 60 * 1000).toISOString(); // 1 day beyond the TTL

	await browser.storage.local.set({
		lastCheck: lastCheckFake,
		ttl: ttlFake
	});

	assert.equal(await backFromHiatus(), true);
});

QUnit.test("config: backFromHiatus false", async function (assert) {
	// Hiatus mode should be triggered because the last check happened
	// more recently than 3 days ago.

	const now = new Date().valueOf();
	const ttlFake = 3;
	const lastCheckFake = new Date(now - (ttlFake - 1) * 24 * 60 * 60 * 1000).toISOString(); // 1 day less than the TTL

	await browser.storage.local.set({
		lastCheck: lastCheckFake,
		ttl: ttlFake
	});

	assert.equal(await backFromHiatus(), false);
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
