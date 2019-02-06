// Fake the browser
import browserFake from 'webextensions-api-fake';
global.browser = browserFake();

import {
    findExpiredTabs,
    removeExpiredTabs
} from '../lib/open-tabs.js';

import {getClosedTabs} from '../lib/closed-tabs.js';

import {setTtl} from '../lib/config.js';

import {
    createTab,
    createPinnedTab,
    createExpiredTab,
    createExpiredPinnedTab
} from "./helpers/tab-creator.js";

QUnit.test("open-tabs: findExpiredTabs", async function(assert) {
    // Set the TTL and then create some tabs to close
    // 3 expired tabs created, but pinned tabs should not be counted
    const ttlFake = 3;
    await setTtl(ttlFake);

    await createTab();
    await createTab();
    await createPinnedTab();
    await createPinnedTab();
    await createExpiredTab(ttlFake);
    await createExpiredTab(ttlFake);
    await createExpiredPinnedTab(ttlFake);

    const expiredTabs = await findExpiredTabs();
    assert.equal(expiredTabs.length, 2);
});

QUnit.test("open-tabs: removeExpiredTabs", async function(assert) {
    let initialOpenTabs = await browser.tabs.query({
        active: false,
        pinned: false
    });

    await removeExpiredTabs();

    let remainingOpenTabs = await browser.tabs.query({
        active: false,
        pinned: false
    });

    assert.equal(initialOpenTabs.length - remainingOpenTabs.length, 2);
});

QUnit.test("open-tabs: removeExpiredTabs title check", async function(assert) {
    // Firefox for Android does not default tab title to a string
    // Tab Tosser should use the URL as the page title if none exists
    
    // Missing title tab test
    const url = `https://www.example.com/titleless-tab`;

    await browser.tabs.create({
        active: false,
        lastAccessed: 1000,
        url: url,
        title: undefined
    });

    await removeExpiredTabs();

    let archivedTabs = await getClosedTabs();

    const missingTitleTab = archivedTabs[archivedTabs.length - 1];
    assert.equal(missingTitleTab[1].slice(0,10), url.slice(0,10));

    // Short title test
    await browser.tabs.create({
        active: false,
        lastAccessed: 1000,
        url: url,
        title: "123456789"
    });

    await removeExpiredTabs();

    archivedTabs = await getClosedTabs();

    const shortTitleTab = archivedTabs[archivedTabs.length - 1];
    assert.equal(shortTitleTab[1].slice(0,10), url.slice(0,10));
});
