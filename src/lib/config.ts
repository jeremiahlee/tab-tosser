function enable(): Promise<void> {
	return browser.storage.local.set({
		enabled: true,
		initDate: new Date()
	});
}

function disable(): Promise<void> {
	return browser.storage.local.set({
		enabled: false
	});
}

async function isEnabled(): Promise<boolean> {
	const { enabled } = await browser.storage.local.get({ enabled: false });
	return enabled;
}

function setTtl(newTtl: number): Promise<void> {
	return browser.storage.local.set({ ttl: newTtl });
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

	return now.valueOf() - ttl * 24 * 60 * 60 * 1000;
}

async function clearFromArchiveDate(): Promise<number> {
	const lastCheck = await getLastCheck();
	const ttl = await getTtl();

	return lastCheck.valueOf() + ttl * 24 * 60 * 60 * 1000;
}

// Pause Tab Tosser for 1 week
async function pause(): Promise<void> {
	const ttl = await getTtl();

	let pausePeriod: number = 7;

	if (ttl <= 7) {
		pausePeriod = ttl - 1;
	}

	const pauseUntilDate = new Date().valueOf() + pausePeriod * 24 * 60 * 60 * 1000;
	await browser.storage.local.set({ pauseUntil: pauseUntilDate });
}
async function resume(): Promise<void> {
	await browser.storage.local.set({ pauseUntil: null });
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
async function backFromHiatus(): Promise<boolean> {
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

export {
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
};
