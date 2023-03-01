async function countClosedTabs(numberOfNewTabsClosed: number): Promise<void> {
	const currentTotalTabsClosedCount: number = await totalTabsClosedCount();

	return browser.storage.local.set({
		statTabsClosed: currentTotalTabsClosedCount + numberOfNewTabsClosed
	});
}

async function totalTabsClosedCount(): Promise<number> {
	const { statTabsClosed } = await browser.storage.local.get({ statTabsClosed: 0 });
	return statTabsClosed;
}

async function totalTabsClosedCountSince(): Promise<Date> {
	const { initDate }: { initDate?: Date | string } = await browser.storage.local.get({ initDate: new Date() });

	if (initDate instanceof Date) {
		return initDate;
	} else if (typeof initDate === "string") {
		return new Date(initDate);
	} else {
		// TODO: See if new version of TypeScript is smarter
		// Default value specified in storage.local.get. This is just to make TypeScript happy.
		// It complains: Function lacks ending return statement and return type does not include 'undefined'
		return new Date();
	}
}

export {
	countClosedTabs,
	totalTabsClosedCount,
	totalTabsClosedCountSince
};
