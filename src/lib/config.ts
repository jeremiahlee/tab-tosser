import { log } from "./utils.js";

async function setTtl(newTtl: number): Promise<void> {
	await browser.storage.local.set({ ttl: newTtl });
	await pause();

	await log(`setTtl: ${newTtl}`);
}

async function getTtl() {
	const storage = await browser.storage.local.get({ ttl: null });

	if (typeof storage.ttl !== "number") {
		throw new Error("`ttl` is not a number.");
	}

	return storage.ttl;
}

async function getLastCheck(): Promise<Date> {
	const { lastCheck }: { lastCheck?: Date | string } = await browser.storage.local.get({ lastCheck: new Date() });

	if (lastCheck instanceof Date) {
		return lastCheck;
	} else if (typeof lastCheck === "string") {
		return new Date(lastCheck);
	} else {
		// TODO: See if new version of TypeScript is smarter
		// Default value specified in storage.local.get. This is just to make TypeScript happy.
		// It complains: Function lacks ending return statement and return type does not include 'undefined'
		return new Date();
	}
}

async function expirationDate(): Promise<number> {
	// Update lastCheck to now
	const now = new Date();
	await browser.storage.local.set({ lastCheck: now });

	const ttl = await getTtl();

	if (ttl > 0) {
		return now.valueOf() - ttl * 24 * 60 * 60 * 1000;
	} else {
		return Number.NEGATIVE_INFINITY;
	}
}

async function clearFromArchiveDate(): Promise<number> {
	const lastCheck = await getLastCheck();
	const ttl = 30; // 30 days from last check

	return lastCheck.valueOf() + ttl * 24 * 60 * 60 * 1000;
}

// Pause Tab Tosser
async function pause(): Promise<void> {
	const ttl = await getTtl();

	if (ttl > 0) {
		const { pauseUntil: currentPauseUntil } = await browser.storage.local.get({ pauseUntil: null });
		const newPauseUntilDate = new Date().valueOf() + ttl * 24 * 60 * 60 * 1000;

		// If already paused, do not extend pause period
		if (currentPauseUntil && (newPauseUntilDate > currentPauseUntil)) {
			return;
		} else {
			await browser.storage.local.set({ pauseUntil: newPauseUntilDate });
			await log(`pausedUntil: ${new Date(newPauseUntilDate).toISOString()}`);
		}
	} else {
		await resume();
	}
}
async function resume(): Promise<void> {
	await browser.storage.local.set({ pauseUntil: null });
	await log(`resumed`);
}
async function isPaused(): Promise<boolean> {
	const storage = await browser.storage.local.get({ pauseUntil: null });

	if (storage.pauseUntil !== null) {
		return true;
	} else {
		return false;
	}
}
async function isTimeToResume(): Promise<boolean> {
	const { pauseUntil } = await browser.storage.local.get({ pauseUntil: null });

	if (typeof pauseUntil !== "number") {
		return false;
	}

	if (new Date().valueOf() > pauseUntil) {
		return true;
	} else {
		return false;
	}
}
async function isBackFromHiatus(): Promise<boolean> {
	const lastCheck = await getLastCheck();
	const ttl = await getTtl();
	const now = new Date().valueOf();

	// If today is March 1 and the browser last ran on Jan 1 with a month TTL,
	// now would be greater than the last run + ttl
	// the user is back from a hiatus
	if (now > lastCheck.valueOf() + ttl * 24 * 60 * 60 * 1000) {
		return true;
	} else {
		return false;
	}
}
async function getNextRun() {
	const { pauseUntil } = await browser.storage.local.get({ pauseUntil: null });

	return new Intl.DateTimeFormat("default", {
		year: "numeric",
		month: "numeric",
		day: "numeric",
		hour: "numeric",
		minute: "numeric",
		hour12: false,
	}).format(new Date(pauseUntil));
}

export {
	isBackFromHiatus,
	clearFromArchiveDate,
	expirationDate,
	getNextRun,
	getTtl,
	isPaused,
	isTimeToResume,
	pause,
	resume,
	setTtl
};
