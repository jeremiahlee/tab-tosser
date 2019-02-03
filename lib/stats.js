async function countClosedTabs(numberOfNewTabsClosed) {
    let currentTotalTabsClosedCount = await totalTabsClosedCount();

    return browser.storage.local.set({
        statTabsClosed: currentTotalTabsClosedCount + numberOfNewTabsClosed
    });
}

async function totalTabsClosedCount() {
    const storage = await browser.storage.local.get({statTabsClosed: 0});
    return storage.statTabsClosed;
}

async function totalTabsClosedCountSince() {
    const storage = await browser.storage.local.get({initDate: new Date()});

    if (storage.initDate instanceof Date === true) {
        return storage.initDate;
    } else if (typeof storage.initDate === "string") {
        return new Date(storage.initDate);
    }
}

export {
    countClosedTabs,
    totalTabsClosedCount,
    totalTabsClosedCountSince
};
