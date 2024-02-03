// Fake the browser
import browserFake from "webextensions-api-fake";
global.browser = browserFake.default();

import {
	clearFromArchiveDate,
	expirationDate,
	getTtl,
	isPaused,
	isTimeToCheckTabs,
	pause,
	resume,
	setLastCheck,
	setTtl
} from "../dist/lib/config.js";

import { sliderMarkTtls } from "../dist/lib/slider.js";

QUnit.test("config: ttl", async function (assert) {
	// valid option must be saved
	await setTtl(sliderMarkTtls[1]);
	assert.equal(await getTtl(), sliderMarkTtls[1]);

	// must be paused when enabled
	assert.equal(await isPaused(), true);

	// invalid option must throw error on set
	assert.rejects(setTtl(999));

	// invalid option must fail to disabled state (0 TTL) on get
	await browser.storage.local.set({ttl: 999});
	assert.equal(await getTtl(), 0);

	// must not be paused when disabled (0)
	await setTtl(sliderMarkTtls[1]);
	await setTtl(0);
	assert.equal(await isPaused(), false);
});

QUnit.test("config: clearFromArchiveDate", async function (assert) {
	const lastCheckFake = new Date();
	const ttlFake = 30; // TODO: future configuration

	const expectedArchiveDate = lastCheckFake.valueOf() + ttlFake * 24 * 60 * 60 * 1000;

	const difference = expectedArchiveDate - await clearFromArchiveDate(lastCheckFake);

	// Difference should be less than 1 second
	assert.equal(Math.abs(difference) < 1000, true);
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
	// 0 pause days results in being enabled
	await pause(0);
	assert.equal(await isPaused(), false);

	// resume date must be now + days into the future
	await pause(sliderMarkTtls[2]);
	const expectedPauseDate = new Date(new Date().valueOf() + sliderMarkTtls[2] * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);
	const storage = await browser.storage.local.get({ pauseUntil: 0 });
	const actualPauseDate = new Date(storage.pauseUntil).toISOString().substring(0, 10);
	assert.equal(actualPauseDate, expectedPauseDate);

	// excessive days into future must be capped to 31 days
	await pause(32);
	const expectedPauseDate2 = new Date(new Date().valueOf() + 31 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);
	const storage2 = await browser.storage.local.get({ pauseUntil: 0 });
	const actualPauseDate2 = new Date(storage2.pauseUntil).toISOString().substring(0, 10);
	assert.equal(actualPauseDate2, expectedPauseDate2);
});

QUnit.test("config: resume", async function (assert) {
	await resume();
	assert.equal(await isPaused(), false);
});

QUnit.test("config: isTimeToCheckTabs", async function (assert) {
	// must be false when ttl = 0 (disabled)
	await setTtl(0);
	assert.equal(await isTimeToCheckTabs(), false);

	// must be false if first run in 3+ days
	await setTtl(sliderMarkTtls[1]);
	await setLastCheck(new Date(new Date().getTime() - (4 * 24 * 60 * 60 * 1000)));
	assert.equal(await isTimeToCheckTabs(), false);
	assert.equal(await isPaused(), true);

	// must be false if paused and resume date is in the future
	assert.equal(await isTimeToCheckTabs(), false);

	// must be true if paused and resume date is in the past
	await browser.storage.local.set({ pauseUntil: new Date().getTime() - 2 * 24 * 60 * 60 * 1000 });
	assert.equal(await isTimeToCheckTabs(), true);
	assert.equal(await isPaused(), false);

	// must be true if enabled, user has not been away for too long, and not paused
	assert.equal(await isTimeToCheckTabs(), true);
});
