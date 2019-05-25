// Fake the browser
import browserFake from "webextensions-api-fake";
global.browser = browserFake();

import {
    countClosedTabs,
    totalTabsClosedCount,
    totalTabsClosedCountSince
} from "../dist/lib/stats.js";

QUnit.test("stats: countClosedTabs and totalTabsClosedCount", async function(assert) {
    const initialCount = await totalTabsClosedCount();

    await countClosedTabs(10);
    await countClosedTabs(22);

    assert.equal(await totalTabsClosedCount(), initialCount + 10 + 22);
});

QUnit.test("stats: totalTabsClosedCountSince", async function(assert) {
    assert.equal(await totalTabsClosedCountSince() instanceof Date, true);
});
