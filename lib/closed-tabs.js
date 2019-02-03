import {countClosedTabs} from './stats.js';

async function getClosedTabs() {
    let storage = await browser.storage.local.get({ closedTabs: [] });

    return storage.closedTabs;
}

async function archiveTabs(tabsArchive) {
    let closedTabs = await getClosedTabs();

    // Add the newly closed tabs
    closedTabs.push(...tabsArchive);

    // Clean up really old tabs
    closedTabs = purgeArchivedTabs(closedTabs);

    // Save the running count of closed tabs
    await countClosedTabs(tabsArchive.length); 

    // Save the tab archive
    // Wait, as not doing so can lead to tabs not getting saved in first run
    await save(closedTabs);
}

// Only keep tabs that have a purge date in the future
function purgeArchivedTabs(tabs) {
    const now = new Date().valueOf();

    let filteredTabs = tabs.filter((tab) => {
        return (tab[3] > now);
    });

    // Only keep last 1,000 tabs
    if (filteredTabs.length > 1000) {
        filteredTabs.splice(0, filteredTabs.length - 1000);
    }

    return filteredTabs;
}

async function clearArchivedTabsHistory() {
    try {
        await save([]);
        return true;
    } catch (err) {
        return false;
    }
}

async function save(tabsArchive) {
    return browser.storage.local.set({closedTabs: tabsArchive}); // Promise
}

export {
    clearArchivedTabsHistory,
    getClosedTabs,
    archiveTabs
};