// Fake the browser
import browserFake from 'webextensions-api-fake';
global.browser = browserFake();

import {
    findExpiredTabs,
    removeExpiredTabs
} from '../lib/open-tabs.js';

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
