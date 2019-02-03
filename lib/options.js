import {sliderMarks} from './slider.js';
import {getClosedTabs, clearArchivedTabsHistory} from './closed-tabs.js';
import {totalTabsClosedCount, totalTabsClosedCountSince} from './stats.js';
import {isPaused, resume} from './config.js';

function saveOptions() {
    browser.storage.local.set({
        ttl: Number(document.querySelector("#ttl").value)
    });
}

async function restoreOptions() {
    let options = await browser.storage.local.get([
        "ttl"
    ]);

    if (typeof options.ttl !== "undefined") {
        document.querySelector("#ttl").value = options.ttl;
    }
}

function populateSlider() {
    let select = document.querySelector("#ttl");

    for (let sliderMark of sliderMarks) {
        select.appendChild(new Option(sliderMark[1], sliderMark[0]));
    }
}

async function populateTossedTabs() {
    const tossedTabsDiv = document.querySelector("#archivedTabsSection");
    const tossedTabsUl = document.querySelector("#archivedTabs");

    let tossedTabs = await getClosedTabs();
    tossedTabs.reverse();

    if (tossedTabs.length === 0) {
        tossedTabsDiv.style.display = "none";
        return;
    }

    let listHtml = '';
    
    for (let tossedTab of tossedTabs) {
        // [tab.url, tab.title, tab.lastAccessed, clearFromArchiveDateCache]
        listHtml += `<li><a rel="noopener noreferrer" target="_blank" href="${tossedTab[0]}">${tossedTab[1]}</a></li>`;
    }
    tossedTabsUl.innerHTML = listHtml;
}

async function populateStats() {
    document.getElementById("totalTabsClosedCount").innerText = await totalTabsClosedCount();

    let dateString = new Date(await totalTabsClosedCountSince()).toISOString().substring(0,10);

    document.getElementById("initDate").innerText = dateString;
}

async function handlePausedState() {
    if (await isPaused() === true) {
        document.getElementById("paused").style.display = "block";
    }
}

function resumeHandler(event) {
    event.preventDefault();
    resume();
    document.getElementById("paused").style.display = "none";
}

async function clearHistoryHandler(event) {
    event.preventDefault();
    if (await clearArchivedTabsHistory() === true) {
        const tossedTabsDiv = document.querySelector("#archivedTabsSection");
        tossedTabsDiv.style.display = "none";
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    populateSlider();
    restoreOptions();
    handlePausedState();
    await populateTossedTabs();
    await populateStats();
    document.getElementById("ttl").addEventListener("change", saveOptions);
    document.getElementById("resumeLink").addEventListener("click", resumeHandler);
    document.getElementById("clearHistoryLink").addEventListener("click", clearHistoryHandler);
});
