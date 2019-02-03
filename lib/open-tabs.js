import {clearFromArchiveDate, expirationDate} from './config.js';
import {archiveTabs} from './closed-tabs.js';
import {sliderMarks} from './slider.js';
import {formatPageTitle} from './utils.js';

async function findExpiredTabs() {
    // Get all non-pinned tabs
    let tabs = await browser.tabs.query({
        pinned: false
    });

    // Determine which tabs to remove
    const expiredTabs = [];
    const tabExpirationDate = await expirationDate();

    for (let tab of tabs) {
        if (tab.lastAccessed < tabExpirationDate) {
            expiredTabs.push(tab);
        }
    }
    
    return expiredTabs;
}

// Not used yet. To be used for smart default on first run.
async function findExpiredTabsByLevel() {
    // Get all non-pinned tabs
    let tabs = await browser.tabs.query({
        pinned: false
    });

    // Sort tabs ascending by lastAccessed
    tabs.sort(function(a, b) {
        if (a.lastAccessed < b.lastAccessed) {
            return -1;
        } else if (a.lastAccessed > b.lastAccessed) {
            return 1;
        } else {
            return 0;
        }
    });

    // Get the expiration date for each slider mark
    const now = new Date(); 
    let expirationDates = [];

    for (let sliderMark of sliderMarks) {
        expirationDates.push(now.valueOf() - (sliderMark * 86400000));
    }

    // Determine how many tabs would be removed with each TTL
    let expiredTabsByLevel = [];
    let numberOfTabsAffected = 0;

    let expirationDate = expirationDates.shift();

    dateLoop:
    for (let tab of tabs) {
        let evaluated = false;

        while (evaluated === false) {
            if (tab.lastAccessed < expirationDate) {
                numberOfTabsAffected++;
                evaluated = true;
            } else {
                expiredTabsByLevel.push(numberOfTabsAffected);

                expirationDate = expirationDates.shift();

                if (typeof expirationDate === "undefined") {
                    break dateLoop;
                }
            }
        }
    }

    return expiredTabsByLevel;
}

async function removeTabs(expiredTabs) {
    if (expiredTabs.length === 0) {
        return;
    }

    // Create array of tab ids to remove
    const expiredTabIds = expiredTabs.map((tab) => tab.id);

    // Run cleanup on archived tabs
    const clearFromArchiveDateCache = await clearFromArchiveDate();

    // Prepare expired tabs for archival.
    // Do not store private window tabs in the archive.
    const expiredTabLogs = expiredTabs
        .filter(tab => !tab.incognito)
        .map((tab) => {
            return [
                tab.url, 
                formatPageTitle(tab.title), 
                tab.lastAccessed, 
                clearFromArchiveDateCache
            ];
        });

    // Remove and archive
    await browser.tabs.remove(expiredTabIds);
    await archiveTabs(expiredTabLogs);
}

async function removeExpiredTabs() {
    const expiredTabs = await findExpiredTabs();
    return removeTabs(expiredTabs);
}

export {
    findExpiredTabs,
    removeExpiredTabs
};