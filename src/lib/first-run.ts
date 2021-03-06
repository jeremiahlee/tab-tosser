import {enable, setTtl} from "./config.js";
import {findExpiredTabs, removeExpiredTabs} from "./open-tabs.js";
import {sliderMarks} from "./slider.js";

async function ttlChange() {
    await setTtl(Number((document.getElementById("ttl") as HTMLSelectElement).value));
    await populateTabsToTossWarning();
}

function populateSlider() {
    const select = document.getElementById("ttl")!;

    for (const sliderMark of sliderMarks) {
        select.appendChild(new Option(sliderMark[1], `${sliderMark[0]}`));
    }
}

// TODO: Determine a smart default based on the open tabs
async function setSmartDefaultForSlider() {
    const select = document.getElementById("ttl");
    (select as HTMLSelectElement).value = "30";
    await ttlChange();
}

async function populateTabsToTossWarning() {
    const tossedTabsCount = document.getElementById("immediateCloseQuantity");
    const tossedTabsLabel = document.getElementById("immediateCloseNoun");

    const tossedTabs = await findExpiredTabs();

    tossedTabsCount!.innerText = "" + tossedTabs.length;

    if (tossedTabs.length === 0 || tossedTabs.length > 1) {
        tossedTabsLabel!.innerText = "tabs";
    }
}

// On enable button tap, save the ttl and close the tab
async function enableTap() {
    await removeExpiredTabs();
    await enable();

    // Open options page
    await browser.runtime.openOptionsPage();

    // Close self
    const thisBrowserTab = await browser.tabs.getCurrent();
    if ((typeof thisBrowserTab !== "undefined") && (typeof thisBrowserTab.id !== "undefined")) {
        browser.tabs.remove(thisBrowserTab.id);
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    document.getElementById("ttl")!.addEventListener("change", ttlChange);
    document.getElementById("enableButton")!.addEventListener("click", enableTap, {once: true});
    populateSlider();
    setSmartDefaultForSlider();
});
