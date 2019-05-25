import {JSDOM} from "jsdom";
global.document = new JSDOM().window.document;

import {formatPageTitle} from "../dist/lib/utils.js";

QUnit.test("utils: formatPageTitle: 40 character max", async function(assert) {
    const tooLongPageTitle = "0123456789 0123456789 0123456789 0123456789";
    const formattedPageTitle = formatPageTitle(tooLongPageTitle);

    assert.equal(formattedPageTitle.length, 40);
});

QUnit.test("utils: formatPageTitle: has ellipsis", async function(assert) {
    const tooLongPageTitle = "0123456789 0123456789 0123456789 0123456789";
    const formattedPageTitle = formatPageTitle(tooLongPageTitle);

    assert.equal(formattedPageTitle, "0123456789 0123456789 0123456789 012345…");
});

QUnit.test("utils: formatPageTitle: trims whitespace", async function(assert) {
    const tooLongPageTitle = "     0123456789 0123456789 0123456789       0123456789";
    // initial trim results in "0123456789 0123456789 0123456789       0123456789"
    // slice results in "0123456789 0123456789 0123456789       "
    // final trim should result in "0123456789 0123456789 0123456789"
    const formattedPageTitle = formatPageTitle(tooLongPageTitle);

    assert.equal(formattedPageTitle, "0123456789 0123456789 0123456789…");
});

QUnit.test("utils: formatPageTitle: no evil characters", async function(assert) {
    const evilPageTitle = `< > & !`; // ! present to preserve space
    const formattedPageTitle = formatPageTitle(evilPageTitle);

    assert.equal(formattedPageTitle.indexOf(`>`), -1);
    assert.equal(formattedPageTitle.indexOf(`<`), -1);
    assert.equal(formattedPageTitle.indexOf(`& `), -1); // note space
});
