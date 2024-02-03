import { log } from "./utils.js";
import { sliderMarkTtls } from "./slider.js";

async function setTtl(newTtl: number): Promise<void> {
	// Validate TTL
	if (!sliderMarkTtls.includes(newTtl)) {
		throw new Error("`ttl` is not a valid value.");
	}

	const currentValue = await getTtl();

	if (newTtl !== currentValue) {
		await browser.storage.local.set({ ttl: newTtl });
		await log(`setTtl: ${newTtl}`);

		if (newTtl > 0) {
			await pause(newTtl);
		} else {
			await resume();
		}
	} else {
		// No value change for the setting
		await log(`setTtl: ${newTtl} no-op`);
	}
}

async function getTtl(): Promise<number> {
	const { ttl } = await browser.storage.local.get({ ttl: 0 });

	// Confirm TTL is a valid setting value
	// Fail to disabled state (0) if setting no longer valid
	if (sliderMarkTtls.includes(ttl)) {
		return ttl as number; // TypeScript unaware of default to 0
	} else {
		return 0;
	}
}

async function getLastCheck(): Promise<Date> {
	const { lastCheck } = await browser.storage.local.get({ lastCheck: 0 });

	return new Date(lastCheck);
}

async function setLastCheck(newLastCheck: Date): Promise<void> {
	await browser.storage.local.set({ lastCheck: newLastCheck.getTime() });
}

async function expirationDate(): Promise<number> {
	const now = new Date();
	const ttl = await getTtl();

	if (ttl > 0) {
		return now.valueOf() - ttl * 24 * 60 * 60 * 1000;
	} else {
		return Number.NEGATIVE_INFINITY;
	}
}

async function clearFromArchiveDate(closeDate: Date): Promise<number> {
	const daysToClearAfter = 30; // TODO: future configuration

	return closeDate.valueOf() + daysToClearAfter * 24 * 60 * 60 * 1000;
}

// Determine if Tab Tosser should run
async function isTimeToCheckTabs(): Promise<boolean> {
	// Get date of last tab age evaluation
	const lastCheck = await getLastCheck();

	// Set date of last tab age evaluation to now
	const now = new Date();
	await setLastCheck(now);

	// 1. Check if disabled
	if (await getTtl() === 0) {
		return false;
	}

	// 2. Check if paused
	const resumeDate: Date | null = await getResumeDate();

	if (resumeDate !== null) {
		// Check if paused period over
		if (new Date().getTime() > resumeDate.getTime()) {
			await resume();
			return true;
		} else {
			return false;
		}
	}

	// 3. Check if this is the first run in 3+ days
	// Give user a chance to be active again before tossing tabs
	// This check must come after check for existing pause to prevent extending pause period set before v3.0.1
	const daysSinceLastCheck = Math.floor((now.getTime() - lastCheck.getTime()) / (24 * 60 * 60 * 1000));

	if (daysSinceLastCheck > 3) {
		await log(`Hiatus detected. Last run was on ${lastCheck.toISOString}`);
		await pause(daysSinceLastCheck);
		return false;
	}

	return true;
}

// Pause Tab Tosser
async function pause(days: number): Promise<void> {
	if (days < 1) {
		await resume();
		return;
	} else if (days > 31) {
		days = 31;
	}

	const pauseUntilDate = new Date().getTime() + days * 24 * 60 * 60 * 1000;
	await browser.storage.local.set({ pauseUntil: pauseUntilDate });

	await log(`pausedUntil: ${new Date(pauseUntilDate).toISOString()}`);
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
async function getResumeDate(): Promise<Date | null> {
	const { pauseUntil } = await browser.storage.local.get({ pauseUntil: null });

	if (pauseUntil === null) {
		return null;
	} else {
		return new Date(pauseUntil);
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
	clearFromArchiveDate,
	expirationDate,
	getNextRun,
	getTtl,
	isPaused,
	isTimeToCheckTabs,
	pause,
	resume,
	setLastCheck,
	setTtl
};
